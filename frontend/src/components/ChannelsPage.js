import React, { useEffect, useState } from 'react';
import { getChannels } from '../services/api';
import { Typography, Table, TableBody, TableCell, TableHead, TableRow, Link } from '@mui/material';

function ChannelsPage() {
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    // Fetch lineup.json directly from backend
    fetch('/lineup.json')
      .then(res => res.json())
      .then(data => setChannels(data))
      .catch(err => console.warn(err));
  }, []);

  return (
    <div>
      <Typography variant="h4">Channels</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Number</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Stream</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {channels.map(ch => (
            <TableRow key={ch.GuideNumber}>
              <TableCell>{ch.GuideNumber}</TableCell>
              <TableCell>{ch.GuideName}</TableCell>
              <TableCell>
                <Link href={ch.URL} target="_blank" rel="noopener noreferrer">Direct Stream</Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default ChannelsPage;
