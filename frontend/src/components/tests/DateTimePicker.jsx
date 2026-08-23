"use client";

const DateTimePicker = ({
  label,
  value = "",
  onChange,
  error = "",
  min,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        disabled={disabled}
        className={`w-full min-w-0 rounded-lg border px-3 py-2 text-sm outline-none transition
          ${
            error
              ? "border-red-500 focus:ring-2 focus:ring-red-200"
              : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          }
          ${
            disabled
              ? "cursor-not-allowed bg-gray-100 text-gray-500"
              : "bg-white"
          }
        `}
      />

      {error && (
        <p className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default DateTimePicker;