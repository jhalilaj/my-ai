import React from "react";

interface TestViewerProps {
  test: {
    _id: string;
    questions: {
      type: string; question: string; options: string[] 
}[];
    correctAnswers: (string | null)[];
    userAnswers: (string | number | null)[];
    feedback: { index: number; feedback: string; score: number }[];
    score: number;
    percentage: number;
  };
  onClose: () => void;
}

const TestViewer: React.FC<TestViewerProps> = ({ test, onClose }) => {
  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center"
      onClick={onClose} // ✅ Close modal when clicking outside
    >
      <div
        className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()} // ✅ Prevent closing when clicking inside
      >
        {/* Close Button */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Test Review</h3>
          <button
            onClick={onClose}
            className="text-white bg-red-500 hover:bg-red-400 px-3 py-1 rounded-md"
          >
            Close
          </button>
        </div>

        {/* Test Score */}

        <p>📊 Percentage: {test.percentage.toFixed(2)}%</p>

        {/* Questions & Answers */}
        <div className="mt-4 space-y-6">
          {test.questions.map((q, qIndex) => {
            const userAnswer = test.userAnswers[qIndex];
            const feedback = test.feedback.find((f) => f.index === qIndex);
            const isCorrect = test.correctAnswers[qIndex] === userAnswer;

            return (
              <div key={qIndex} className="p-4 bg-gray-800 rounded-lg">
                <p className="font-semibold">{q.question}</p>
                <div className="mt-2 space-y-2">
                  {q.options?.map((option, oIndex) => {
                    const isUserAnswer = userAnswer === oIndex;

                    return (
                      <div
                        key={oIndex}
                        className={`p-2 rounded-md font-semibold flex items-center
                          ${isCorrect && isUserAnswer ? "bg-green-600 text-white" : ""}
                          ${!isCorrect && isUserAnswer ? "bg-red-600 text-white" : ""}
                          ${!isUserAnswer ? "bg-gray-700" : ""}
                        `}
                      >
                        {option}
                        {isCorrect && isUserAnswer && " ✅"}
                        {!isCorrect && isUserAnswer && " ❌"}
                      </div>
                    );
                  })}
                </div>

                {/* Display User Answer for Theory and Practical */}
                {(q.type === "theory" || q.type === "practical") && (
                  <div className="mt-4">
                    <p className="text-sm text-blue-400">
                      <strong>Your Answer:</strong> {userAnswer || "No answer provided"}
                    </p>
                  </div>
                )}

                {/* Show feedback for theory and practical questions */}
                {feedback && (
                  <div className="mt-4">
                    <p className="text-sm text-blue-400">
                      <strong>Feedback:</strong> {feedback.feedback}
                    </p>
                    <p className="text-sm text-yellow-400">
                      <strong>Score:</strong> {feedback.score} / 10
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TestViewer;
