import { Router } from 'express';

const router = Router();

const doctors = [
    { id: 1, firstName: 'Sarah',   lastName: 'Chen',      specialty: 'Cardiology' },
    { id: 2, firstName: 'Michael', lastName: 'Torres',    specialty: 'Neurology' },
    { id: 3, firstName: 'Emily',   lastName: 'Patel',     specialty: 'Internal Medicine' },
    { id: 4, firstName: 'James',   lastName: 'Okafor',    specialty: 'Oncology' },
    { id: 5, firstName: 'Lisa',    lastName: 'Nakamura',  specialty: 'Endocrinology' },
    { id: 6, firstName: 'Robert',  lastName: 'Williams',  specialty: 'Psychiatry' },
    { id: 7, firstName: 'Angela',  lastName: 'Martinez',  specialty: 'Rheumatology' },
    { id: 8, firstName: 'David',   lastName: 'Kim',       specialty: 'Pulmonology' },
];

router.get('/', (req, res) => {
    res.json(doctors);
});

export default router;
