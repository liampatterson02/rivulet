import asyncio
import socket
import struct
import logging
from email.utils import formatdate

logger = logging.getLogger('rivulet.ssdp')

SSDP_ADDRESS = '239.255.255.250'
SSDP_PORT = 1900

class SSDPServerProtocol(asyncio.DatagramProtocol):
    def __init__(self, config):
        self.config = config

    def connection_made(self, transport):
        self.transport = transport
        logger.info("SSDP server started")

    def datagram_received(self, data, addr):
        message = data.decode('utf-8', 'ignore')
        logger.debug(f"SSDP datagram received from {addr}: {message}")
        if 'M-SEARCH' in message and ('ssdp:all' in message or 'urn:schemas-upnp-org:device:MediaServer:1' in message):
            base_url = f'http://{self.config.IP_ADDRESS}:{self.config.APP_PORT}' if self.config.BASE_URL_SETTING == 'auto' else self.config.BASE_URL_SETTING
            response = (
                'HTTP/1.1 200 OK\r\n'
                'CACHE-CONTROL: max-age=120\r\n'
                f'DATE: {formatdate(usegmt=True)}\r\n'
                'EXT:\r\n'
                f'LOCATION: {base_url}/discover.json\r\n'
                'SERVER: Custom/1.0 UPnP/1.0 Proc/1.0\r\n'
                'ST: urn:schemas-upnp-org:device:MediaServer:1\r\n'
                f'USN: uuid:{self.config.DEVICE_UUID}::urn:schemas-upnp-org:device:MediaServer:1\r\n'
                '\r\n'
            )
            self.transport.sendto(response.encode('utf-8'), addr)
            logger.debug(f"SSDP response sent to {addr}")

async def start_ssdp_server(config):
    # Create the UDP socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
    sock.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_TTL, 2)
    sock.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_LOOP, 1)

    # Bind to the SSDP port
    sock.bind(('', SSDP_PORT))

    # Join the multicast group
    group = socket.inet_aton(SSDP_ADDRESS)
    mreq = struct.pack('4s4s', group, socket.inet_aton(config.IP_ADDRESS))
    sock.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)

    # Create the datagram endpoint
    loop = asyncio.get_running_loop()
    transport, protocol = await loop.create_datagram_endpoint(
        lambda: SSDPServerProtocol(config),
        sock=sock
    )
    return transport, protocol
