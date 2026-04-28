import { Router } from 'express';

const router = Router();
const patients = [
    {
        id: 1,
        patientId: 'P-001',
        firstName: 'John',
        lastName: 'Carter',
        age: 67,
        additionalInfo: 'Type 2 diabetes, no known drug allergies',
    },
    {
        id: 2,
        patientId: 'P-002',
        firstName: 'Maria',
        lastName: 'Lopez',
        age: 54,
        additionalInfo: 'Hypertension, penicillin allergy',
    },
    {
        id: 3,
        patientId: 'P-003',
        firstName: 'Ethan',
        lastName: 'Nguyen',
        age: 43,
        additionalInfo: 'Asthma, uses rescue inhaler as needed',
    },
    {
        id: 4,
        patientId: 'P-004',
        firstName: 'Sophia',
        lastName: 'Patel',
        age: 72,
        additionalInfo: 'Chronic kidney disease stage 3',
    },
    {
        id: 5,
        patientId: 'P-005',
        firstName: 'Daniel',
        lastName: 'Brooks',
        age: 31,
        additionalInfo: 'No significant medical history',
    },
];
let nextId = 6;

router.get('/', (req, res) => {
    res.json(patients);
});

router.post('/', (req, res) => {
    const { firstName, lastName, age, additionalInfo } = req.body;

    if (!firstName?.trim() || !lastName?.trim()) {
        return res.status(400).json({ error: 'firstName and lastName are required' });
    }

    if (age === undefined || age === null || age === '' || Number(age) < 0) {
        return res.status(400).json({ error: 'A valid age is required' });
    }

    const currentId = nextId++;
    const patient = {
        id: currentId,
        patientId: `P-${String(currentId).padStart(3, '0')}`,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        age: Number(age),
        additionalInfo: additionalInfo?.trim() || '',
    };

    patients.push(patient);
    res.status(201).json(patient);
});

export default router;
