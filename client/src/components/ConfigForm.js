import React, { useState } from 'react';
import { setConfig } from '../api';
import { TextField, Button, Grid, Typography } from '@mui/material';

export default function ConfigForm({ config, setConfig: updateConfig }) {
  const [localConfig, setLocalConfig] = useState(config);

  const handleChange = (key, val) => {
    setLocalConfig({...localConfig, [key]: val});
  };

  const handleFFChange = (key, val) => {
    setLocalConfig({...localConfig, ffmpegOptions: {...localConfig.ffmpegOptions, [key]: val}});
  };

  const handleSave = async () => {
    await setConfig(localConfig);
    updateConfig(localConfig);
  };

  return (
    <div style={{marginTop:'1em'}}>
      <Typography variant="h5">General Configuration</Typography>
      <Grid container spacing={2} style={{marginTop:'1em'}}>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="M3U URL" value={localConfig.m3uUrl} onChange={(e)=>handleChange('m3uUrl', e.target.value)}/>
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField fullWidth label="Number of Tuners" value={localConfig.numTuners} onChange={(e)=>handleChange('numTuners', e.target.value)}/>
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField fullWidth label="Friendly Name" value={localConfig.friendlyName} onChange={(e)=>handleChange('friendlyName', e.target.value)}/>
        </Grid>
      </Grid>

      <Typography variant="h6" style={{marginTop:'1em'}}>FFmpeg Settings</Typography>
      <Grid container spacing={2} style={{marginTop:'1em'}}>
        <Grid item xs={6}>
          <TextField fullWidth label="Video Codec" value={localConfig.ffmpegOptions.videoCodec} onChange={(e)=>handleFFChange('videoCodec', e.target.value)}/>
        </Grid>
        <Grid item xs={6}>
          <TextField fullWidth label="Audio Codec" value={localConfig.ffmpegOptions.audioCodec} onChange={(e)=>handleFFChange('audioCodec', e.target.value)}/>
        </Grid>
        <Grid item xs={6}>
          <TextField fullWidth label="Video Bitrate" value={localConfig.ffmpegOptions.videoBitrate} onChange={(e)=>handleFFChange('videoBitrate', e.target.value)}/>
        </Grid>
        <Grid item xs={6}>
          <TextField fullWidth label="Audio Bitrate" value={localConfig.ffmpegOptions.audioBitrate} onChange={(e)=>handleFFChange('audioBitrate', e.target.value)}/>
        </Grid>
        <Grid item xs={6}>
          <TextField fullWidth label="Scale" value={localConfig.ffmpegOptions.scale} onChange={(e)=>handleFFChange('scale', e.target.value)}/>
        </Grid>
      </Grid>

      <Button variant="contained" color="primary" style={{marginTop:'1em'}} onClick={handleSave}>Save Configuration</Button>
    </div>
  );
}
