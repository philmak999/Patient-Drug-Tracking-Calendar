import { useState, useEffect } from 'react';
import AddPatientModal from '../modals/AddPatientModal';
import AddMedicationModal from '../modals/AddMedicationModal';
import "./header.scss";

export default function Header() {
    const [patientModalOpen, setPatientModalOpen] = useState(false);
    const [medicationModalOpen, setMedicationModalOpen] = useState(false);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const dateDisplay = now.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
    const timeDisplay = now.toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true,
    });

    return (
        <>
            <header className="header">
                <h1 className="header__title">Patient Drug Tracking Calendar</h1>
                <div className="header__clock">
                    <div className="header__clock-time">{timeDisplay}</div>
                    <div className="header__clock-date">{dateDisplay}</div>
                </div>
                <div className="header__actions">
                    <button 
                        className="header__button header__button--primary"
                        onClick={() => setPatientModalOpen(true)}
                        aria-label="Add Patient"
                    >
                        <span className="header__button-icon" aria-hidden="true">👤</span>
                        <span className="header__button-text">+ Add Patient</span>
                    </button>
                    <button 
                        className="header__button header__button--secondary"
                        onClick={() => setMedicationModalOpen(true)}
                        aria-label="Add Medication"
                    >
                        <span className="header__button-icon" aria-hidden="true">💊</span>
                        <span className="header__button-text">+ Add Medication</span>
                    </button>
                </div>
            </header>

            <AddPatientModal 
                isOpen={patientModalOpen}
                onClose={() => setPatientModalOpen(false)}
            />
            <AddMedicationModal 
                isOpen={medicationModalOpen}
                onClose={() => setMedicationModalOpen(false)}
            />
        </>
    )
}
