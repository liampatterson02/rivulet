import React from 'react';
import { Typography } from '@mui/material';

export default function SegmentStats({ segments }) {
  return (
    <div style={{marginTop:'1em'}}>
      <Typography variant="h5">Segment Statistics</Typography>
      <Typography variant="body1">Downloaded: {segments.downloaded || 0}</Typography>
      <Typography variant="body1">Sent: {segments.sent || 0}</Typography>
      <Typography variant="body1">Errors: {segments.errors || 0}</Typography>
    </div>
  );
}
