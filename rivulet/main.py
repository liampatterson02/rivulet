#!/usr/bin/env python3
import asyncio
from aiohttp import web
import logging
from rivulet.config import Config
from rivulet.ssdp import start_ssdp_server
from rivulet.web_handlers import init_web_app
from rivulet.m3u_parser import parse_m3u
from rivulet.utils import get_local_ip

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('rivulet')

async def main():
    config = Config()
    ip_address = get_local_ip()
    config.IP_ADDRESS = ip_address  # Update IP address in config
    logger.info(f"Local IP Address: {ip_address}")

    channels = await parse_m3u(config.HLS_PROXY_M3U_URL)
    config.CHANNELS = channels

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

if __name__ == '__main__':
    asyncio.run(main())
