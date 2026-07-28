import PropTypes from "prop-types";

const COLORS = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
  draft: "bg-gray-100 text-gray-700",
  published: "bg-primary-100 text-primary-700",
  archived: "bg-gray-100 text-gray-500",
};

const Badge = ({ label, tone }) => {
  return (
    <span
      className={`inline-flex items-center rounded-xl px-3 py-1 text-xs font-medium ${
        COLORS[tone] || "bg-gray-100 text-gray-700"
      }`}
    >
      {label}
    </span>
  );
};

Badge.propTypes = {
  label: PropTypes.string.isRequired,
  tone: PropTypes.string,
};

Badge.defaultProps = {
  tone: "draft",
};

export default Badge;
