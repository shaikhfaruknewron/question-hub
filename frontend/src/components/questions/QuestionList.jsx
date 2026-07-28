import PropTypes from "prop-types";
import QuestionCard from "./QuestionCard";

const QuestionList = ({ questions, onEdit, onDelete }) => {
  if (questions.length === 0) {
    return <p className="text-sm text-gray-500">No questions found.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {questions.map((question) => (
        <QuestionCard key={question._id} question={question} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
};

QuestionList.propTypes = {
  questions: PropTypes.arrayOf(PropTypes.object).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default QuestionList;
