const API_BASE_URL = 'http://localhost:5000/api';

export const patientAPI = {
    addPatient: async (patientData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/patients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(patientData),
            });

            if (!response.ok) {
                throw new Error(`Failed to add patient: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error adding patient:', error);
            throw error;
        }
    },

    getPatients: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/patients`);

            if (!response.ok) {
                throw new Error(`Failed to fetch patients: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching patients:', error);
            throw error;
        }
    },

    getDoctors: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/doctors`);

            if (!response.ok) {
                throw new Error(`Failed to fetch doctors: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching doctors:', error);
            throw error;
        }
    },

    addMedication: async (medicationData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/medications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(medicationData),
            });

            if (!response.ok) {
                throw new Error(`Failed to add medication: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error adding medication:', error);
            throw error;
        }
    },

    updateMedication: async (medicationId, medicationData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/medications/${medicationId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(medicationData),
            });

            if (!response.ok) {
                throw new Error(`Failed to update medication: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating medication:', error);
            throw error;
        }
    },
};
