import { useState } from 'react';
import { Card, CardContent, Typography, Collapse, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MessageDetails from './MessageDetails.jsx';

export default function MessageCard({ message }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card sx={{ mb: 1 }}>
      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div onClick={() => setExpanded(prev => !prev)} style={{ cursor: 'pointer' }}>
          <Typography variant="body2" color="text.secondary">
            From: {message.sender}
          </Typography>
          <Typography variant="body1">{message.text}</Typography>
        </div>
        <IconButton onClick={() => setExpanded(prev => !prev)}>
          <ExpandMoreIcon />
        </IconButton>
      </CardContent>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <MessageDetails message={message} />
        </CardContent>
      </Collapse>
    </Card>
  );
}
