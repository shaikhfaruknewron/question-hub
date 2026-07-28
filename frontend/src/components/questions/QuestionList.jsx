import QuestionCard from "./QuestionCard";

const QuestionList = ({ questions, canManage = false, onEdit, onDelete }) => {
  if (questions.length === 0) {
    return <p className="text-sm text-gray-500">No questions found.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {questions.map((question) => (
        <QuestionCard
          key={question._id}
          question={question}
          canManage={canManage}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default QuestionList;
