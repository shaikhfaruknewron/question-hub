import PropTypes from "prop-types";
import TestCard from "./TestCard";

const TestList = ({ tests }) => {
  if (tests.length === 0) {
    return <p className="text-sm text-gray-500">No tests found.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {tests.map((test) => (
        <TestCard key={test._id} test={test} />
      ))}
    </div>
  );
};

TestList.propTypes = {
  tests: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default TestList;
