import configparser
import os
import uuid

class Config:
    def __init__(self):
        # Load configuration from config.ini with inline comment support
        self.config = configparser.ConfigParser(
            inline_comment_prefixes=('#', ';')
        )
        self.config.read('config.ini')

        # General Configuration
        self.HLS_PROXY_M3U_URL = os.environ.get(
            'HLS_PROXY_M3U_URL',
            self.config.get('DEFAULT', 'HLS_PROXY_M3U_URL', fallback='http://localhost:8080/m3u8/?output=ts')
        )
        self.APP_HOST = os.environ.get(
            'APP_HOST',
            self.config.get('DEFAULT', 'APP_HOST', fallback='0.0.0.0')
        )
        self.APP_PORT = int(os.environ.get(
            'APP_PORT',
            self.config.getint('DEFAULT', 'APP_PORT', fallback=5004)
        ))
        self.TUNER_COUNT = int(os.environ.get(
            'TUNER_COUNT',
            self.config.getint('DEFAULT', 'TUNER_COUNT', fallback=2)
        ))
        self.DEVICE_ID = os.environ.get(
            'DEVICE_ID',
            self.config.get('DEFAULT', 'DEVICE_ID', fallback='12345678')
        )
        self.FRIENDLY_NAME = os.environ.get(
            'FRIENDLY_NAME',
            self.config.get('DEFAULT', 'FRIENDLY_NAME', fallback='HDHomeRun DUAL')
        )
        self.MODEL_NUMBER = os.environ.get(
            'MODEL_NUMBER',
            self.config.get('DEFAULT', 'MODEL_NUMBER', fallback='HDHR3-US')
        )
        self.FIRMWARE_NAME = os.environ.get(
            'FIRMWARE_NAME',
            self.config.get('DEFAULT', 'FIRMWARE_NAME', fallback='hdhomerun3_atsc')
        )
        self.FIRMWARE_VERSION = os.environ.get(
            'FIRMWARE_VERSION',
            self.config.get('DEFAULT', 'FIRMWARE_VERSION', fallback='20201021')
        )
        self.BASE_URL_SETTING = os.environ.get(
            'BASE_URL',
            self.config.get('DEFAULT', 'BASE_URL', fallback='auto')
        )
        self.EPG_ENABLE = self.str_to_bool(os.environ.get(
            'EPG_ENABLE',
            self.config.get('DEFAULT', 'EPG_ENABLE', fallback='True')
        ))

        # Data directory for storing persistent data
        self.DATA_DIR = os.environ.get(
            'DATA_DIR',
            self.config.get('DEFAULT', 'DATA_DIR', fallback='./data')
        )
        # Ensure the data directory exists
        os.makedirs(self.DATA_DIR, exist_ok=True)

        # Internal variables
        self.DEVICE_UUID = str(uuid.uuid4())
        self.IP_ADDRESS = None  # To be set later
        self.CHANNELS = []

    @staticmethod
    def str_to_bool(value):
        return value.lower() in ('yes', 'true', '1')
