import React from "react";
import PropTypes from "prop-types";
import { AlertTriangle } from "../../lib/icons";
import * as Dialog from "@radix-ui/react-dialog";

const ConfirmModal = ({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  // Support both onClose and onCancel props, prioritizing onCancel for the Cancel button action
  const handleClose = onCancel || onClose;

  const getIconColor = () => {
    switch (type) {
      case "danger":
        return "text-red-600 bg-red-50";
      case "warning":
        return "text-amber-600 bg-amber-50";
      case "info":
        return "text-indigo-600 bg-indigo-50";
      default:
        return "text-red-600 bg-red-50";
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white border-transparent";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 text-white border-transparent";
      case "info":
        return "bg-indigo-600 hover:bg-indigo-700 text-white border-transparent";
      default:
        return "btn-primary";
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content
          className="modal-content max-w-md rounded-2xl animate-scale-in"
          aria-describedby={undefined}
        >
          <div className="p-6 sm:p-7">
            <div className="flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${getIconColor()}`}>
                <AlertTriangle size={24} strokeWidth={2.2} />
              </div>

              <Dialog.Title asChild>
                <h3 className="text-xl font-bold text-main mb-2">{title}</h3>
              </Dialog.Title>

              <Dialog.Description asChild>
                <p className="text-sm sm:text-[15px] text-muted leading-relaxed mb-7 max-w-sm mx-auto">
                  {message}
                </p>
              </Dialog.Description>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2.5 w-full">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="btn btn-ghost flex-1 justify-center border border-border-color rounded-full"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!isLoading) {
                    onConfirm();
                  }
                }}
                disabled={isLoading}
                className={`btn flex-1 justify-center rounded-full ${getButtonClass()} ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

ConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  type: PropTypes.oneOf(["danger", "warning", "info"]),
  isLoading: PropTypes.bool,
};

export default ConfirmModal;
