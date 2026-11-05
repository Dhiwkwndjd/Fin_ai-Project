import { forwardRef } from "react";

const Select = forwardRef(function Select({ label, error, children, ...selectProps }, ref) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>}
      <select
        ref={ref}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${
          error ? "border-red-500" : "border-slate-300"
        }`}
        {...selectProps}
      >
        {children}
      </select>
      {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  );
});

export default Select;
