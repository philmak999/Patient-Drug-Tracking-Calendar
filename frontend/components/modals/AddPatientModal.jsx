import { useState, useContext } from 'react';
import { PatientContext } from '../../src/context/PatientContext';
import './addPatientModal.scss';

export default function AddPatientModal({ isOpen, onClose }) {
    const { addPatient, loading } = useContext(PatientContext);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        age: '',
        additionalInfo: ''
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null);
    };

    const handleAddPatient = async () => {
        // Validation
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            setError('First name and last name are required');
            return;
        }

        if (!formData.age || formData.age < 0) {
            setError('Please enter a valid age');
            return;
        }

        try {
            await addPatient(formData);
            resetForm();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to add patient');
        }
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            age: '',
            additionalInfo: ''
        });
        setError(null);
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="patient-modal">
            <div className="patient-modal__overlay" onClick={handleCancel}></div>
            <div className="patient-modal__content">
                <h2 className="patient-modal__title">Add New Patient</h2>

                {error && <div className="patient-modal__error">{error}</div>}

                <div className="patient-modal__form-group">
                    <label htmlFor="firstName" className="patient-modal__label">First Name</label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="patient-modal__input"
                        placeholder="Enter first name"
                    />
                </div>

                <div className="patient-modal__form-group">
                    <label htmlFor="lastName" className="patient-modal__label">Last Name</label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="patient-modal__input"
                        placeholder="Enter last name"
                    />
                </div>

                <div className="patient-modal__form-group">
                    <label htmlFor="age" className="patient-modal__label">Age</label>
                    <input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        className="patient-modal__input"
                        placeholder="Enter age"
                        min="0"
                    />
                </div>

                <div className="patient-modal__form-group">
                    <label htmlFor="additionalInfo" className="patient-modal__label">Additional Information</label>
                    <textarea
                        id="additionalInfo"
                        name="additionalInfo"
                        value={formData.additionalInfo}
                        onChange={handleChange}
                        className="patient-modal__textarea"
                        placeholder="Enter any additional information (allergies, conditions, etc.)"
                        rows="4"
                    />
                </div>

                <div className="patient-modal__buttons">
                    <button 
                        className="patient-modal__button patient-modal__button--add"
                        onClick={handleAddPatient}
                        disabled={loading}
                    >
                        {loading ? 'Adding...' : 'Add Patient'}
                    </button>
                    <button 
                        className="patient-modal__button patient-modal__button--cancel"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
