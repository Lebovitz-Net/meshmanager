// api/configRoutes.js
import express from 'express';
// import mutation handlers when ready

const router = express.Router();

router.post('/node/:id/config', (req, res) => {
  // TODO: handle config mutation
  res.status(501).json({ message: 'Config mutation not implemented yet.' });
});

export default router;
