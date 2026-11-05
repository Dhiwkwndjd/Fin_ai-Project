import Button from "./Button";
import Modal from "./Modal";

export default function ConfirmModal({ isOpen, title = "Подтверждение", message, isLoading, onConfirm, onCancel }) {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onCancel}>
      <p className="mb-6 text-sm text-slate-600">{message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          Отмена
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? "Удаляем..." : "Удалить"}
        </Button>
      </div>
    </Modal>
  );
}
