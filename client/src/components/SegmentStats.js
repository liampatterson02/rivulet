import React from 'react';
import { Typography, Box } from '@mui/material';

export default function SegmentStats({ segments }) {
  // Expecting segments like { segments: [ {id:1,status:'active'}, ... ] }
  const segmentList = segments.segments || [];

  const getColor = (status) => {
    switch(status) {
      case 'active':
        return 'green';
      case 'buffered':
        return 'yellow';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <div style={{marginTop:'1em'}}>
      <Typography variant="h5" style={{marginBottom:'1em'}}>Segment Statistics</Typography>
      <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
        {segmentList.map(seg => (
          <Box 
            key={seg.id} 
            sx={{ 
              width: 20, 
              height: 20, 
              borderRadius: '50%', 
              backgroundColor: getColor(seg.status) 
            }} 
            title={`Segment ${seg.id}: ${seg.status}`}
          />
        ))}
      </Box>
    </div>
  );
}
