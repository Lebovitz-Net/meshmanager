// File: src/components/Tabs/ThreadedMessageList.js

import MessageCard from './MessageCard';
import { Typography } from '@mui/material';

// Groups messages by threadId (replyId or messageId).
// Sorts threads by root timestamp DESC.
// Flattens threads with `indented: true` for replies.

function buildThreadedList (messages) {
    // Group messages by messageId
  const threadMap = new Map();
  messages.forEach(m => {
    const threadId = m.replyId || m.messageId;
    const thread = threadMap.get(threadId) || [];
    thread.push(m);
    threadMap.set(threadId, thread);
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
        idented: index >  0
      });
    });
  });
  return threadedMessages;
}

export default function ThreadedMessageList({ messages, threaded }) {
  if (!messages || messages.length === 0) {
    return null;
  }

  const messageList = threaded
      ? buildThreadedList(messages)
      : messages

  return (
    <>
      {messageList.map(m => (
      <div
        key={`${m.messageId}-${m.timestamp}`}
        style={{
          marginLeft: m.indented ? 32 : 0,
          borderLeft: m.indented ? '2px solid #ccc' : 'none',
          paddingLeft: m.indented ? 8 : 0,
          transition: 'all 0.2s ease-in-out'
        }} >
        {!m.indented && (
          <Typography variant="caption" color="primary" sx={{ mb: 0.5 }}>
            Root Message
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
          Thread ID: {parseInt(m.messageId)}
        </Typography>

        <MessageCard
          message={{
            id: m.messageId,
            fromNodeNum: m.fromNodeNum,
            toNodeNum: m.toNodeNum,
            text: m.message,
            timestamp: m.timestamp,
            payload: m.message
          }}
        />
      </div>     ))}
    </>
  );
}
