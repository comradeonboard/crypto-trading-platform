import express from 'express';
import cors from 'cors';
import { priceRouter } from './routes/priceRoutes';
import { predictionRouter } from './routes/predictionRoutes';

const app = express();
const PORT = process.env.PORT ?? 8080;

app.use(cors());
app.use(express.json());

app.use('/api/prices', priceRouter);
app.use('/api/predict', predictionRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log(`Crypto trading backend running on port ${PORT}`);
});