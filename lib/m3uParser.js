/**
 * M3U Parser for HLS (M3U8)
 * - Fetches M3U/M3U8 playlist.
 * - Supports both #EXTINF and #EXT-X-STREAM-INF lines.
 * - If the playlist cannot be parsed or is invalid, logs a warning and returns an empty list.
 * - Does not crash the entire program.
 */

const fetch = require('node-fetch');

async function parseM3U(url, backupQualitySuffixes) {
  let resp;
  try {
    resp = await fetch(url);
  } catch (e) {
    console.warn('Warning: Unable to fetch M3U playlist:', e.message);
    return []; // Return empty on fetch error
  }

  if (!resp.ok) {
    console.warn(`Warning: Failed to fetch M3U playlist. HTTP status: ${resp.status}`);
    return []; // Return empty if not OK
  }

  let text;
  try {
    text = await resp.text();
  } catch (e) {
    console.warn('Warning: Failed to read M3U response text:', e.message);
    return [];
  }

  // M3U lines
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // We'll handle two types of entries:
  // 1) #EXTINF lines (classic M3U)
  // 2) #EXT-X-STREAM-INF lines (HLS master playlists)
  //
  // For #EXTINF:
  //   #EXTINF:-1,<Channel Name>
  //   http://stream-url
  //
  // For #EXT-X-STREAM-INF:
  //   #EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=...
  //   http://variant-url

  const entries = [];
  let current = null;
  let expectingURLFor = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('#EXTINF')) {
      // Classic M3U channel
      const nameMatch = line.match(/,(.*)$/);
      const fullName = nameMatch ? nameMatch[1].trim() : 'NoName';
      expectingURLFor = { fullName };
    } else if (line.startsWith('#EXT-X-STREAM-INF')) {
      // HLS variant line
      // #EXT-X-STREAM-INF lines don't contain the channel name directly, often just qualities.
      // We can create a pseudo name based on BANDWIDTH or RESOLUTION if we want, but let's just call them variants.
      // Attempt to derive a name from the line, or use a generic name if not found.
      // Example line: #EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360,NAME="360p"
      // We'll prefer the NAME attribute if present:
      let fullName = 'HLS Variant Channel';
      const nameAttrMatch = line.match(/NAME="([^"]+)"/);
      if (nameAttrMatch) {
        fullName = nameAttrMatch[1].trim();
      }
      expectingURLFor = { fullName };
    } else if (line.startsWith('#')) {
      // Some other tag we don't handle directly, skip
    } else {
      // This should be a URL line if we were expecting a URL for a channel
      if (expectingURLFor) {
        expectingURLFor.url = line;
        entries.push(expectingURLFor);
        expectingURLFor = null;
      }
    }
  }

  // If we found no entries, warn and return empty
  if (entries.length === 0) {
    console.warn('Warning: No valid channels found in the M3U/M3U8 playlist.');
    return [];
  }

  // Group channels by baseName + variants
  // This is the same logic as before, but we handle the case where HLS variants might appear as multiple entries.
  const grouped = {};

  entries.forEach(e => {
    const parts = e.fullName.split(' ');
    const lastPart = parts[parts.length - 1];
    let baseName;
    let quality;
    if (backupQualitySuffixes.includes(lastPart)) {
      baseName = parts.slice(0, -1).join(' ');
      quality = lastPart;
    } else {
      baseName = e.fullName;
      quality = 'FHD';
    }

    if (!grouped[baseName]) {
      grouped[baseName] = {
        baseName,
        variants: []
      };
    }
    grouped[baseName].variants.push({
      quality: quality,
      url: e.url
    });
  });

  // Assign channel numbers incrementally
  let number = 100;
  const finalList = Object.keys(grouped).map(key => {
    const g = grouped[key];
    return {
      name: g.baseName,
      number: number++,
      variants: g.variants
    };
  });

  // If finalList is empty, warn but still return empty
  if (finalList.length === 0) {
    console.warn('Warning: M3U parsed but no channels found.');
  }

  return finalList;
}

module.exports = {
  parseM3U
};
