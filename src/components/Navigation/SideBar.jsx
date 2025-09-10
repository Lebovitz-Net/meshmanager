// import { Link } from 'react-router-dom';
// import { List, ListItem, ListItemText } from '@mui/material';

// const Sidebar = () => {
//   return (
//     <List sx={{ width: 240 }}>
//       <ListItem button component={Link} to="/contacts">
//         <ListItemText primary="Contacts" />
//       </ListItem>
//       <ListItem button component={Link} to="/nodes">
//         <ListItemText primary="Nodes" />
//       </ListItem>
//       <ListItem button component={Link} to="/connections">
//         <ListItemText primary="Connections" />
//       </ListItem>
//       <ListItem button component={Link} to="/map">
//         <ListItemText primary="Map" />
//       </ListItem>
//       <ListItem button component={Link} to="/channels">
//         <ListItemText primary="Channels" />
//       </ListItem>
//     </List>
//   );
// };

// export default Sidebar;
// src/components/Navigation/Sidebar.jsx
import { NavLink } from 'react-router-dom';
// import './Sidebar.css'; // Optional for styling

const Sidebar = () => {
  const tabs = [
    { label: 'Nodes', path: '/nodes' },
    { label: 'Contacts', path: '/contacts' },
    { label: 'Connections', path: '/connections' },
    { label: 'Map', path: '/map' },
    { label: 'Channels', path: '/channels' },
  ];

  return (
    <nav className="sidebar" style={{ width: '250px', background: '#f4f4f4', padding: '1rem' }}>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tabs.map(({ label, path }) => (
          <li key={path} style={{ marginBottom: '1rem' }}>
            <NavLink
              to={path}
              style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? '#007bff' : '#333',
                fontWeight: isActive ? 'bold' : 'normal',
              })}
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
