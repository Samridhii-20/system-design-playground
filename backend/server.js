import express from 'express';
import cors from 'cors';
import { simulateRequest } from './simulator.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/simulate', (req, res) => {
  const { nodes, edges } = req.body;

  if (!nodes || !edges) {
    return res.status(400).json({ error: 'Nodes and edges are required.' });
  }

  try {
    const result = simulateRequest(nodes, edges);
    res.json(result);
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({ error: 'Simulation failed: ' + error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend simulation server running on http://localhost:${PORT}`);
});
