import { createContext, useState, useCallback } from 'react';
import { patientAPI } from '../api/patientAPI';

export const PatientContext = createContext();

const FALLBACK_DOCTORS = [
    { id: 1, firstName: 'Sarah',   lastName: 'Chen',      specialty: 'Cardiology' },
    { id: 2, firstName: 'Michael', lastName: 'Torres',    specialty: 'Neurology' },
    { id: 3, firstName: 'Emily',   lastName: 'Patel',     specialty: 'Internal Medicine' },
    { id: 4, firstName: 'James',   lastName: 'Okafor',    specialty: 'Oncology' },
    { id: 5, firstName: 'Lisa',    lastName: 'Nakamura',  specialty: 'Endocrinology' },
    { id: 6, firstName: 'Robert',  lastName: 'Williams',  specialty: 'Psychiatry' },
    { id: 7, firstName: 'Angela',  lastName: 'Martinez',  specialty: 'Rheumatology' },
    { id: 8, firstName: 'David',   lastName: 'Kim',       specialty: 'Pulmonology' },
];

export function PatientProvider({ children }) {
    const [patients, setPatients] = useState([]);
    const [medications, setMedications] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPatients = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await patientAPI.getPatients();
            setPatients(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
            console.error('Failed to fetch patients:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchDoctors = useCallback(async () => {
        try {
            const data = await patientAPI.getDoctors();
            setDoctors(Array.isArray(data) ? data : FALLBACK_DOCTORS);
        } catch (err) {
            setDoctors(FALLBACK_DOCTORS);
            console.error('Backend unreachable, using built-in doctors list:', err);
        }
    }, []);

    const addPatient = useCallback(async (patientData) => {
        setLoading(true);
        setError(null);
        try {
            const newPatient = await patientAPI.addPatient(patientData);
            setPatients(prev => [...prev, newPatient]);
            return newPatient;
        } catch (err) {
            // Backend unreachable — store locally with a generated ID
            setPatients(prev => {
                const localPatient = {
                    id: Date.now(),
                    patientId: `P-${String(prev.length + 1).padStart(3, '0')}`,
                    firstName: patientData.firstName.trim(),
                    lastName: patientData.lastName.trim(),
                    age: Number(patientData.age),
                    additionalInfo: patientData.additionalInfo?.trim() || '',
                };
                return [...prev, localPatient];
            });
            console.error('Backend unreachable, patient stored locally:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const addMedication = useCallback(async (medicationData) => {
        setLoading(true);
        setError(null);
        try {
            const newMedication = await patientAPI.addMedication(medicationData);
            setMedications(prev => [...prev, { ...medicationData, id: newMedication?.id || Date.now() }]);
            return newMedication;
        } catch (err) {
            // Store locally even if the API is unreachable (prototype)
            setMedications(prev => [...prev, { ...medicationData, id: Date.now() }]);
            console.error('Failed to sync medication to backend:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateMedication = useCallback(async (medicationId, medicationData) => {
        setLoading(true);
        setError(null);
        try {
            const updatedMedication = await patientAPI.updateMedication(medicationId, medicationData);
            setMedications(prev => prev.map(med =>
                String(med.id) === String(medicationId) ? { ...med, ...medicationData, ...updatedMedication } : med
            ));
            return updatedMedication;
        } catch (err) {
            setError(err.message);
            setMedications(prev => prev.map(med =>
                String(med.id) === String(medicationId) ? { ...med, ...medicationData } : med
            ));
            console.error('Failed to sync medication update to backend:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const value = {
        patients,
        medications,
        doctors,
        loading,
        error,
        fetchPatients,
        fetchDoctors,
        addPatient,
        addMedication,
        updateMedication,
    };

    return (
        <PatientContext.Provider value={value}>
            {children}
        </PatientContext.Provider>
    );
}
