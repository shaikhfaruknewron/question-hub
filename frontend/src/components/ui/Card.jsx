import PropTypes from "prop-types";

const Card = ({ children, className }) => {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-md ${className}`}>
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Card.defaultProps = {
  className: "",
};

export default Card;
