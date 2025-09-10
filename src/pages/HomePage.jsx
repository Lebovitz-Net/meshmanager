import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '@/components/Navigation/Sidebar.jsx';
import Topbar from '@/components/Navigation/Topbar.jsx';
import Menu from '@/components/Navigation/Menu.jsx';
import TestTab from '@/components/Tabs/TestTab.jsx';

import Contacts from '@/components/Tabs/Contacts.jsx';
import Nodes from '@/components/Tabs/Nodes.jsx';
import Connections from '@/components/Tabs/Connections.jsx';
import Map from '@/components/Tabs/Map.jsx';
import Channels from '@/components/Tabs/Channels.jsx';
import ContactsTab from '@/components/Tabs/ContactsTab.jsx';

const HomePage = () => {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />

      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar />
        {/* <Menu /> */}

        <main style={{ flexGrow: 1, padding: '2rem', overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<Navigate to="nodes" />} />
            {/* <Route path="contacts" element={<ContactsTab />} /> */}
            <Route path="nodes" element={<Nodes />} />
            {/* <Route path="nodes" element={<TestTab />} />
            <Route path="connections" element={<Connections />} />
            <Route path="map" element={<Map />} />
            <Route path="channels" element={<Channels />} /> */}
            {/* <Route path="/contacts/:channelId" element={<MessageListPage />} />  */}
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default HomePage;
