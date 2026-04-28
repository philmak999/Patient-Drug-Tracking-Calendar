import express from 'express';
import cors from 'cors';
import patientRoutes from './routes/patients.js';
import medicationRoutes from './routes/medications.js';
import doctorRoutes from './routes/doctors.js';

const app = express();

const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'https://philmak999.github.io',
  'http://localhost:5173', 
  'http://localhost:3000'  
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('CORS not allowed'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running');
});

app.use('/api/patients', patientRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/doctors', doctorRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});