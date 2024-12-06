import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { AppBar, Tabs, Tab, Container } from '@mui/material';
import ConfigurationPage from './components/ConfigurationPage';
import ChannelsPage from './components/ChannelsPage';
import SegmentsPage from './components/SegmentsPage';

function App() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Router>
      <AppBar position="static">
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Configuration" component={Link} to="/" />
          <Tab label="Channels" component={Link} to="/channels" />
          <Tab label="Segments" component={Link} to="/segments" />
        </Tabs>
      </AppBar>
      <Container style={{ marginTop: '20px' }}>
        <Switch>
          <Route exact path="/" component={ConfigurationPage} />
          <Route path="/channels" component={ChannelsPage} />
          <Route path="/segments" component={SegmentsPage} />
        </Switch>
      </Container>
    </Router>
  );
}

export default App;
