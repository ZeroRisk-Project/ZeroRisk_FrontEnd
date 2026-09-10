import { cn } from "@/src/shared/lib/utils";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmTone?: "buy" | "sell" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  confirmTone = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <h3 className="text-lg font-bold text-[#191F28] mb-2">{title}</h3>
          {description && (
            <p className="text-[14px] text-[#4E5968] leading-relaxed">{description}</p>
          )}
        </div>
        <div className="flex border-t border-[#E5E8EB]">
          <button
            onClick={onCancel}
            className="flex-1 py-4 text-[15px] font-medium text-[#8B95A1] active:bg-neutral-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <div className="w-[1px] bg-[#E5E8EB]" />
          <button
            onClick={onConfirm}
            className={cn(
                "flex-1 py-4 text-[15px] font-bold transition-colors active:bg-neutral-50",
                confirmTone === "buy" && "text-up",
                confirmTone === "sell" && "text-down",
                confirmTone === "default" && "text-brand",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
