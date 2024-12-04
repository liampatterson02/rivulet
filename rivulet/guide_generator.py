import datetime
import xml.etree.ElementTree as ET
import logging

def generate_guide_xml(channels):
    now = datetime.datetime.utcnow()
    start_time = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end_time = start_time + datetime.timedelta(days=1)

    tv = ET.Element('tv')

    for ch in channels:
        # Create channel element
        channel_elem = ET.SubElement(tv, 'channel', id=ch["id"])
        display_name_elem = ET.SubElement(channel_elem, 'display-name')
        display_name_elem.text = ch["name"]
        channel_number_elem = ET.SubElement(channel_elem, 'display-number')
        channel_number_elem.text = ch["custom_number"]
        url_elem = ET.SubElement(channel_elem, 'url')
        url_elem.text = ch["url"]

        # Create programme element
        programme_elem = ET.SubElement(tv, 'programme', {
            'start': start_time.strftime("%Y%m%d%H%M%S") + ' +0000',
            'stop': end_time.strftime("%Y%m%d%H%M%S") + ' +0000',
            'channel': ch["id"]
        })
        title_elem = ET.SubElement(programme_elem, 'title')
        title_elem.text = ch["name"]
        desc_elem = ET.SubElement(programme_elem, 'desc')
        desc_elem.text = ''

    # Generate XML string
    guide_xml = ET.tostring(tv, encoding='utf-8', method='xml').decode('utf-8')
    return guide_xml
