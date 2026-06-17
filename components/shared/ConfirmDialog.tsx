import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Confirm", danger, loading }: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center gap-4 mb-6">
        <div className={`p-3 rounded-2xl ${danger ? "bg-rose-500/10 text-rose-400" : "bg-brand-500/10 text-brand-400"}`}>
          <AlertTriangle size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold font-display mb-2">{title}</h3>
          <p className="text-sm text-white/60">{message}</p>
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button variant={danger ? "danger" : "primary"} className="flex-1" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
