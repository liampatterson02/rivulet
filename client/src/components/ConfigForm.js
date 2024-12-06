import React, { useState } from 'react';
import { setConfig } from '../api';
import { TextField, Button, Grid, Typography, FormControl, InputLabel, Select, MenuItem, Box, Chip, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ConfigForm({ config, setConfig: updateConfig }) {
  const [localConfig, setLocalConfig] = useState(config);
  const [saveMessage, setSaveMessage] = useState('');
  const [newSuffix, setNewSuffix] = useState('');

  const handleChange = (key, val) => {
    setLocalConfig({...localConfig, [key]: val});
    setSaveMessage('');
  };

  const handleFFChange = (key, val) => {
    setLocalConfig({
      ...localConfig,
      ffmpegOptions: {
        ...localConfig.ffmpegOptions,
        [key]: val
      }
    });
    setSaveMessage('');
  };

  const handleAddSuffix = () => {
    if (newSuffix.trim() !== '' && !localConfig.backupQualitySuffixes.includes(newSuffix.trim())) {
      setLocalConfig({
        ...localConfig,
        backupQualitySuffixes: [...localConfig.backupQualitySuffixes, newSuffix.trim()]
      });
      setNewSuffix('');
      setSaveMessage('');
    }
  };

  const handleRemoveSuffix = (suffixToRemove) => {
    setLocalConfig({
      ...localConfig,
      backupQualitySuffixes: localConfig.backupQualitySuffixes.filter(s => s !== suffixToRemove)
    });
    setSaveMessage('');
  };

  const handleSave = async () => {
    await setConfig(localConfig);
    updateConfig(localConfig);
    setSaveMessage('Configuration saved successfully!');
  };

  const noTranscode = localConfig.ffmpegOptions.videoCodec === 'none';

  return (
    <div style={{marginTop:'1em'}}>
      <Typography variant="h5">General Configuration</Typography>
      <Grid container spacing={2} style={{marginTop:'1em'}}>
        <Grid item xs={12} md={6}>
          <TextField 
            fullWidth 
            label="M3U URL" 
            value={localConfig.m3uUrl} 
            onChange={(e)=>handleChange('m3uUrl', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField 
            fullWidth 
            label="Number of Tuners" 
            value={localConfig.numTuners} 
            onChange={(e)=>handleChange('numTuners', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField 
            fullWidth 
            label="Friendly Name" 
            value={localConfig.friendlyName} 
            onChange={(e)=>handleChange('friendlyName', e.target.value)}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" style={{marginTop:'1em'}}>FFmpeg Settings</Typography>
      <Grid container spacing={2} style={{marginTop:'1em'}}>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Video Codec</InputLabel>
            <Select
              label="Video Codec"
              value={localConfig.ffmpegOptions.videoCodec}
              onChange={(e)=>handleFFChange('videoCodec', e.target.value)}
            >
              <MenuItem value="none">None (no transcoding)</MenuItem>
              <MenuItem value="libx264">libx264</MenuItem>
              <MenuItem value="libx265">libx265</MenuItem>
              <MenuItem value="libvpx">libvpx (VP8/VP9)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth disabled={noTranscode}>
            <InputLabel>Audio Codec</InputLabel>
            <Select
              label="Audio Codec"
              value={localConfig.ffmpegOptions.audioCodec}
              onChange={(e)=>handleFFChange('audioCodec', e.target.value)}
            >
              <MenuItem value="aac">AAC</MenuItem>
              <MenuItem value="libmp3lame">MP3 (libmp3lame)</MenuItem>
              <MenuItem value="copy">Copy (no re-encode)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <TextField 
            fullWidth 
            label="Video Bitrate" 
            value={localConfig.ffmpegOptions.videoBitrate} 
            onChange={(e)=>handleFFChange('videoBitrate', e.target.value)}
            disabled={noTranscode}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField 
            fullWidth 
            label="Audio Bitrate" 
            value={localConfig.ffmpegOptions.audioBitrate} 
            onChange={(e)=>handleFFChange('audioBitrate', e.target.value)}
            disabled={noTranscode}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField 
            fullWidth 
            label="Scale" 
            value={localConfig.ffmpegOptions.scale} 
            onChange={(e)=>handleFFChange('scale', e.target.value)}
            disabled={noTranscode}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" style={{marginTop:'1em'}}>Backup Quality Suffixes</Typography>
      <Box display="flex" flexWrap="wrap" gap={1} marginTop="1em">
        {localConfig.backupQualitySuffixes.map((suffix) => (
          <Chip 
            key={suffix} 
            label={suffix} 
            onDelete={() => handleRemoveSuffix(suffix)} 
            deleteIcon={<DeleteIcon />}
          />
        ))}
      </Box>
      <Box display="flex" alignItems="center" gap={1} marginTop="1em">
        <TextField 
          label="New Suffix" 
          value={newSuffix} 
          onChange={e => setNewSuffix(e.target.value)} 
          size="small"
        />
        <IconButton onClick={handleAddSuffix} color="primary">
          <AddIcon />
        </IconButton>
      </Box>

      <Button variant="contained" color="primary" style={{marginTop:'1em'}} onClick={handleSave}>Save Configuration</Button>
      {saveMessage && <Typography variant="body1" style={{marginTop:'0.5em', color:'green'}}>{saveMessage}</Typography>}
    </div>
  );
}
