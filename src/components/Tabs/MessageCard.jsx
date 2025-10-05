import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Collapse,
  IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MessageDetails from './MessageDetails.jsx';

export default function MessageCard({ message, isSelected, onSelect }) {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => setExpanded(prev => !prev);

  return (
    <Card
      sx={{
        mb: 1,
        cursor: 'pointer',
        border: isSelected ? '2px solid #1976d2' : '1px solid #ccc',
        backgroundColor: isSelected ? '#f1f8e9' : '#fff',
        transition: 'all 0.2s ease-in-out'
      }}
      onClick={onSelect}
    >
      <CardContent
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div onClick={handleToggle} style={{ cursor: 'pointer', flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            From: {message.fromNodeNum || message.sender}
          </Typography>
          <Typography variant="body1" noWrap>
            {message.text || message.payload}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {message.timestamp
              ? new Date(message.timestamp).toLocaleString()
              : ''}
          </Typography>
        </div>
        <IconButton
          onClick={handleToggle}
          sx={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}
        >
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
