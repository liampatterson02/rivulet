#!/usr/bin/env python3
import asyncio
from aiohttp import web
import logging
import os
import json
from rivulet.config import Config
from rivulet.ssdp import start_ssdp_server
from rivulet.web_handlers import init_web_app
from rivulet.m3u_parser import parse_m3u
from rivulet.utils import get_local_ip
from rivulet.api import init_api_routes

# Configure logging (INFO)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('rivulet')

async def main():
    config = Config()
    ip_address = get_local_ip()
    config.IP_ADDRESS = ip_address  # Update IP address in config
    logger.info(f"Local IP Address: {ip_address}")

    app = init_web_app(config)
    init_api_routes(app)  # Initialize API routes

    channels = await parse_m3u(config.HLS_PROXY_M3U_URL)
    config.CHANNELS = channels

    # Load custom channel numbers
    load_custom_channel_numbers(config)

    app = init_web_app(config)
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, config.APP_HOST, config.APP_PORT)
    await site.start()
    logger.info(f"Server started at http://{ip_address}:{config.APP_PORT}")

    # Start SSDP server
    transport, protocol = await start_ssdp_server(config)
    try:
        while True:
            await asyncio.sleep(3600)
    except KeyboardInterrupt:
        pass
    finally:
        transport.close()
        await runner.cleanup()
        logger.info("Server shut down")

def load_custom_channel_numbers(config):
    channel_numbers_file = os.path.join(config.DATA_DIR, 'channel_numbers.json')
    if os.path.exists(channel_numbers_file):
        with open(channel_numbers_file, 'r') as f:
            custom_numbers = json.load(f)
        # Update channels with custom numbers
        for ch in config.CHANNELS:
            ch_id = ch['id']
            if ch_id in custom_numbers:
                ch['custom_number'] = custom_numbers[ch_id]
            else:
                ch['custom_number'] = str(ch['number'])  # Use default number as string
    else:
        # No custom numbers, set custom_number to default
        for ch in config.CHANNELS:
            ch['custom_number'] = str(ch['number'])  # Use default number as string

if __name__ == '__main__':
    asyncio.run(main())
