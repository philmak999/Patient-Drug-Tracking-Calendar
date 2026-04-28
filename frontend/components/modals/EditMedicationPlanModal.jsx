import AddMedicationModal from './AddMedicationModal';

export default function EditMedicationPlanModal({ isOpen, onClose, medicationToEdit }) {
    return (
        <AddMedicationModal
            isOpen={isOpen}
            onClose={onClose}
            medicationToEdit={medicationToEdit}
        />
    );
}
