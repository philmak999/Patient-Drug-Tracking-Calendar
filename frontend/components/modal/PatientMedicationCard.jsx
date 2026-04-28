import { useEffect, useState } from 'react';
import AddMedicationModal from '../modals/AddMedicationModal';
import './patientMedicationCard.scss';

function formatDate(isoStr) {
    if (!isoStr) return '—';
    const d = new Date(isoStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatDuration(durationMode, duration, manualDays, customDates, startDate) {
    if (durationMode === 'days') {
        const days = parseInt(duration) || 0;
        if (!days || !startDate) return `${duration || 0} day(s)`;
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(start);
        end.setDate(end.getDate() + days - 1);
        const fmt = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${days} day${days !== 1 ? 's' : ''} (${fmt(start)} – ${fmt(end)})`;
    }
    if (durationMode === 'weekdays') {
        return `Every ${(manualDays || []).join(', ')}`;
    }
    if (durationMode === 'custom') {
        const count = (customDates || []).length;
        return `${count} custom date${count !== 1 ? 's' : ''}`;
    }
    return '—';
}

export default function PatientMedicationCard({
    medicationId,
    patientId,
    patientName,
    patientDisplayId,
    doctorName,
    medication,
    startDate,
    durationMode,
    duration,
    manualDays,
    weekdaysEndDate,
    customDates,
    dosage,
    dosageUnit,
    prescriptionInstructions,
    selectedDateKey,
    onMedicationUpdate,
}) {
    const [expanded, setExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditPlanOpen, setIsEditPlanOpen] = useState(false);
    const [editDosage, setEditDosage] = useState(dosage);
    const [editDosageUnit, setEditDosageUnit] = useState(dosageUnit || 'mg');
    const [editInstructions, setEditInstructions] = useState(prescriptionInstructions || '');

    const durationText = formatDuration(durationMode, duration, manualDays, customDates, startDate);
    const canSave = editDosage !== '' && !Number.isNaN(Number(editDosage)) && Number(editDosage) >= 0;

    useEffect(() => {
        setEditDosage(dosage);
        setEditDosageUnit(dosageUnit || 'mg');
        setEditInstructions(prescriptionInstructions || '');
    }, [dosage, dosageUnit, prescriptionInstructions]);

    const handleSaveEdit = () => {
        if (!canSave || !onMedicationUpdate || !selectedDateKey || !medicationId) return;

        onMedicationUpdate(selectedDateKey, medicationId, {
            dosage: Number(editDosage),
            dosageUnit: editDosageUnit,
            prescriptionInstructions: editInstructions.trim(),
        });

        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditDosage(dosage);
        setEditDosageUnit(dosageUnit || 'mg');
        setEditInstructions(prescriptionInstructions || '');
        setIsEditing(false);
    };

    return (
        <div className={`pmc${expanded ? ' pmc--expanded' : ''}`}>
            <button className="pmc__header" onClick={() => setExpanded(e => !e)}>
                <div className="pmc__header-info">
                    <span className="pmc__patient-name">{patientName}</span>
                    <span className="pmc__patient-id">ID: {patientDisplayId}</span>
                    {doctorName && <span className="pmc__doctor">Dr. {doctorName}</span>}
                </div>
                <span className={`pmc__chevron${expanded ? ' pmc__chevron--up' : ''}`} />
            </button>

            <div className={`pmc__body${expanded ? ' pmc__body--open' : ''}`}>
                    <div className="pmc__detail-grid">
                        <span className="pmc__detail-label">Patient</span>
                        <span className="pmc__detail-value">{patientName}</span>

                        <span className="pmc__detail-label">Medication</span>
                        <span className="pmc__detail-value">{medication}</span>

                        <span className="pmc__detail-label">Start Date</span>
                        <span className="pmc__detail-value">{formatDate(startDate)}</span>

                        <span className="pmc__detail-label">Duration</span>
                        <span className="pmc__detail-value">{durationText}</span>

                        <span className="pmc__detail-label">Dosage</span>
                        <span className="pmc__detail-value">{dosage} {dosageUnit}</span>

                        {prescriptionInstructions && (
                            <>
                                <span className="pmc__detail-label">Instructions</span>
                                <span className="pmc__detail-value">{prescriptionInstructions}</span>
                            </>
                        )}
                    </div>

                    <div className={`pmc__action-row${isEditing ? ' pmc__action-row--hidden' : ''}`}>
                        <button
                            className="pmc__action-button"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit Prescription
                        </button>
                        <button
                            className="pmc__action-button"
                            onClick={() => setIsEditPlanOpen(true)}
                        >
                            Edit Medication Plan
                        </button>
                    </div>

                    <div className={`pmc__edit-form${isEditing ? ' pmc__edit-form--open' : ''}`}>
                            <label className="pmc__edit-label">Dosage</label>
                            <input
                                className="pmc__edit-input"
                                type="number"
                                min="0"
                                step="any"
                                value={editDosage}
                                onChange={(e) => setEditDosage(e.target.value)}
                            />

                            <label className="pmc__edit-label">Unit</label>
                            <input
                                className="pmc__edit-input"
                                type="text"
                                value={editDosageUnit}
                                onChange={(e) => setEditDosageUnit(e.target.value)}
                            />

                            <label className="pmc__edit-label">Instructions</label>
                            <textarea
                                className="pmc__edit-textarea"
                                value={editInstructions}
                                onChange={(e) => setEditInstructions(e.target.value)}
                                placeholder="Optional day-specific instructions"
                            />

                            <div className="pmc__edit-actions">
                                <button
                                    className="pmc__action-button pmc__action-button--primary"
                                    onClick={handleSaveEdit}
                                    disabled={!canSave}
                                >
                                    Save day edit
                                </button>
                                <button className="pmc__action-button" onClick={handleCancelEdit}>
                                    Cancel
                                </button>
                            </div>
                    </div>
                </div>

                <AddMedicationModal
                    isOpen={isEditPlanOpen}
                    onClose={() => setIsEditPlanOpen(false)}
                    medicationToEdit={{
                        medicationId,
                        patientId,
                        patientName,
                        patientDisplayId,
                        medication,
                        doctorName,
                        startDate,
                        durationMode,
                        duration,
                        manualDays,
                        weekdaysEndDate,
                        customDates,
                        dosage,
                        dosageUnit,
                        prescriptionInstructions,
                    }}
                />
        </div>
    );
}
