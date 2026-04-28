import './dayModal.scss';

export default function DayModal({ isOpen, selectedDay, formData, onFormDataChange, onSave, onClose }) {
    if (!isOpen || !selectedDay) return null;

    return (
        <div className="modal">
            <div className="modal__overlay" onClick={onClose}></div>
            <div className="modal__content">
                <h3 className="modal__title">
                    Edit Day - {new Date(selectedDay.year, selectedDay.month).toLocaleString('default', { month: 'long' })} {selectedDay.day}, {selectedDay.year}
                </h3>
                <textarea
                    className="modal__textarea"
                    value={formData}
                    onChange={(e) => onFormDataChange(e.target.value)}
                    placeholder="Add notes for this day..."
                />
                <div className="modal__buttons">
                    <button className="modal__button modal__button--save" onClick={onSave}>Save</button>
                    <button className="modal__button modal__button--cancel" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}
