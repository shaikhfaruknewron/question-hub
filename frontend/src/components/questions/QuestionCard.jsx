import Badge from "@/src/components/ui/Badge";
import Card from "@/src/components/ui/Card";

const QuestionCard = ({ question, canManage = false, onEdit, onDelete }) => {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-sm font-semibold text-gray-900">{question.title}</h3>
        <Badge label={question.difficulty} tone={question.difficulty} />
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        <span>{question.type}</span>
        <span>·</span>
        <span>{question.category?.name || "Uncategorised"}</span>
        <span>·</span>
        <span>{question.marks} marks</span>
      </div>
      {canManage && (
        <div className="mt-2 flex gap-3">
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
      )}
    </Card>
  );
};

export default QuestionCard;
