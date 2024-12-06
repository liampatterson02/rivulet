/**
 * M3U Parser
 * Fetch and parse M3U. Channels with suffixes (FHD, HD, SD) are merged.
 * The resulting channel name does NOT contain the suffix. Variants are stored for fallback.
 */

const fetch = require('node-fetch');

async function parseM3U(url, backupQualitySuffixes) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Failed to fetch M3U");
  const text = await resp.text();
  const lines = text.split('\n');
  const entries = [];
  let current = null;

  for (const line of lines) {
    if (line.startsWith('#EXTINF')) {
      const nameMatch = line.match(/,(.*)$/);
      const fullName = nameMatch ? nameMatch[1].trim() : 'NoName';
      current = { fullName, url: null };
    } else if (line.startsWith('http') && current) {
      current.url = line.trim();
      entries.push(current);
      current = null;
    }
  }

  // Group channels by baseName (removing suffixes)
  const grouped = {};
  for (const e of entries) {
    const parts = e.fullName.split(' ');
    const lastPart = parts[parts.length - 1];
    let baseName;
    let quality;
    if (backupQualitySuffixes.includes(lastPart)) {
      baseName = parts.slice(0, -1).join(' ');
      quality = lastPart;
    } else {
      baseName = e.fullName;
      quality = 'FHD'; // Default highest quality if no suffix
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
  }

  let number = 100;
  const finalList = Object.keys(grouped).map(key => {
    const g = grouped[key];
    return {
      name: g.baseName,
      number: number++,
      variants: g.variants
    };
  });

  return finalList;
}

module.exports = {
  parseM3U
};
