import React, { useEffect, useState } from 'react';
import { TextField, Button, Typography, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import { getConfig, saveConfig } from '../services/api';

function ConfigurationPage() {
  const [config, setConfig] = useState({
    m3uUrl: '',
    numTuners: 1,
    friendlyName: '',
    serverHostname: '',
    videoCodec: 'none',
    audioCodec: 'copy',
    videoBitrate: '',
    audioBitrate: '',
    scale: '',
    suffixes: []
  });

  const [newSuffix, setNewSuffix] = useState('');

  useEffect(() => {
    getConfig().then(setConfig).catch(err => console.warn(err));
  }, []);

  const handleChange = (field) => (event) => {
    let val = event.target.value;
    if (field === 'numTuners') {
      val = parseInt(val, 10) || 1;
    }
    setConfig({ ...config, [field]: val });
  };

  const handleSave = () => {
    if (config.videoCodec === 'none') {
      // If no video codec, disable transcoding fields
      config.audioCodec = 'copy';
      config.videoBitrate = '';
      config.audioBitrate = '';
      config.scale = '';
    }
    saveConfig(config).then(() => {
      alert('Configuration saved successfully.');
    }).catch(err => alert('Save failed.'));
  };

  const handleAddSuffix = () => {
    if (newSuffix.trim()) {
      setConfig({ ...config, suffixes: [...config.suffixes, newSuffix.trim()] });
      setNewSuffix('');
    }
  };

  const handleRemoveSuffix = (suffix) => {
    setConfig({ ...config, suffixes: config.suffixes.filter(s => s !== suffix) });
  };

  return (
    <div>
      <Typography variant="h4">Configuration</Typography>
      <TextField label="M3U URL" value={config.m3uUrl} onChange={handleChange('m3uUrl')} fullWidth margin="normal" />
      <TextField label="Friendly Name" value={config.friendlyName} onChange={handleChange('friendlyName')} fullWidth margin="normal" />
      <TextField label="Server Hostname" value={config.serverHostname} onChange={handleChange('serverHostname')} fullWidth margin="normal" />

      <FormControl fullWidth margin="normal">
        <InputLabel>Number of Tuners</InputLabel>
        <Select value={config.numTuners} onChange={handleChange('numTuners')}>
          {[1,2,3,4,5,6].map(num => <MenuItem key={num} value={num}>{num}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel>Video Codec</InputLabel>
        <Select value={config.videoCodec} onChange={handleChange('videoCodec')}>
          <MenuItem value="none">none</MenuItem>
          <MenuItem value="libx264">libx264</MenuItem>
          <MenuItem value="libx265">libx265</MenuItem>
          <MenuItem value="libvpx">libvpx</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal" disabled={config.videoCodec === 'none'}>
        <InputLabel>Audio Codec</InputLabel>
        <Select value={config.audioCodec} onChange={handleChange('audioCodec')} disabled={config.videoCodec === 'none'}>
          <MenuItem value="aac">aac</MenuItem>
          <MenuItem value="libmp3lame">libmp3lame</MenuItem>
          <MenuItem value="copy">copy</MenuItem>
        </Select>
      </FormControl>

      {config.videoCodec !== 'none' && (
        <>
          <TextField label="Video Bitrate" value={config.videoBitrate} onChange={handleChange('videoBitrate')} fullWidth margin="normal" />
          <TextField label="Audio Bitrate" value={config.audioBitrate} onChange={handleChange('audioBitrate')} fullWidth margin="normal" />
          <TextField label="Scale" value={config.scale} onChange={handleChange('scale')} fullWidth margin="normal" />
        </>
      )}

      <Typography variant="h6" style={{marginTop:'20px'}}>Backup Quality Suffixes</Typography>
      {config.suffixes.map((suffix, idx) => (
        <Chip key={idx} label={suffix} onDelete={() => handleRemoveSuffix(suffix)} style={{ margin: 4 }} />
      ))}
      <div style={{ marginTop: '10px', marginBottom: '10px' }}>
        <TextField label="New Suffix" value={newSuffix} onChange={(e) => setNewSuffix(e.target.value)} />
        <Button onClick={handleAddSuffix} variant="contained" style={{ marginLeft: '10px' }}>Add</Button>
      </div>

      <Button onClick={handleSave} variant="contained" color="primary">Save Configuration</Button>
    </div>
  );
}

export default ConfigurationPage;
