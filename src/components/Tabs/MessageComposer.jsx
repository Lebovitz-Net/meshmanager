// File: src/components/Tabs/MessageComposer.jsx

import { Box, TextField, Button } from '@mui/material';
import { useState } from 'react';

export default function MessageComposer({ onSend }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <Box
      sx={{
        position: 'sticky',
        bottom: 0,
        backgroundColor: 'background.paper',
        padding: 2,
        borderTop: '1px solid #ccc',
        display: 'flex',
        gap: 1
      }}
    >
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Type your message…"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />
      <Button variant="contained" onClick={handleSend}>
        Send
      </Button>
    </Box>
  );
}
