"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Button from "@/src/components/ui/Button";
import Card from "@/src/components/ui/Card";
import { api } from "@/src/utils/api";

const TEXT_TYPES = ["descriptive", "coding"];

const buildInitialAnswers = (savedAnswers = []) =>
  savedAnswers.reduce((acc, saved) => {
    acc[saved.question] = {
      selectedOptions: (saved.selectedOptions || []).map(String),
      textAnswer: saved.textAnswer || "",
      codeAnswer: saved.codeAnswer || "",
    };
    return acc;
  }, {});

const emptyAnswer = { selectedOptions: [], textAnswer: "", codeAnswer: "" };

const hasResponse = (answer) =>
  Boolean(answer) &&
  (answer.selectedOptions?.length > 0 ||
    answer.textAnswer?.trim() ||
    answer.codeAnswer?.trim());


    const PROCTORING_WARNING_MESSAGES = {
  TAB_SWITCH: "You switched away from the test tab.",
  FULLSCREEN_EXIT: "You exited fullscreen mode.",
  COPY_ATTEMPT: "Copying is not allowed during the test.",
  CUT_ATTEMPT: "Cutting content is not allowed during the test.",
  PASTE_ATTEMPT: "Pasting content is not allowed during the test.",
  RIGHT_CLICK_ATTEMPT: "Right-clicking is not allowed during the test.",
  CAMERA_STREAM_ENDED: "Your camera connection was interrupted.",
  MICROPHONE_STREAM_ENDED: "Your microphone connection was interrupted.",
  CAMERA_UNAVAILABLE: "Your camera is unavailable.",
  MICROPHONE_UNAVAILABLE: "Your microphone is unavailable.",
};

