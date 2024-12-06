import React, { useEffect, useState } from 'react';
import { getConfig, getChannels, getSegments } from './api';
import { Container, Box, Tabs, Tab } from '@mui/material';
import Header from './components/Header';
import ConfigForm from './components/ConfigForm';
import ChannelList from './components/ChannelList';
import SegmentStats from './components/SegmentStats';

function App() {
  const [tab, setTab] = useState(0);
  const [config, setConfig] = useState(null);
  const [channels, setChannels] = useState([]);
  const [segments, setSegments] = useState({});

  useEffect(() => {
    (async () => {
      const cfg = await getConfig();
      setConfig(cfg);
      const ch = await getChannels();
      setChannels(ch);
      const seg = await getSegments();
      setSegments(seg);
    })();
  }, []);

  const handleTabChange = (e, val) => {
    setTab(val);
  };

  return (
    <Container maxWidth="xl">
      <Header />
      <Box sx={{ borderBottom: 1, borderColor: 'divider', marginTop:2 }}>
        <Tabs value={tab} onChange={handleTabChange}>
          <Tab label="Configuration" />
          <Tab label="Channels" />
          <Tab label="Segments" />
        </Tabs>
      </Box>
      {tab === 0 && config && <ConfigForm config={config} setConfig={setConfig} />}
      {tab === 1 && <ChannelList channels={channels} />}
      {tab === 2 && <SegmentStats segments={segments} />}
    </Container>
  );
}

export default App;
