import aiohttp_jinja2
import jinja2
from aiohttp import web
import urllib.parse
import logging
from rivulet.guide_generator import generate_guide_xml
import os
import datetime

logger = logging.getLogger('rivulet.web_handlers')

def init_web_app(config):
    app = web.Application()
    app['config'] = config  # Store config in app context

    # Initialize template rendering
    templates_path = os.path.join(os.path.dirname(__file__), 'templates')
    aiohttp_jinja2.setup(app, loader=jinja2.FileSystemLoader(templates_path))

    # Add routes
    app.router.add_get('/', index)
    app.router.add_get('/channel/{channel_id}', channel_detail)
    app.router.add_get('/static/{filename}', static_handler)

    # Existing handlers
    app.router.add_get('/discover.json', discover)
    app.router.add_get('/lineup_status.json', lineup_status)
    app.router.add_get('/lineup.json', lineup)
    app.router.add_get('/lineup.post', lineup_post)
    app.router.add_post('/lineup.post', lineup_post)
    app.router.add_get('/stream', stream)
    if config.EPG_ENABLE:
        app.router.add_get('/guide.xml', guide)  # Retain the guide endpoint
    return app

@aiohttp_jinja2.template('index.html')
async def index(request):
    config = request.app['config']
    base_url = f'http://{config.IP_ADDRESS}:{config.APP_PORT}' if config.BASE_URL_SETTING == 'auto' else config.BASE_URL_SETTING
    channels = []
    for ch in config.CHANNELS:
        ch_copy = ch.copy()
        ch_copy['stream_url'] = f"{base_url}/stream?channel={urllib.parse.quote(ch['id'])}"
        channels.append(ch_copy)
    return {'channels': channels, 'year': datetime.datetime.now().year}

@aiohttp_jinja2.template('channel.html')
async def channel_detail(request):
    config = request.app['config']
    channel_id = request.match_info['channel_id']
    channel = next((ch for ch in config.CHANNELS if ch['id'] == channel_id), None)
    if not channel:
        raise web.HTTPNotFound(text='Channel not found')

    base_url = f'http://{config.IP_ADDRESS}:{config.APP_PORT}' if config.BASE_URL_SETTING == 'auto' else config.BASE_URL_SETTING
    stream_url = f"{base_url}/stream?channel={urllib.parse.quote(channel['id'])}"
    channel['stream_url'] = stream_url
    return {'channel': channel, 'year': datetime.datetime.now().year}

async def static_handler(request):
    filename = request.match_info.get('filename')
    static_path = os.path.join(os.path.dirname(__file__), 'static')
    file_path = os.path.join(static_path, filename)
    if not os.path.isfile(file_path):
        raise web.HTTPNotFound()
    return web.FileResponse(file_path)

# Existing handlers (discover, lineup, stream, guide, etc.)

async def discover(request):
    config = request.app['config']
    logger.info("Received /discover.json request")
    base_url = f'http://{config.IP_ADDRESS}:{config.APP_PORT}' if config.BASE_URL_SETTING == 'auto' else config.BASE_URL_SETTING
    return web.json_response({
        "FriendlyName": config.FRIENDLY_NAME,
        "ModelNumber": config.MODEL_NUMBER,
        "FirmwareName": config.FIRMWARE_NAME,
        "TunerCount": config.TUNER_COUNT,
        "FirmwareVersion": config.FIRMWARE_VERSION,
        "DeviceID": config.DEVICE_ID,  # Use a valid 8-digit hex number
        "DeviceAuth": "test1234",
        "BaseURL": base_url,
        "LineupURL": f'{base_url}/lineup.json'
    })

async def lineup_status(request):
    logger.info("Received /lineup_status.json request")
    return web.json_response({
        "ScanInProgress": 0,
        "ScanPossible": 1,
        "Source": "Cable",
        "SourceList": ["Cable"]
    })

async def lineup(request):
    config = request.app['config']
    logger.info("Received /lineup.json request")
    base_url = f'http://{config.IP_ADDRESS}:{config.APP_PORT}' if config.BASE_URL_SETTING == 'auto' else config.BASE_URL_SETTING
    lineup = []
    for ch in config.CHANNELS:
        lineup.append({
            "GuideNumber": str(ch['number']),
            "GuideName": ch['name'],
            "URL": f"{base_url}/stream?channel={urllib.parse.quote(ch['id'])}"
        })
    return web.json_response(lineup)

async def stream(request):
    config = request.app['config']
    from urllib.parse import unquote, parse_qs

    # Log the raw request for debugging
    logger.info(f"Received request: {request.method} {request.rel_url}")

    # Extract the 'channel' parameter
    channel_param = request.query.get('channel')
    if not channel_param:
        logger.warning("Channel parameter not provided")
        return web.Response(status=400, text='Bad Request: Channel parameter missing')

    # Decode any URL-encoded characters
    channel_param = unquote(channel_param)
    logger.info(f"Raw channel parameter: {channel_param}")

    # Split 'channel_param' on '?' to separate the channel ID from any extra parameters
    if '?' in channel_param:
        channel_id, extra_params_str = channel_param.split('?', 1)
        extra_params = parse_qs(extra_params_str)
    else:
        channel_id = channel_param
        extra_params = {}

    logger.info(f"Extracted channel ID: {channel_id}")
    logger.info(f"Extra parameters: {extra_params}")

    # Now find the channel with this channel_id
    channel = next((ch for ch in config.CHANNELS if ch['id'] == channel_id), None)
    if not channel:
        logger.warning(f"Channel not found: {channel_id}")
        return web.Response(status=404, text='Channel not found')

    url = channel['url']
    logger.info(f"Redirecting stream to URL: {url}")

    # Return an HTTP redirect to the actual stream URL
    raise web.HTTPFound(location=url)

async def lineup_post(request):
    logger.info("Received /lineup.post request")
    return web.Response(text='')

async def guide(request):
    config = request.app['config']
    if not config.EPG_ENABLE:
        logger.info("EPG is disabled in configuration")
        return web.Response(status=404, text='EPG is disabled')
    logger.info("Received /guide.xml request")
    guide_xml = generate_guide_xml(config.CHANNELS)
    return web.Response(text=guide_xml, content_type='application/xml')
