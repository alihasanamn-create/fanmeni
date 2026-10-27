import {
  AlertTriangle,
} from "lucide-react";

import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmDialog({
  open,
  title = "Confirm Action",
  description = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      width="max-w-md"
    >
      <div className="flex flex-col items-center text-center">

        <div className="mb-5 rounded-full bg-red-100 p-4">
          <AlertTriangle
            size={40}
            className="text-red-600"
          />
        </div>

        <p className="mb-8 text-gray-600">
          {description}
        </p>

        <div className="flex w-full gap-3">

          <Button
            variant="secondary"
            className="flex-1"
            onClick={onCancel}
          >
            {cancelText}
          </Button>

          <Button
            variant="danger"
            className="flex-1"
            loading={loading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>

        </div>

      </div>
    </Modal>
  );
}