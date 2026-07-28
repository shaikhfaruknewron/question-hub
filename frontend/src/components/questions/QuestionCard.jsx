import PropTypes from "prop-types";
import Badge from "@/src/components/ui/Badge";
import Card from "@/src/components/ui/Card";

const QuestionCard = ({ question, onEdit, onDelete }) => {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-sm font-semibold text-gray-900">{question.title}</h3>
        <Badge label={question.difficulty} tone={question.difficulty} />
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        <span>{question.type}</span>
        <span>·</span>
        <span>{question.category?.name}</span>
        <span>·</span>
        <span>{question.marks} marks</span>
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(question._id)}
          className="text-xs font-medium text-primary-600 hover:underline"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(question._id)}
          className="text-xs font-medium text-red-600 hover:underline"
        >
          Archive
        </button>
      </div>
    </Card>
  );
};

QuestionCard.propTypes = {
  question: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    difficulty: PropTypes.string.isRequired,
    marks: PropTypes.number.isRequired,
    category: PropTypes.shape({ name: PropTypes.string }),
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default QuestionCard;
