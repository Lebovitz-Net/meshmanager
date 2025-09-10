import MessageCard from './MessageCard.jsx';

export default function MessageList({ channelId }) {
  const messages = [
    { id: 'm1', text: 'Node Alpha reporting in.', sender: 'Node Alpha', channel: 'ch1', timestamp: '13:22' },
    { id: 'm2', text: 'Node Bravo ready.', sender: 'Node Bravo', channel: 'ch2', timestamp: '13:23' },
    { id: 'm3', text: 'Battery low on Node Alpha.', sender: 'Node Alpha', channel: 'ch1', timestamp: '13:24' },
  ].filter(msg => msg.channel === channelId);

  return (
    <>
      {messages.map(msg => (
        <MessageCard key={msg.id} message={msg} />
      ))}
    </>
  );
}
