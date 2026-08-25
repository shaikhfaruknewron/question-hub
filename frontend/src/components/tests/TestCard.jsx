import Link from "next/link";
import Badge from "@/src/components/ui/Badge";
import Card from "@/src/components/ui/Card";

const TestCard = ({ test }) => {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-sm font-semibold text-gray-900">{test.title}</h3>
        <Badge label={test.studentStatus || test.visibility} tone={test.visibility} />
      </div>
      <p className="text-xs text-gray-500">{test.description}</p>
      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        <span>{test.durationMinutes} mins</span>
        <span>·</span>
        <span>{test.totalMarks} marks</span>
        <span>·</span>
        <span>{test.questionCount ?? test.questions?.length ?? 0} questions</span>
      </div>
      {test.studentStatus && (
        <p className="text-xs text-gray-500">
          Attempts: {test.attemptsUsed}/{test.maxAttempts}
          {test.attemptsRemaining > 0 ? ` · ${test.attemptsRemaining} remaining` : ""}
        </p>
      )}
      <Link href={`/dashboard/tests/${test._id}`} className="text-xs font-medium text-primary-600 hover:underline">
        View details
      </Link>
    </Card>
  );
};

export default TestCard;
