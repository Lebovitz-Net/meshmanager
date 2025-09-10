import { useState } from 'react';
import { Card, CardContent, Typography, Collapse, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NodeDetails from './NodeDetails.jsx';

export default function NodeCard({ node }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div onClick={() => setExpanded(prev => !prev)} style={{ cursor: 'pointer' }}>
          <Typography variant="h6">{node.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            Channel: {node.channel}
          </Typography>
        </div>
        <IconButton onClick={() => setExpanded(prev => !prev)}>
          <ExpandMoreIcon />
        </IconButton>
      </CardContent>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <NodeDetails node={node} />
        </CardContent>
      </Collapse>
    </Card>
  );
}
