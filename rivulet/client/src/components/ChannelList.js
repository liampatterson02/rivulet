import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Link } from '@mui/material';

export default function ChannelList({ channels }) {
  return (
    <div style={{marginTop:'1em'}}>
      <Typography variant="h5">Channels</Typography>
      <TableContainer component={Paper} style={{marginTop:'1em'}}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Channel Number</TableCell>
              <TableCell>Channel Name</TableCell>
              <TableCell>Variants</TableCell>
              <TableCell>Stream Link</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {channels.map(ch => (
              <TableRow key={ch.name}>
                <TableCell>{ch.number}</TableCell>
                <TableCell>{ch.name}</TableCell>
                <TableCell>{ch.variants.map(v => v.quality).join(', ')}</TableCell>
                <TableCell>
                  <Link href={`/stream/${encodeURIComponent(ch.name)}`} target="_blank" rel="noopener">View Stream</Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
