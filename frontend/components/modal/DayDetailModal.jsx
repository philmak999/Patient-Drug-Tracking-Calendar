import { useState } from 'react';
import PatientMedicationCard from './PatientMedicationCard';
import AddMedicationModal from '../modals/AddMedicationModal';
import './dayDetailModal.scss';

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export default function DayDetailModal({
    isOpen,
    selectedDay,
    dayMedications,
    formData,
    onFormDataChange,
    onMedicationUpdate,
    onSave,
    onClose,
}) {
    const [isAddMedicationOpen, setIsAddMedicationOpen] = useState(false);

    if (!isOpen || !selectedDay) return null;

    const { day, month, year } = selectedDay;
    const title = `${MONTH_NAMES[month]} ${day}, ${year}`;
    const meds = dayMedications || [];
    const selectedDateISO = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return (
        <div className="day-detail-modal">
            <div className="day-detail-modal__overlay" onClick={onClose} />
            <div className="day-detail-modal__content">
                <h2 className="day-detail-modal__title">{title}</h2>

                {meds.length > 0 && (
                    <div className="day-detail-modal__medications">
                        <div className="day-detail-modal__section-label">
                            {meds.length === 1 ? '1 Patient' : `${meds.length} Patients`}
                        </div>
                        <div className="day-detail-modal__card-list">
                            {meds.map((med, idx) => (
                                <PatientMedicationCard
                                    key={med.medicationId || idx}
                                    {...med}
                                    selectedDateKey={selectedDay.dateKey}
                                    onMedicationUpdate={onMedicationUpdate}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="day-detail-modal__notes">
                    <label className="day-detail-modal__notes-label">Notes</label>
                    <textarea
                        className="day-detail-modal__textarea"
                        value={formData}
                        onChange={(e) => onFormDataChange(e.target.value)}
                        placeholder="Add notes for this day..."
                    />
                </div>

                <div className="day-detail-modal__buttons">
                    <button
                        className="day-detail-modal__button day-detail-modal__button--add-medication"
                        onClick={() => setIsAddMedicationOpen(true)}
                    >
                        + Add Medication
                    </button>
                    <button
                        className="day-detail-modal__button day-detail-modal__button--save"
                        onClick={onSave}
                    >
                        Save
                    </button>
                    <button
                        className="day-detail-modal__button day-detail-modal__button--cancel"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>

                <AddMedicationModal
                    isOpen={isAddMedicationOpen}
                    onClose={() => setIsAddMedicationOpen(false)}
                    prefillStartDate={selectedDateISO}
                />
            </div>
        </div>
    );
}
