import aiohttp
import re
import sys
import logging

logger = logging.getLogger('rivulet.m3u_parser')

async def parse_m3u(m3u_url):
    channels = []
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(m3u_url) as resp:
                if resp.status != 200:
                    logger.error(f"Error: Unable to fetch M3U playlist. HTTP status code: {resp.status}")
                    sys.exit(1)
                content = await resp.text()
    except aiohttp.ClientError as e:
        logger.error(f"Error: Cannot connect to HLS-Proxy M3U URL '{m3u_url}': {e}")
        sys.exit(1)
    lines = content.splitlines()
    channel = {}
    for line in lines:
        if line.startswith('#EXTINF:'):
            info = line.split('#EXTINF:')[1]
            match = re.match(r'(.*?),(.*)', info)
            if match:
                channel_info = match.group(2)
                channel['name'] = channel_info.strip()
                # Create a valid channel ID by removing non-alphanumeric characters
                channel['id'] = re.sub(r'\W+', '', channel['name'])
        elif line.startswith('http'):
            channel['url'] = line.strip()
            channels.append(channel)
            channel = {}
    # Assign unique numbers to channels
    for idx, ch in enumerate(channels, start=1):
        ch['number'] = idx
    # Log the parsed channels
    logger.info("Parsed Channels:")
    for ch in channels:
        logger.info(f"Channel {ch['number']}: ID={ch['id']}, Name={ch['name']}, URL={ch['url']}")
    return channels
