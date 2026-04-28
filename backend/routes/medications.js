import { Router } from 'express';

const router = Router();
const medications = [];
let nextId = 1;

router.get('/', (req, res) => {
    res.json(medications);
});

router.post('/', (req, res) => {
    const { patientId, medication, doctorName, startDate, durationMode, duration, manualDays, weekdaysEndDate, customDates, dosage, dosageUnit, prescriptionInstructions } = req.body;

    if (!patientId) {
        return res.status(400).json({ error: 'patientId is required' });
    }

    if (!medication?.trim()) {
        return res.status(400).json({ error: 'medication name is required' });
    }

    if (dosage === undefined || dosage === null || dosage === '' || Number(dosage) < 0) {
        return res.status(400).json({ error: 'A valid dosage is required' });
    }

    const newMedication = {
        id: nextId++,
        patientId,
        medication: medication.trim(),
        doctorName: doctorName?.trim() || '',
        startDate: startDate || null,
        durationMode: durationMode || 'days',
        duration: duration ? Number(duration) : null,
        manualDays: Array.isArray(manualDays) ? manualDays : [],
        weekdaysEndDate: weekdaysEndDate || null,
        customDates: Array.isArray(customDates) ? customDates : [],
        dosage: Number(dosage),
        dosageUnit: dosageUnit || 'mg',
        prescriptionInstructions: prescriptionInstructions?.trim() || '',
        createdAt: new Date().toISOString(),
    };

    medications.push(newMedication);
    res.status(201).json(newMedication);
});

router.patch('/:id', (req, res) => {
    const medicationId = Number(req.params.id);
    const index = medications.findIndex(med => med.id === medicationId);

    if (index === -1) {
        return res.status(404).json({ error: 'Medication not found' });
    }

    const { patientId, medication, doctorName, startDate, durationMode, duration, manualDays, weekdaysEndDate, customDates, dosage, dosageUnit, prescriptionInstructions } = req.body;

    if (!patientId) {
        return res.status(400).json({ error: 'patientId is required' });
    }

    if (!medication?.trim()) {
        return res.status(400).json({ error: 'medication name is required' });
    }

    if (dosage === undefined || dosage === null || dosage === '' || Number(dosage) < 0) {
        return res.status(400).json({ error: 'A valid dosage is required' });
    }

    const updatedMedication = {
        ...medications[index],
        patientId,
        medication: medication.trim(),
        doctorName: doctorName?.trim() || '',
        startDate: startDate || null,
        durationMode: durationMode || 'days',
        duration: duration ? Number(duration) : null,
        manualDays: Array.isArray(manualDays) ? manualDays : [],
        weekdaysEndDate: weekdaysEndDate || null,
        customDates: Array.isArray(customDates) ? customDates : [],
        dosage: Number(dosage),
        dosageUnit: dosageUnit || 'mg',
        prescriptionInstructions: prescriptionInstructions?.trim() || '',
        updatedAt: new Date().toISOString(),
    };

    medications[index] = updatedMedication;
    res.json(updatedMedication);
});

export default router;
