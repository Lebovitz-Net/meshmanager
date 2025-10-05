import { useParams, useNavigate } from 'react-router-dom';
import MessageCard from '@/components/Tabs/MessageCard.jsx';
import MessageList from '@/components/Tabs/MessageList.jsx';

const mockMessages = {
  chan1: [
    { id: 'msg1', title: 'Power outage reported' },
    { id: 'msg2', title: 'Backup activated' },
  ],
  chan2: [
    { id: 'msg3', title: 'Node sync complete' },
    { id: 'msg4', title: 'New peer joined' },
  ],
};

export default function MessageListPage() {
  const { channelId } = useParams();
  const navigate = useNavigate();

  const messages = mockMessages[channelId] || [];

  return (
    <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
      <button
        onClick={() => navigate('/contacts')}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '1rem',
          color: '#007bff',
          marginBottom: '1rem',
          cursor: 'pointer',
        }}
      >
        ← Back to Channels
      </button>

      <h2 style={{ marginBottom: '1rem' }}>Messages for {channelId}</h2>

      <MessageList>
        {messages.map((msg) => (
          <MessageCard
            key={msg.id}
            message={msg}
            onClick={() => navigate(`/contacts/${channelId}/${msg.id}`)}
          />
        ))}
      </MessageList>
    </div>
  );
}
