import { useState, useContext, useMemo, useEffect } from 'react';
import { PatientContext } from '../../src/context/PatientContext';
import DayDetailModal from '../modal/DayDetailModal';
import './calendar.scss';

const DAY_NAME_TO_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function toDateKey(d) {
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function toDateKeyFromParts(year, monthIndex, day) {
    return `${year}-${monthIndex + 1}-${day}`;
}

function computeScheduledDates(med) {
    const dates = [];
    if (!med.startDate) return dates;

    if (med.durationMode === 'days') {
        const count = parseInt(med.duration) || 0;
        const start = new Date(med.startDate + 'T00:00:00');
        for (let i = 0; i < count; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            dates.push(toDateKey(d));
        }
    } else if (med.durationMode === 'weekdays') {
        const selected = new Set((med.manualDays || []).map(n => DAY_NAME_TO_INDEX[n]));
        const start = new Date(med.startDate + 'T00:00:00');
        const end = med.weekdaysEndDate
            ? new Date(med.weekdaysEndDate + 'T00:00:00')
            : new Date(start);
        if (!med.weekdaysEndDate) end.setFullYear(end.getFullYear() + 1);
        const cur = new Date(start);
        while (cur <= end) {
            if (selected.has(cur.getDay())) dates.push(toDateKey(cur));
            cur.setDate(cur.getDate() + 1);
        }
    } else if (med.durationMode === 'custom') {
        (med.customDates || []).forEach(iso => {
            const d = new Date(iso + 'T00:00:00');
            dates.push(toDateKey(d));
        });
    }

    return dates;
}

export default function Calendar() {
    const { patients, medications } = useContext(PatientContext);

    const [dayContents, setDayContents] = useState({});
    const [dayMedicationOverrides, setDayMedicationOverrides] = useState({});
    const [selectedPatientId, setSelectedPatientId] = useState('all');
    const [selectedDay, setSelectedDay] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState('');
    const [collapsedMonths, setCollapsedMonths] = useState({});
    const [today, setToday] = useState(new Date());

    const toggleMonth = (key) => {
        setCollapsedMonths(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const medicationsByDay = useMemo(() => {
        const map = {};
        const visibleMedications = selectedPatientId === 'all'
            ? medications
            : medications.filter(med => String(med.patientId) === String(selectedPatientId));

        visibleMedications.forEach(med => {
            const patient = patients.find(p => p.id === med.patientId);
            const entry = {
                medicationId: med.id,
                patientId: med.patientId,
                patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
                patientDisplayId: patient?.patientId || '--',
                doctorName: med.doctorName || '',
                medication: med.medication,
                startDate: med.startDate,
                durationMode: med.durationMode,
                duration: med.duration,
                manualDays: med.manualDays || [],
                weekdaysEndDate: med.weekdaysEndDate || null,
                customDates: med.customDates || [],
                dosage: med.dosage,
                dosageUnit: med.dosageUnit,
                prescriptionInstructions: med.prescriptionInstructions || '',
            };

            computeScheduledDates(med).forEach(key => {
                if (!map[key]) map[key] = [];

                const medicationOverride = dayMedicationOverrides[key]?.[med.id];
                map[key].push({
                    ...entry,
                    dosage: medicationOverride?.dosage ?? entry.dosage,
                    dosageUnit: medicationOverride?.dosageUnit ?? entry.dosageUnit,
                    prescriptionInstructions: medicationOverride?.prescriptionInstructions ?? entry.prescriptionInstructions,
                });
            });
        });

        return map;
    }, [medications, patients, dayMedicationOverrides, selectedPatientId]);

    useEffect(() => {
        const timer = setInterval(() => {
            setToday(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
    const nextMonth = nextMonthDate.getMonth();
    const nextYear = nextMonthDate.getFullYear();

    const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

    const openModal = (day, month, year) => {
        const dateKey = toDateKeyFromParts(year, month, day);
        setSelectedDay({ day, month, year, dateKey });
        setFormData(dayContents[dateKey] || '');
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedDay(null);
        setFormData('');
    };

    const updateMedicationForDay = (dateKey, medicationId, updates) => {
        if (!dateKey || !medicationId) return;

        setDayMedicationOverrides(prev => {
            const dayOverrides = prev[dateKey] || {};
            const medicationOverrides = dayOverrides[medicationId] || {};

            return {
                ...prev,
                [dateKey]: {
                    ...dayOverrides,
                    [medicationId]: {
                        ...medicationOverrides,
                        ...updates,
                    },
                },
            };
        });
    };

    const saveDay = () => {
        if (selectedDay) {
            setDayContents({ ...dayContents, [selectedDay.dateKey]: formData });
        }
        closeModal();
    };

    const renderMonth = (month, year) => {
        const monthKey = `${year}-${month}`;
        const isCollapsed = !!collapsedMonths[monthKey];
        const daysInMonth = getDaysInMonth(month, year);
        const firstDay = getFirstDayOfMonth(month, year);
        const monthName = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

        const todayKey = toDateKey(today);
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar__empty" />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = toDateKeyFromParts(year, month, day);
            const dayMeds = medicationsByDay[dateKey] || [];
            const hasNotes = !!dayContents[dateKey];
            const hasFill = dayMeds.length > 0 || hasNotes;
            const isToday = dateKey === todayKey;
            const dayDate = new Date(year, month, day);
            const isPast = dayDate < todayStart;

            let previewText = null;
            if (dayMeds.length === 1) {
                const firstName = dayMeds[0].patientName.split(' ')[0];
                previewText = `${firstName} - ${dayMeds[0].medication}`;
            } else if (dayMeds.length > 1) {
                previewText = `${dayMeds.length} patients`;
            } else if (hasNotes) {
                const notes = dayContents[dateKey];
                previewText = notes.length > 22 ? `${notes.substring(0, 20)}...` : notes;
            }

            days.push(
                <div
                    key={`day-${day}`}
                    className={`calendar__day${hasFill ? ' calendar__day--filled' : ''}${isToday ? ' calendar__day--today' : ''}${isPast ? ' calendar__day--past' : ''}`}
                    onClick={() => openModal(day, month, year)}
                >
                    <div className="calendar__day-header">
                        <span className="calendar__day-number">{day}</span>
                        {isToday && <span className="calendar__today-badge">Today</span>}
                    </div>
                    {previewText && (
                        <div className="calendar__day-preview">{previewText}</div>
                    )}
                </div>
            );
        }

        return (
            <div key={`month-${month}-${year}`} className="calendar__month">
                <div
                    className={`calendar__month-header${isCollapsed ? ' calendar__month-header--collapsed' : ''}`}
                    onClick={() => toggleMonth(monthKey)}
                >
                    <h2 className="calendar__month-title">{monthName}</h2>
                    <span className={`calendar__month-chevron${isCollapsed ? ' calendar__month-chevron--collapsed' : ''}`} />
                </div>
                <div className={`calendar__month-body${isCollapsed ? ' calendar__month-body--collapsed' : ''}`}>
                    <div className="calendar__month-body-inner">
                        <div className="calendar__weekdays">
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                                <div key={d} className="calendar__weekday">{d}</div>
                            ))}
                        </div>
                        <div className="calendar__grid">{days}</div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="calendar">
            <div className="calendar__filters">
                <label htmlFor="calendarPatientFilter" className="calendar__filter-label">Filter by patient</label>
                <select
                    id="calendarPatientFilter"
                    className="calendar__filter-select"
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                >
                    <option value="all">All patients</option>
                    {patients.map(patient => (
                        <option key={patient.id} value={patient.id}>
                            {patient.firstName} {patient.lastName} ({patient.patientId})
                        </option>
                    ))}
                </select>
            </div>

            {renderMonth(currentMonth, currentYear)}
            {renderMonth(nextMonth, nextYear)}

            <DayDetailModal
                isOpen={modalOpen}
                selectedDay={selectedDay}
                dayMedications={selectedDay ? (medicationsByDay[selectedDay.dateKey] || []) : []}
                formData={formData}
                onFormDataChange={setFormData}
                onMedicationUpdate={updateMedicationForDay}
                onSave={saveDay}
                onClose={closeModal}
            />
        </div>
    );
}
