// File: src/components/Tabs/MessageList.jsx

import MessageCard from './MessageCard.jsx';

export default function MessageList({ messages }) {
  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <>
      {messages.map(m => (
        <MessageCard
          key={m.messageId}
          message={{
            id: m.messageId,
            fromNodeNum: m.fromNodeNum,
            text: m.message,            // ✅ map API "message" → prop "text"
            timestamp: m.timestamp,
            payload: m.message          // optional, fallback
          }}
        />
      ))}
    </>
  );
}
