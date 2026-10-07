import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import healthHandler from './api/health.js';
import busArrivalHandler from './api/bus-arrival.js';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Adapt Vercel-style (req, res) handler for Express
const adapt = (handler: (req: any, res: any) => any) => (req: express.Request, res: express.Response) => {
  // Ensure req.query is available
  return handler(req, res);
};

// Mount API endpoints
app.all('/api/health', adapt(healthHandler));
app.all('/api/bus-arrival', adapt(busArrivalHandler));

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Transit Velocity server running at http://localhost:${port}`);
  });
}

startServer();