const TestAttemptRunner = ({
  attemptId,
  attemptNumber,
  maxAttempts,
  remainingAttempts,
  questions,
  secondsRemaining,
  savedAnswers,
  proctoringStream,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(() => buildInitialAnswers(savedAnswers));
  const [secondsLeft, setSecondsLeft] = useState(secondsRemaining);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [proctoringWarning, setProctoringWarning] = useState(null);
  const [proctoringStatus, setProctoringStatus] = useState({
  camera: true,
  microphone: true,
  fullscreen: true,
  violations: 0,
});
  // Auto-submit on timeout must fire exactly once.
  const submittedRef = useRef(false);
  const recentProctoringEventsRef = useRef({});
  const submitTestRef = useRef(null);
  const reportProctoringEventRef = useRef(null);
  const lastTabSwitchRef = useRef(0);
  const proctoringActiveRef = useRef(true);


  const currentQuestion = questions[currentIndex];
  const reportProctoringEvent = useCallback(
  async (eventType, metadata = {}) => {
    if (!proctoringActiveRef.current) {
  return null;
}
    const now = Date.now();

const lastReported =
  recentProctoringEventsRef.current[eventType] || 0;

// Ignore duplicate reports of the same event within 2 seconds.
if (now - lastReported < 2000) {
  return null;
}

recentProctoringEventsRef.current[eventType] = now;
    try {
      const response = await api.post(
        `/attempts/${attemptId}/proctoring-events`,
        {
          eventType,
          metadata,
        }
      );

      const data = response.data;

      setProctoringStatus((prev) => ({
  ...prev,
  violations:
    data?.proctoring?.totalViolations ?? prev.violations,
}));

if (data?.action === "WARNING") {
  setProctoringWarning({
    eventType,
    totalViolations:
      data?.proctoring?.totalViolations ?? 0,
  });
}

return data?.action;
    } catch (err) {
      console.error(
        "Failed to report proctoring event:",
        eventType,
        err
      );

      return null;
    }
  },
  [attemptId]
);

useEffect(() => {
  reportProctoringEventRef.current = reportProctoringEvent;
}, [reportProctoringEvent]);

   const saveAnswer = useCallback(
    async (questionId, answer) => {
      try {
        await api.patch(`/attempts/${attemptId}/answer`, {
          question: questionId,
          selectedOptions: answer.selectedOptions,
          textAnswer: answer.textAnswer,
          codeAnswer: answer.codeAnswer,
        });
        setError("");
      } catch (err) {
        setError(`Could not save your answer: ${err.message}`);
        throw err;
      }
    },
    [attemptId]
  );

 const handleSubmitTest = useCallback(async (submissionReason = "student-submitted") => {
  if (submittedRef.current) return;

  submittedRef.current = true;
  proctoringActiveRef.current = false;

  if (proctoringStream) {
  proctoringStream.getTracks().forEach((track) => {
    track.stop();
  });
}

if (document.fullscreenElement) {
  try {
    await document.exitFullscreen();
  } catch (err) {
    console.error("Failed to exit fullscreen:", err);
  }
}
  setIsSubmitting(true);
  setError("");

  try {
    // Save the latest answer currently shown on screen.
    const currentAnswer = answers[currentQuestion.id];

    if (currentAnswer && hasResponse(currentAnswer)) {
      await saveAnswer(currentQuestion.id, currentAnswer);
    }

    // Now submit the complete attempt.
    const result = await api.patch(`/attempts/${attemptId}/submit`, {
      submissionReason,
    });
    onComplete(result.data);
  } catch (err) {
    submittedRef.current = false;
    setError(err.message);
    setIsSubmitting(false);
  }
}, [
  answers, attemptId, currentQuestion, onComplete,proctoringStream, saveAnswer,]);


  useEffect(() => {
submitTestRef.current = handleSubmitTest;
}, [handleSubmitTest]);

useEffect(() => {
  const handleVisibilityChange = async () => {
    if (document.visibilityState !== "hidden") return;
     lastTabSwitchRef.current = Date.now();
    const action =
      await reportProctoringEventRef.current?.(
        "TAB_SWITCH",
        {
          visibilityState: document.visibilityState,
        }
      );

    if (action === "AUTO_SUBMIT") {
      submitTestRef.current?.("proctoring-violation");
    }
  };

  document.addEventListener(
    "visibilitychange",
    handleVisibilityChange
  );

  return () => {
    document.removeEventListener(
      "visibilitychange",
      handleVisibilityChange
    );
  };
}, []);

useEffect(() => {
  const handleFullscreenChange = async () => {
  // If still in fullscreen, nothing suspicious happened.
  if (document.fullscreenElement) {
      setProctoringStatus((prev) => ({
      ...prev,
      fullscreen: true,
    }));
   return;
  }

   setProctoringStatus((prev) => ({
    ...prev,
    fullscreen: false,
  }));

  const now = Date.now();

  const recentlySwitchedTab =
    now - lastTabSwitchRef.current < 1500;

  // A tab switch can automatically cause fullscreen to exit.
  // Don't count that fullscreen exit as another violation.
  if (recentlySwitchedTab) {
    return;
  }

  const action =
    await reportProctoringEventRef.current?.(
      "FULLSCREEN_EXIT",
      {
        reason: "fullscreen_exited",
      }
    );

  if (action === "AUTO_SUBMIT") {
    submitTestRef.current?.("proctoring-violation");
  }
};

  document.addEventListener(
    "fullscreenchange",
    handleFullscreenChange
  );

  return () => {
    document.removeEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );
  };
}, []);


useEffect(() => {
  const handleCopy = async (event) => {
    event.preventDefault();

    const action =
      await reportProctoringEventRef.current?.(
        "COPY_ATTEMPT",
        {
          source: "copy_event",
        }
      );

    if (action === "AUTO_SUBMIT") {
      submitTestRef.current?.("proctoring-violation");
    }
  };

  const handleCut = async (event) => {
    event.preventDefault();

    const action =
      await reportProctoringEventRef.current?.(
        "CUT_ATTEMPT",
        {
          source: "cut_event",
        }
      );

    if (action === "AUTO_SUBMIT") {
      submitTestRef.current?.("proctoring-violation");
    }
  };

  const handlePaste = async (event) => {
    event.preventDefault();

    const action =
      await reportProctoringEventRef.current?.(
        "PASTE_ATTEMPT",
        {
          source: "paste_event",
        }
      );

    if (action === "AUTO_SUBMIT") {
      submitTestRef.current?.("proctoring-violation");
    }
  };

  document.addEventListener("copy", handleCopy);
  document.addEventListener("cut", handleCut);
  document.addEventListener("paste", handlePaste);

  return () => {
    document.removeEventListener("copy", handleCopy);
    document.removeEventListener("cut", handleCut);
    document.removeEventListener("paste", handlePaste);
  };
}, []);

useEffect(() => {
  const handleContextMenu = async (event) => {
    event.preventDefault();

    const action =
      await reportProctoringEventRef.current?.(
        "RIGHT_CLICK_ATTEMPT",
        {
          source: "context_menu",
        }
      );

    if (action === "AUTO_SUBMIT") {
      submitTestRef.current?.("proctoring-violation");
    }
  };

  document.addEventListener("contextmenu", handleContextMenu);

  return () => {
    document.removeEventListener(
      "contextmenu",
      handleContextMenu
    );
  };
}, []);

useEffect(() => {
  if (!proctoringStream) return;

  const videoTrack = proctoringStream.getVideoTracks()[0];
  const audioTrack = proctoringStream.getAudioTracks()[0];

  const handleCameraEnded = async () => {
    const action =
      await reportProctoringEventRef.current?.(
        "CAMERA_STREAM_ENDED",
        {
          reason: "video_track_ended",
        }
      );

    if (action === "AUTO_SUBMIT") {
      submitTestRef.current?.("proctoring-violation");
    }
  };

  const handleMicrophoneEnded = async () => {
    const action =
      await reportProctoringEventRef.current?.(
        "MICROPHONE_STREAM_ENDED",
        {
          reason: "audio_track_ended",
        }
      );

    if (action === "AUTO_SUBMIT") {
      submitTestRef.current?.("proctoring-violation");
    }
  };

  if (videoTrack) {
    videoTrack.addEventListener("ended", handleCameraEnded);
  }

  if (audioTrack) {
    audioTrack.addEventListener("ended", handleMicrophoneEnded);
  }

  return () => {
    if (videoTrack) {
      videoTrack.removeEventListener("ended", handleCameraEnded);
    }

    if (audioTrack) {
      audioTrack.removeEventListener("ended", handleMicrophoneEnded);
    }
  };
}, [proctoringStream]);

useEffect(() => {
  if (!proctoringStream) return;

  let cameraViolationReported = false;
  let microphoneViolationReported = false;

  const checkMediaHealth = async () => {
    const videoTrack = proctoringStream.getVideoTracks()[0];
    const audioTrack = proctoringStream.getAudioTracks()[0];

    // Camera is missing, disabled, or ended.
    if (
      !videoTrack ||
      videoTrack.readyState === "ended" ||
      !videoTrack.enabled
    ) {
      setProctoringStatus((prev) => ({
  ...prev,
  camera: false,
}));
      if (!cameraViolationReported) {
        cameraViolationReported = true;

        const action =
          await reportProctoringEventRef.current?.(
            "CAMERA_UNAVAILABLE",
            {
              readyState: videoTrack?.readyState || "missing",
              enabled: videoTrack?.enabled ?? false,
            }
          );

        if (action === "AUTO_SUBMIT") {
          submitTestRef.current?.("proctoring-violation");
        }
      }
    } else {
      // Camera recovered.
      cameraViolationReported = false;

      setProctoringStatus((prev) => ({
    ...prev,
    camera: true,
  }));
    }

    // Microphone is missing, disabled, or ended.
    if (
      !audioTrack ||
      audioTrack.readyState === "ended" ||
      !audioTrack.enabled
    ) {
      setProctoringStatus((prev) => ({
  ...prev,
  microphone: true,
}));
      if (!microphoneViolationReported) {
        microphoneViolationReported = true;

        const action =
          await reportProctoringEventRef.current?.(
            "MICROPHONE_UNAVAILABLE",
            {
              readyState: audioTrack?.readyState || "missing",
              enabled: audioTrack?.enabled ?? false,
            }
          );

        if (action === "AUTO_SUBMIT") {
          submitTestRef.current?.("proctoring-violation");
        }
      }
    } else {
      // Microphone recovered.
      microphoneViolationReported = false;

      setProctoringStatus((prev) => ({
  ...prev,
  microphone: false,
}));
    }
  };

  // Check once immediately.
  checkMediaHealth();

  // Check every 3 seconds.
  const interval = setInterval(checkMediaHealth, 3000);

  return () => {
    clearInterval(interval);
  };
}, [proctoringStream]);

  useEffect(() => {
    // One interval for the whole run; the tick reads from the state updater.
    const timer = setInterval(() => {
      if (submittedRef.current) {
  clearInterval(timer);
  return;
}
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest("time-expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleSubmitTest]);

  const timeDisplay = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [secondsLeft]);

 

  const selectOption = (optionId) => {
    const isMulti = currentQuestion.type === "multiple-choice";
    const previous = answers[currentQuestion.id] || emptyAnswer;
    const current = previous.selectedOptions;

    const selectedOptions = isMulti
      ? current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId]
      : [optionId];

    const next = { ...previous, selectedOptions };
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: next }));
    saveAnswer(currentQuestion.id, next);
  };

  const updateText = (field, value) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { ...(prev[currentQuestion.id] || emptyAnswer), [field]: value },
    }));
  };

  // Text answers are saved when the field loses focus rather than on every keystroke.
  const flushText = () => {
    const answer = answers[currentQuestion.id];
    if (answer) saveAnswer(currentQuestion.id, answer);
  };

  const goToQuestion = (index) => setCurrentIndex(index);

  const currentAnswer = answers[currentQuestion.id] || emptyAnswer;
  const isTextQuestion = TEXT_TYPES.includes(currentQuestion.type);
  const answeredCount = questions.filter((q) => hasResponse(answers[q.id])).length;
  const isLowOnTime = secondsLeft <= 60;

  return (
    <div className="flex flex-col gap-4 ">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
  <div
    className={`rounded-xl border px-3 py-2 text-sm ${
      proctoringStatus.camera
        ? "border-green-200 bg-green-50 text-green-700"
        : "border-red-200 bg-red-50 text-red-700"
    }`}
  >
    {proctoringStatus.camera
      ? "● Camera active"
      : "● Camera unavailable"}
  </div>

  <div
    className={`rounded-xl border px-3 py-2 text-sm ${
      proctoringStatus.microphone
        ? "border-green-200 bg-green-50 text-green-700"
        : "border-red-200 bg-red-50 text-red-700"
    }`}
  >
    {proctoringStatus.microphone
      ? "● Microphone active"
      : "● Microphone unavailable"}
  </div>

  <div
    className={`rounded-xl border px-3 py-2 text-sm ${
      proctoringStatus.fullscreen
        ? "border-green-200 bg-green-50 text-green-700"
        : "border-red-200 bg-red-50 text-red-700"
    }`}
  >
    {proctoringStatus.fullscreen
      ? "● Fullscreen active"
      : "● Fullscreen exited"}
  </div>

  <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
    ⚠ Violations: {proctoringStatus.violations}
  </div>
</div>
      {proctoringWarning && (
  <div
    role="alert"
    className="rounded-xl border border-yellow-300 bg-yellow-50 p-4"
  >
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="font-semibold text-yellow-800">
          ⚠️ Proctoring Warning
        </h3>

        <p className="mt-1 text-sm text-yellow-700">
  {PROCTORING_WARNING_MESSAGES[
    proctoringWarning.eventType
  ] || "Suspicious activity was detected during your test."}
</p>

        <p className="mt-1 text-sm text-yellow-700">
          Total violations:{" "}
          <span className="font-semibold">
            {proctoringWarning.totalViolations}
          </span>
        </p>
      </div>

      <Button
  type="button"
  variant="outline"
  onClick={() => setProctoringWarning(null)}
>
  Dismiss
</Button>
    </div>
  </div>
)}
      <div className="flex-1">
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
            <span className="text-sm font-medium text-gray-500">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-xs text-gray-500">
               Attempt {attemptNumber} of {maxAttempts} ·{" "}
               {remainingAttempts} attempt
               {remainingAttempts !== 1 ? "s" : ""} remaining
             </span>
             </div>
            <span
              aria-live="polite"
              className={`rounded-xl px-3 py-1 text-sm font-semibold ${
                isLowOnTime ? "bg-red-50 text-red-700" : "bg-primary-50 text-primary-700"
              }`}
            >
              {timeDisplay}
            </span>
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-900">{currentQuestion.title}</h2>
            <p className="mt-1 text-xs text-gray-500">
              {currentQuestion.marks} mark(s)
              {currentQuestion.type === "multiple-choice" && " · select all that apply"}
            </p>
          </div>

          {isTextQuestion ? (
            <textarea
              aria-label="Your answer"
              rows={currentQuestion.type === "coding" ? 12 : 6}
              value={
                currentQuestion.type === "coding"
                  ? currentAnswer.codeAnswer || currentQuestion.codingConfig?.starterCode || ""
                  : currentAnswer.textAnswer
              }
              onChange={(e) =>
                updateText(
                  currentQuestion.type === "coding" ? "codeAnswer" : "textAnswer",
                  e.target.value
                )
              }
              onBlur={flushText}
              className={`w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                currentQuestion.type === "coding" ? "font-mono" : ""
              }`}
              placeholder="Type your answer here..."
            />
          ) : (
            <div className="flex flex-col gap-2">
              {currentQuestion.options?.map((option) => {
                const isSelected = currentAnswer.selectedOptions.includes(option._id);
                return (
                  <button
                    key={option._id}
                    type="button"
                    onClick={() => selectOption(option._id)}
                    aria-pressed={isSelected}
                    className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                      isSelected
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {option.text}
                  </button>
                );
              })}
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => goToQuestion(currentIndex - 1)}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>
            {currentIndex === questions.length - 1 ? (
              <Button
  onClick={() => handleSubmitTest("student-submitted")}
  disabled={isSubmitting}
>
  {isSubmitting ? "Submitting..." : "Submit test"}
</Button>
            ) : (
              <Button onClick={() => goToQuestion(currentIndex + 1)}>Next</Button>
            )}
          </div>
        </Card>
      </div>

      <Card className="h-fit lg:w-56">
        <span className="mb-3 block text-sm font-medium text-gray-700">
          Answered {answeredCount}/{questions.length}
        </span>
        <div className="grid grid-cols-5 gap-2">
          {questions.map((question, index) => (
            <button
              key={question.id}
              type="button"
              onClick={() => goToQuestion(index)}
              aria-label={`Go to question ${index + 1}`}
              aria-current={index === currentIndex ? "true" : undefined}
              className={`h-8 w-8 rounded-lg text-xs font-medium ${
                hasResponse(answers[question.id])
                  ? "bg-primary-600 text-white"
                  : index === currentIndex
                    ? "border border-primary-500 text-primary-700"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <Button
  onClick={() => handleSubmitTest("student-submitted")}
  disabled={isSubmitting}
  className="mt-4 w-full"
  variant="secondary"
>
  {isSubmitting ? "Submitting..." : "Finish"}
</Button>
      </Card>
    </div>
  );
};

export default TestAttemptRunner;
