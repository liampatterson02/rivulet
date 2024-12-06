import React, { useEffect, useState } from 'react';
import { Typography } from '@mui/material';

/**
 * Mock segment status. In a real scenario, you'd have a backend endpoint
 * reporting segment statuses. For now, we mock this as green.
 */
function SegmentsPage() {
  const [segments, setSegments] = useState([]);

  useEffect(() => {
    // In a real scenario, fetch segment statuses from an endpoint.
    // For now, generate some mock data.
    const mockData = [
      { id: 1, status: 'green' },
      { id: 2, status: 'yellow' },
      { id: 3, status: 'red' },
      { id: 4, status: 'green' }
    ];
    setSegments(mockData);
  }, []);

  const colorMap = {
    green: 'green',
    yellow: 'gold',
    red: 'red'
  };

  return (
    <div>
      <Typography variant="h4">Segments</Typography>
      <Typography variant="body1">Segment statuses (mocked):</Typography>
      <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
        {segments.map(s => (
          <div key={s.id} title={s.status}
            style={{
              backgroundColor: colorMap[s.status] || 'gray',
              width: '20px',
              height: '20px',
              borderRadius: '50%'
            }}>
          </div>
        ))}
      </div>
      <div style={{marginTop:'20px'}}>
        <Typography variant="body2">
          <strong>Legend:</strong> Green = active, Yellow = buffered, Red = error
        </Typography>
      </div>
    </div>
  );
}

export default SegmentsPage;
