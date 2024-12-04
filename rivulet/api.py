from aiohttp import web
import logging

logger = logging.getLogger('rivulet.api')

def init_api_routes(app):
    app.router.add_get('/api/channels', api_channels)
    app.router.add_get('/api/channels/{channel_id}', api_channel_detail)
    # Future API routes can be added here

async def api_channels(request):
    config = request.app['config']
    return web.json_response(config.CHANNELS)

async def api_channel_detail(request):
    config = request.app['config']
    channel_id = request.match_info['channel_id']
    channel = next((ch for ch in config.CHANNELS if ch['id'] == channel_id), None)
    if channel:
        return web.json_response(channel)
    else:
        return web.json_response({'error': 'Channel not found'}, status=404)
