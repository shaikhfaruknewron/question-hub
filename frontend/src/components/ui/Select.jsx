const Select = ({ label = "", id, options = [], error = "", placeholder, ...rest }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        id={id}
        aria-invalid={Boolean(error)}
        className={`rounded-xl border px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
};

export default Select;
