import { useState, useContext, useEffect, useRef } from 'react';
import { PatientContext } from '../../src/context/PatientContext';
import './addMedicationModal.scss';

function formatDateWithOrdinal(date) {
    const months = [
        'January','February','March','April','May','June',
        'July','August','September','October','November','December',
    ];
    const d = date.getDate();
    const suffix =
        d % 10 === 1 && d !== 11 ? 'st' :
        d % 10 === 2 && d !== 12 ? 'nd' :
        d % 10 === 3 && d !== 13 ? 'rd' : 'th';
    return `${months[date.getMonth()]} ${d}${suffix}, ${date.getFullYear()}`;
}

function formatDateShort(iso) {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AddMedicationModal({ isOpen, onClose, prefillStartDate = '' }) {
    const { patients, doctors, addMedication, loading, fetchPatients, fetchDoctors } = useContext(PatientContext);
    const [formData, setFormData] = useState({
        patientId: '',
        medication: '',
        doctorName: '',
        startDate: '',
        durationMode: 'days',
        duration: '',
        manualDays: [],
        dosage: '',
        dosageUnit: 'mg',
        prescriptionInstructions: '',
    });

    const [selectedDays, setSelectedDays] = useState([]);
    const [customDates, setCustomDates] = useState([]);
    const [patientSearch, setPatientSearch] = useState('');
    const [showPatientDropdown, setShowPatientDropdown] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarViewDate, setCalendarViewDate] = useState(new Date());
    const [customCalViewDate, setCustomCalViewDate] = useState(new Date());
    const [error, setError] = useState(null);
    const dateWrapperRef = useRef(null);

    const dosageUnits = ['mg', 'g', 'mcg', 'mL', 'oz', 'tsp', 'tbsp', 'IU', 'units'];
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    useEffect(() => {
        if (isOpen && patients.length === 0) fetchPatients();
        if (isOpen && doctors.length === 0) fetchDoctors();
    }, [isOpen, patients.length, doctors.length, fetchPatients, fetchDoctors]);

    useEffect(() => {
        if (!isOpen) return;

        setFormData(prev => ({
            ...prev,
            startDate: prefillStartDate || '',
        }));
    }, [isOpen, prefillStartDate]);

    useEffect(() => {
        if (!showCalendar) return;
        const handleClickOutside = (e) => {
            if (dateWrapperRef.current && !dateWrapperRef.current.contains(e.target))
                setShowCalendar(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showCalendar]);

    const filteredPatients = patients.filter(patient => {
        const query = patientSearch.toLowerCase();
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
        return fullName.includes(query) || patient.patientId.toLowerCase().includes(query);
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleDurationModeChange = (e) => {
        setFormData(prev => ({ ...prev, durationMode: e.target.value, duration: '', manualDays: [] }));
        setSelectedDays([]);
        setCustomDates([]);
    };

    const handlePatientSearch = (value) => {
        setPatientSearch(value);
        setShowPatientDropdown(value.trim().length > 0);
        if (value === '') setFormData(prev => ({ ...prev, patientId: '' }));
    };

    const selectPatient = (patient) => {
        setFormData(prev => ({ ...prev, patientId: patient.id }));
        setPatientSearch(`${patient.firstName} ${patient.lastName} (${patient.patientId})`);
        setShowPatientDropdown(false);
    };

    const handleDayToggle = (day) => {
        setSelectedDays(prev => {
            const next = prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort();
            setFormData(f => ({ ...f, manualDays: next }));
            return next;
        });
    };

    const toggleCustomDate = (iso) => {
        setCustomDates(prev =>
            prev.includes(iso) ? prev.filter(d => d !== iso) : [...prev, iso].sort()
        );
    };

    const openCalendar = () => {
        setCalendarViewDate(formData.startDate ? new Date(formData.startDate + 'T00:00:00') : new Date());
        setShowCalendar(prev => !prev);
    };

    const getDurationPreview = () => {
        if (!formData.startDate || !formData.duration || Number(formData.duration) < 1) return null;
        const start = new Date(formData.startDate + 'T00:00:00');
        const end = new Date(start);
        end.setDate(end.getDate() + Number(formData.duration) - 1);
        return `${formatDateWithOrdinal(start)} to ${formatDateWithOrdinal(end)}`;
    };

    const handleAddMedication = async () => {
        if (!formData.patientId) { setError('Please select a patient'); return; }
        if (!formData.medication.trim()) { setError('Medication name is required'); return; }
        if (formData.durationMode === 'days' && (!formData.duration || formData.duration < 1)) {
            setError('Please enter a valid number of days'); return;
        }
        if (formData.durationMode === 'weekdays' && selectedDays.length === 0) {
            setError('Please select at least one day'); return;
        }
        if (formData.durationMode === 'custom' && customDates.length === 0) {
            setError('Please select at least one date'); return;
        }
        if (!formData.dosage || formData.dosage < 0) { setError('Please enter a valid dosage'); return; }

        try {
            await addMedication({
                ...formData,
                manualDays: formData.durationMode === 'weekdays' ? selectedDays : undefined,
                customDates: formData.durationMode === 'custom' ? customDates : undefined,
            });
            resetForm();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to add medication');
        }
    };

    const resetForm = () => {
        setFormData({
            patientId: '', medication: '', doctorName: '', startDate: '',
            durationMode: 'days', duration: '', manualDays: [],
            dosage: '', dosageUnit: 'mg', prescriptionInstructions: '',
        });
        setSelectedDays([]);
        setCustomDates([]);
        setPatientSearch('');
        setShowCalendar(false);
        setError(null);
    };

    const handleCancel = () => { resetForm(); onClose(); };

    const renderMiniCal = ({ viewDate, setViewDate, isSelected, onDayClick, inline = false }) => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const monthLabel = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        const todayStr = new Date().toDateString();

        const cells = [];
        for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`} className="mini-cal__empty" />);
        for (let d = 1; d <= daysInMonth; d++) {
            const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const thisDate = new Date(year, month, d);
            const selected = isSelected(iso, thisDate);
            const isToday = thisDate.toDateString() === todayStr;
            cells.push(
                <button
                    key={d}
                    type="button"
                    className={`mini-cal__day${selected ? ' mini-cal__day--selected' : ''}${isToday && !selected ? ' mini-cal__day--today' : ''}`}
                    onClick={() => onDayClick(iso)}
                >
                    {d}
                </button>
            );
        }

        return (
            <div className={`mini-cal${inline ? ' mini-cal--inline' : ''}`}>
                <div className="mini-cal__header">
                    <button type="button" className="mini-cal__nav"
                        onClick={() => setViewDate(new Date(year, month - 1, 1))}>&#8249;</button>
                    <span className="mini-cal__month-title">{monthLabel}</span>
                    <button type="button" className="mini-cal__nav"
                        onClick={() => setViewDate(new Date(year, month + 1, 1))}>&#8250;</button>
                </div>
                <div className="mini-cal__weekdays">
                    {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                        <div key={d} className="mini-cal__weekday">{d}</div>
                    ))}
                </div>
                <div className="mini-cal__grid">{cells}</div>
            </div>
        );
    };

    if (!isOpen) return null;

    const durationPreview = getDurationPreview();
    const startDateDisplay = formData.startDate
        ? new Date(formData.startDate + 'T00:00:00').toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric',
          })
        : '';
    const todayAtMidnight = new Date();
    todayAtMidnight.setHours(0, 0, 0, 0);
    const selectedStartDate = formData.startDate ? new Date(formData.startDate + 'T00:00:00') : null;
    const isPastStartDate = !!selectedStartDate && selectedStartDate < todayAtMidnight;

    return (
        <div className="medication-modal">
            <div className="medication-modal__overlay" onClick={handleCancel}></div>
            <div className="medication-modal__content">
                <h2 className="medication-modal__title">Add New Medication</h2>

                {error && <div className="medication-modal__error">{error}</div>}

                <div className="medication-modal__form-group">
                    <label htmlFor="patientSearch" className="medication-modal__label">Patient</label>
                    <div className="medication-modal__patient-search">
                        <input
                            type="text"
                            id="patientSearch"
                            value={patientSearch}
                            onChange={(e) => handlePatientSearch(e.target.value)}
                            className="medication-modal__input"
                            placeholder="Search patient by name or ID"
                            autoComplete="off"
                        />
                        {showPatientDropdown && (
                            <div className="medication-modal__patient-dropdown">
                                {filteredPatients.length > 0 ? (
                                    filteredPatients.map(patient => (
                                        <div
                                            key={patient.id}
                                            className="medication-modal__patient-option"
                                            onClick={() => selectPatient(patient)}
                                        >
                                            <div className="medication-modal__patient-name">
                                                {patient.firstName} {patient.lastName}
                                            </div>
                                            <div className="medication-modal__patient-meta">
                                                <span className="medication-modal__patient-id">{patient.patientId}</span>
                                                <span className="medication-modal__patient-age">Age: {patient.age}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="medication-modal__patient-option medication-modal__patient-option--empty">
                                        No patients found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="medication-modal__form-group">
                    <label htmlFor="medication" className="medication-modal__label">Medication Name</label>
                    <input
                        type="text"
                        id="medication"
                        name="medication"
                        value={formData.medication}
                        onChange={handleChange}
                        className="medication-modal__input"
                        placeholder="Enter medication name"
                    />
                </div>

                <div className="medication-modal__form-group">
                    <label htmlFor="doctorName" className="medication-modal__label">Prescribed By</label>
                    <select
                        id="doctorName"
                        name="doctorName"
                        value={formData.doctorName}
                        onChange={handleChange}
                        className="medication-modal__select"
                    >
                        <option value="">— Select a prescribing doctor —</option>
                        {doctors.map(doctor => (
                            <option
                                key={doctor.id}
                                value={`${doctor.firstName} ${doctor.lastName}`}
                            >
                                Dr. {doctor.firstName} {doctor.lastName} — {doctor.specialty}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="medication-modal__form-group">
                    <label className="medication-modal__label">Start Date</label>
                    <div className="medication-modal__date-wrapper" ref={dateWrapperRef}>
                        <button
                            type="button"
                            className={`medication-modal__date-btn${formData.startDate ? ' medication-modal__date-btn--has-value' : ''}`}
                            onClick={openCalendar}
                        >
                            {startDateDisplay || 'Select a start date'}
                        </button>
                        {showCalendar && renderMiniCal({
                            viewDate: calendarViewDate,
                            setViewDate: setCalendarViewDate,
                            isSelected: (iso) => iso === formData.startDate,
                            onDayClick: (iso) => {
                                setFormData(prev => ({ ...prev, startDate: iso }));
                                setShowCalendar(false);
                            },
                        })}
                    </div>
                    {isPastStartDate && (
                        <div className="medication-modal__warning">
                            Warning: You have selected a past date. You are editing medication information retroactively.
                        </div>
                    )}
                </div>

                <div className="medication-modal__form-group">
                    <label htmlFor="durationMode" className="medication-modal__label">Duration</label>
                    <select
                        id="durationMode"
                        name="durationMode"
                        value={formData.durationMode}
                        onChange={handleDurationModeChange}
                        className="medication-modal__select medication-modal__select--duration-mode"
                    >
                        <option value="days">Number of Days</option>
                        <option value="weekdays">Day of the Week</option>
                        <option value="custom">Custom Dates</option>
                    </select>

                    {formData.durationMode === 'days' && (
                        <>
                            <input
                                type="number"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                className="medication-modal__input"
                                placeholder="Enter number of days"
                                min="1"
                            />
                            {durationPreview && (
                                <div className="medication-modal__duration-preview">
                                    <span className="medication-modal__duration-preview-label">Duration:</span>
                                    {durationPreview}
                                </div>
                            )}
                        </>
                    )}

                    {formData.durationMode === 'weekdays' && (
                        <div className="medication-modal__day-selector">
                            {weekDays.map(day => (
                                <button
                                    key={day}
                                    type="button"
                                    className={`medication-modal__day-btn${selectedDays.includes(day) ? ' medication-modal__day-btn--selected' : ''}`}
                                    onClick={() => handleDayToggle(day)}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    )}

                    {formData.durationMode === 'custom' && (
                        <>
                            <div className="medication-modal__custom-cal-container">
                                {renderMiniCal({
                                    viewDate: customCalViewDate,
                                    setViewDate: setCustomCalViewDate,
                                    isSelected: (iso) => customDates.includes(iso),
                                    onDayClick: toggleCustomDate,
                                    inline: true,
                                })}
                            </div>
                            {customDates.length > 0 && (
                                <div className="medication-modal__custom-date-chips">
                                    {customDates.map(iso => (
                                        <span key={iso} className="medication-modal__custom-date-chip">
                                            {formatDateShort(iso)}
                                            <button
                                                type="button"
                                                className="medication-modal__chip-remove"
                                                onClick={() => setCustomDates(prev => prev.filter(d => d !== iso))}
                                            >
                                                &times;
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="medication-modal__dosage-row">
                    <div className="medication-modal__form-group medication-modal__form-group--flex">
                        <label htmlFor="dosage" className="medication-modal__label">Dosage</label>
                        <input
                            type="number"
                            id="dosage"
                            name="dosage"
                            value={formData.dosage}
                            onChange={handleChange}
                            className="medication-modal__input medication-modal__input--dosage"
                            placeholder="Enter amount"
                            step="0.1"
                            min="0"
                        />
                    </div>

                    <div className="medication-modal__form-group medication-modal__form-group--flex">
                        <label htmlFor="dosageUnit" className="medication-modal__label">Unit</label>
                        <select
                            id="dosageUnit"
                            name="dosageUnit"
                            value={formData.dosageUnit}
                            onChange={handleChange}
                            className="medication-modal__select"
                        >
                            {dosageUnits.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="medication-modal__form-group">
                    <label htmlFor="prescriptionInstructions" className="medication-modal__label">
                        Prescription Instructions
                    </label>
                    <textarea
                        id="prescriptionInstructions"
                        name="prescriptionInstructions"
                        value={formData.prescriptionInstructions}
                        onChange={handleChange}
                        className="medication-modal__textarea"
                        placeholder="Enter prescription instructions..."
                        rows="3"
                    />
                </div>

                <div className="medication-modal__buttons">
                    <button
                        className="medication-modal__button medication-modal__button--add"
                        onClick={handleAddMedication}
                        disabled={loading}
                    >
                        {loading ? 'Adding...' : 'Add Medication'}
                    </button>
                    <button
                        className="medication-modal__button medication-modal__button--cancel"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
