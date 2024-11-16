from aiohttp import web
import urllib.parse
import logging
from rivulet.guide_generator import generate_guide_xml

logger = logging.getLogger('rivulet.web_handlers')

def init_web_app(config):
    app = web.Application()
    app['config'] = config  # Store config in app context
    app.router.add_get('/discover.json', discover)
    app.router.add_get('/lineup_status.json', lineup_status)
    app.router.add_get('/lineup.json', lineup)
    app.router.add_get('/lineup.post', lineup_post)
    app.router.add_post('/lineup.post', lineup_post)
    app.router.add_get('/stream', stream)
    if config.EPG_ENABLE:
        app.router.add_get('/guide.xml', guide)
    return app

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
