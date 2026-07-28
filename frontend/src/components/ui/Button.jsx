import PropTypes from "prop-types";

const VARIANTS = {
  primary: "bg-primary-600 hover:bg-primary-700 text-white",
  secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  outline: "border border-gray-300 hover:bg-gray-50 text-gray-700",
};

const Button = ({ children, variant, type, onClick, disabled, className }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["primary", "secondary", "danger", "outline"]),
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

Button.defaultProps = {
  variant: "primary",
  type: "button",
  onClick: undefined,
  disabled: false,
  className: "",
};

export default Button;
