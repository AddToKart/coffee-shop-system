import React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

const Dialog = ({ open, onOpenChange, children }) => {
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/60 animate-in fade-in-0 duration-200"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 max-h-[90vh] w-full max-w-lg overflow-auto animate-in fade-in-0 zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ className, children, ...props }) => (
  <div
    className={cn(
      "relative bg-background border rounded-lg shadow-lg p-6 m-4",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const DialogHeader = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left mb-4",
      className
    )}
    {...props}
  />
);

const DialogTitle = ({ className, ...props }) => (
  <h2
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
);

const DialogDescription = ({ className, ...props }) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
);

const DialogFooter = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6",
      className
    )}
    {...props}
  />
);

const DialogClose = ({ className, onClose, ...props }) => (
  <button
    className={cn(
      "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      className
    )}
    onClick={onClose}
    {...props}
  >
    <X className="h-4 w-4" />
    <span className="sr-only">Close</span>
  </button>
);

export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
};
