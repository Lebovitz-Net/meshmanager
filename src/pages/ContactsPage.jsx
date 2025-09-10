import { useNavigate } from 'react-router-dom';
import ChannelCard from '@/components/Tabs/ChannelCard.jsx';

const mockChannels = [
  { id: 'chan1', name: 'Default' },
  { id: 'chan2', name: 'Local Mesh' },
];

export default function ContactsPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1rem' }}>Contacts</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {mockChannels.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            onClick={() => {
              console.log("Click");
              navigate(`/contacts/${channel.id}`)
            }}
            
          />
        ))}
      </div>
    </div>
  );
}



// import { useState } from 'react';
// import ChannelCard from '@/components/Tabs/ChannelCard.jsx';
// import MessageList from '@/components/Tabs/MessageList.jsx';
// import MessageCard from '@/components/Tabs/MessageCard.jsx';
// import MessageDetails from '@/components/Tabs/MessageDetails.jsx';

// const mockChannels = [
//   { id: 'chan1', name: 'Emergency Ops' },
//   { id: 'chan2', name: 'Local Mesh' },
// ];

// const mockMessages = {
//   chan1: [
//     { id: 'msg1', title: 'Power outage reported' },
//     { id: 'msg2', title: 'Backup activated' },
//   ],
//   chan2: [
//     { id: 'msg3', title: 'Node sync complete' },
//     { id: 'msg4', title: 'New peer joined' },
//   ],
// };

// export default function ContactsPage() {
//   const [selectedChannelId, setSelectedChannelId] = useState(null);
//   const [selectedMessageId, setSelectedMessageId] = useState(null);

//   const handleChannelClick = (id) => {
//     setSelectedChannelId(id);
//     setSelectedMessageId(null);
//   };

//   const handleMessageClick = (id) => {
//     setSelectedMessageId(id);
//   };

//   const messages = selectedChannelId ? mockMessages[selectedChannelId] : [];

//   return (
//     <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
//       <h2 style={{ marginBottom: '1rem' }}>Contacts</h2>

//       {!selectedChannelId && (
//         <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
//           {mockChannels.map((channel) => (
//             <ChannelCard
//               key={channel.id}
//               channel={channel}
//               onClick={() => handleChannelClick(channel.id)}
//             />
//           ))}
//         </div>
//       )}

//       {selectedChannelId && !selectedMessageId && (
//         <MessageList>
//           {messages.map((msg) => (
//             <MessageCard
//               key={msg.id}
//               message={msg}
//               onClick={() => handleMessageClick(msg.id)}
//             />
//           ))}
//         </MessageList>
//       )}

//       {selectedMessageId && (
//         <MessageDetails messageId={selectedMessageId} />
//       )}
//     </div>
//   );
// }
