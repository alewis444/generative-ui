import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import generateRouter from './routes/generate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/generate', generateRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Generative UI Lab running at http://localhost:${PORT}`);
});
