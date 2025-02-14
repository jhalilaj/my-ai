"use client";
import React from "react";

interface TestViewerProps {
  test: {
    _id: string;
    lessonId: string;
    questions: { question: string; options: string[] }[];
    correctAnswers: number[];
    userAnswers?: number[];
    score?: number;
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
        <p>🏆 Score:
          {typeof test.score === "number" && test.questions?.length
            ? `${((test.score / test.questions.length) * 100).toFixed(2)}%`
            : "Not taken yet"}
        </p>



        {/* Questions & Answers */}
        <div className="mt-4 space-y-6">
          {test.questions.map((q, qIndex) => (
            <div key={qIndex} className="p-4 bg-gray-800 rounded-lg">
              <p className="font-semibold">{q.question}</p>
              <div className="mt-2 space-y-2">
                {q.options.map((option, oIndex) => {
                  const isCorrect = test.correctAnswers[qIndex] === oIndex;
                  const isUserAnswer =
                    test.userAnswers && test.userAnswers[qIndex] === oIndex;
                  const isWrong = isUserAnswer && !isCorrect;

                  return (
                    <div
                      key={oIndex}
                      className={`p-2 rounded-md font-semibold flex items-center 
                        ${isCorrect ? "bg-green-600 text-white" : ""}
                        ${isWrong ? "bg-red-600 text-white" : ""}
                        ${!isCorrect && !isWrong ? "bg-gray-700" : ""}
                      `}
                    >
                      {option} {/* ✅ Removed A. B. C. D. Labels */}
                      {isCorrect && " ✅"}
                      {isWrong && " ❌"}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestViewer;
