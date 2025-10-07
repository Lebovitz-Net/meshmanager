// File: src/components/Tabs/ThreadedMessageList.js

import MessageCard from './MessageCard.jsx';
import { Typography } from '@mui/material';

/**
 * ThreadedMessageList groups messages by messageId and displays them with indentation.
 * Messages are sorted by timestamp DESC, preserving backend order.
 * Replies in a thread are indented for visual clarity.
 */
export default function ThreadedMessageList({ messages }) {
  if (!messages || messages.length === 0) {
    return null;
  }

  // Group messages by messageId
  const threadMap = new Map();
  messages.forEach(m => {
    const thread = threadMap.get(m.messageId) || [];
    thread.push(m);
    threadMap.set(m.messageId, thread);
  });

  // Sort threads by first message timestamp DESC
  const sortedThreads = Array.from(threadMap.values()).sort(
    (a, b) => new Date(b[0].timestamp) - new Date(a[0].timestamp)
  );

  // Flatten with indentLevel metadata
  const threadedMessages = [];
  sortedThreads.forEach(thread => {
    thread.forEach((m, index) => {
      threadedMessages.push({
        ...m,
        indentLevel: index === 0 ? 0 : 1
      });
    });
  });

  return (
    <>
      {threadedMessages.map(m => (
      <div
        key={`${m.messageId}-${m.timestamp}`}
        style={{
          marginLeft: m.indentLevel === 0 ? 0 : 32,
          transition: 'margin 0.2s ease-in-out'
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
          Thread ID: {parseInt(m.messageId)}
        </Typography>

        <MessageCard
          message={{
            id: m.messageId,
            fromNodeNum: m.fromNodeNum,
            text: m.message,
            timestamp: m.timestamp,
            payload: m.message
          }}
        />
      </div>     ))}
    </>
  );
}
