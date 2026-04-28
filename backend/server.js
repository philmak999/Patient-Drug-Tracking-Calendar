import express from 'express';
import cors from 'cors';
import patientRoutes from './routes/patients.js';
import medicationRoutes from './routes/medications.js';
import doctorRoutes from './routes/doctors.js';

const app = express();
const PORT = 5000;

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

app.use('/api/patients', patientRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/doctors', doctorRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
