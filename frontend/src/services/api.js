export async function getConfig() {
    const res = await fetch('/api/config');
    if (!res.ok) throw new Error('Failed to fetch config');
    return res.json();
  }
  
  export async function saveConfig(conf) {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conf)
    });
    if (!res.ok) throw new Error('Failed to save config');
    return res.json();
  }
  
  export async function getChannels() {
    const res = await fetch('/lineup.json');
    if (!res.ok) throw new Error('Failed to fetch lineup');
    return res.json();
  }
  