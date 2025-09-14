import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

const Select = ({ value, onValueChange, children, ...props }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative" {...props}>
      {React.Children.map(children, (child) => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, { open, setOpen, value });
        }
        if (child.type === SelectContent) {
          return React.cloneElement(child, {
            open,
            setOpen,
            onValueChange,
            value,
          });
        }
        return child;
      })}
    </div>
  );
};

const SelectTrigger = ({
  className,
  children,
  open,
  setOpen,
  value,
  ...props
}) => (
  <button
    type="button"
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    onClick={() => setOpen(!open)}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </button>
);

const SelectValue = ({ placeholder, value, children }) => {
  return <span>{value || placeholder}</span>;
};

const SelectContent = ({
  className,
  children,
  open,
  setOpen,
  onValueChange,
  value,
  ...props
}) => {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      <div
        className={cn(
          "absolute top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95 duration-200",
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (child.type === SelectItem) {
            return React.cloneElement(child, {
              onValueChange,
              setOpen,
              currentValue: value,
            });
          }
          return child;
        })}
      </div>
    </>
  );
};

const SelectItem = ({
  className,
  children,
  value,
  onValueChange,
  setOpen,
  currentValue,
  ...props
}) => (
  <div
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      currentValue === value && "bg-accent text-accent-foreground",
      className
    )}
    onClick={() => {
      onValueChange(value);
      setOpen(false);
    }}
    {...props}
  >
    {children}
  </div>
);

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
