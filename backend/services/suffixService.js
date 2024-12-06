'use strict';

/**
 * Sort channel variants by suffixes. The first matching suffix that appears
 * at the end of a variant URL (or name) is preferred. If none match,
 * original order is retained.
 * 
 * For simplicity, we'll just prioritize variants that contain suffixes in their URL.
 */
function sortChannelsBySuffixes(variants, suffixes) {
  if (!suffixes || suffixes.length === 0) return variants;

  // For each variant, find if it matches any suffix
  // We'll create a priority based on the first suffix match
  return variants.slice().sort((a, b) => {
    const aPriority = suffixes.findIndex(suf => a.url.toLowerCase().includes(suf.toLowerCase()));
    const bPriority = suffixes.findIndex(suf => b.url.toLowerCase().includes(suf.toLowerCase()));

    // If no match, indexOf returns -1
    const aVal = aPriority === -1 ? suffixes.length : aPriority;
    const bVal = bPriority === -1 ? suffixes.length : bPriority;

    return aVal - bVal;
  });
}

module.exports = { sortChannelsBySuffixes };
