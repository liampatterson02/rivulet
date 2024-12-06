import axios from 'axios';

export async function getConfig() {
  const resp = await axios.get('/api/config');
  return resp.data;
}

export async function setConfig(newConfig) {
  const resp = await axios.post('/api/config', newConfig);
  return resp.data;
}

export async function getChannels() {
  const resp = await axios.get('/api/channels');
  return resp.data;
}

export async function getSegments() {
  const resp = await axios.get('/api/segments');
  return resp.data;
}
