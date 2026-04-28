import { createContext, useState, useCallback } from 'react';
import { patientAPI } from '../api/patientAPI';

export const PatientContext = createContext();

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
            setDoctors(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch doctors:', err);
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
            setError(err.message);
            console.error('Failed to add patient:', err);
            throw err;
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
