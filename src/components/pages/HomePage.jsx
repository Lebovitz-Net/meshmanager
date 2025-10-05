import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '@/components/Navigation/Sidebar.jsx';
import Topbar from '@/components/Navigation/Topbar.jsx';
import Menu from '@/components/Navigation/Menu.jsx';
import TestTab from '@/components/Tabs/TestTab.jsx';

import NodesTab from '@/components/Tabs/NodesTab.jsx';
import Connections from '@/components/Tabs/Connections.jsx';
import Map from '@/components/Tabs/Map.jsx';
import Channels from '@/components/Tabs/Channels.jsx';
import ContactsTab from '@/components/Tabs/ContactsTab.jsx';

const HomePage = ({ activeNode }) => {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar />
        <main style={{ flexGrow: 1, padding: '2rem', overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<Navigate to="nodes" />} />
            {/* <Route path="contacts" element={<ContactsTab />} /> */}
            <Route path="nodes" element={<NodesTab />} />
            {/* <Route path="nodes" element={<TestTab />} />
            <Route path="connections" element={<Connections />} />
            <Route path="map" element={<Map />} />
            <Route path="channels" element={<Channels />} /> */}
            <Route
              path="contacts"
              element={<ContactsTab nodeNum={activeNode?.myNodeNum} />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default HomePage;
