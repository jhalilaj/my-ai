"use client";

import React, { useState, useEffect } from "react";

interface TestComponentProps {
  test: {
    _id: string;
    lessonId: string;
    questions: {
      type: "mcq" | "theory" | "practical";
      question: string;
      options?: string[];
      correctAnswer: string;
    }[];
    correctAnswers: (number | null)[];
  };
}

const TestComponent: React.FC<TestComponentProps> = ({ test }) => {
  const [userAnswers, setUserAnswers] = useState<(number | string)[]>(
    new Array(test.questions.length).fill("")
  );
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingNewTest, setLoadingNewTest] = useState(false);
  const [currentTest, setCurrentTest] = useState(test);
  const [feedback, setFeedback] = useState<
    {
      index: number;
      feedback: string;
      score: number;
      type: "theory" | "practical";
    }[]
  >([]);
  const [isTyping, setIsTyping] = useState(false);

  // Load any persisted answers/score/feedback
  useEffect(() => {
    const storedA = localStorage.getItem(`answers-${test._id}`);
    const storedS = localStorage.getItem(`score-${test._id}`);
    const storedF = localStorage.getItem(`feedback-${test._id}`);

    if (storedA) setUserAnswers(JSON.parse(storedA));
    if (storedS) {
      setScore(parseFloat(storedS));
      setSubmitted(true);
    }
    if (storedF) setFeedback(JSON.parse(storedF));
  }, [test._id]);

  const handleAnswerChange = (index: number, value: number | string) => {
    const next = [...userAnswers];
    next[index] = value;
    setUserAnswers(next);
    localStorage.setItem(`answers-${test._id}`, JSON.stringify(next));
  };

  const handleSubmit = async () => {
    // require all answers
    if (userAnswers.includes("") || userAnswers.includes(-1)) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setError(null);
    setIsTyping(true);

    try {
      const res = await fetch("/api/test/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId: currentTest._id,
          lessonId: currentTest.lessonId,
          userAnswers,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setScore(data.score);
        setFeedback(data.feedback || []);
        setSubmitted(true);
        localStorage.setItem(`score-${test._id}`, data.score.toString());
        localStorage.setItem(
          `feedback-${test._id}`,
          JSON.stringify(data.feedback || [])
        );
      } else {
        setError(data.error || "Test submission failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerateNewTest = async () => {
    setLoadingNewTest(true);
    setSubmitted(false);
    setScore(null);
    setError(null);
    setFeedback([]);

    try {
      const res = await fetch("/api/test/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: currentTest.lessonId }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setCurrentTest(data.test);
        setUserAnswers(new Array(data.test.questions.length).fill(""));
        localStorage.removeItem(`answers-${test._id}`);
        localStorage.removeItem(`score-${test._id}`);
        localStorage.removeItem(`feedback-${test._id}`);
      } else {
        setError(data.error || "Failed to generate a new test.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoadingNewTest(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-md shadow-lg text-white h-[87vh] overflow-auto custom-scrollbar">
      <h3 className="text-xl font-bold mb-4">Answer the Questions</h3>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loadingNewTest ? (
        <div className="text-center">Generating New Test...</div>
      ) : (
        <>
          {currentTest.questions.map((q, index) => {
            const userAnswer = userAnswers[index];
            const correctIndex = currentTest.correctAnswers[index];
            const isMCQ = q.type === "mcq";
            const isCorrect = isMCQ && submitted && correctIndex === userAnswer;
            const isWrong =
              isMCQ &&
              submitted &&
              correctIndex !== null &&
              userAnswer !== "" &&
              correctIndex !== userAnswer;
            const fb = feedback.find((f) => f.index === index);

            return (
              <div key={index} className="mb-6">
                <p className="font-semibold mb-2">
                  {index + 1}. {q.question}
                </p>

                {/* MCQ options */}
                {isMCQ &&
                  q.options?.map((opt, i) => (
                    <label
                      key={i}
                      className={`block cursor-pointer p-2 rounded-md
                        ${isCorrect && i === userAnswer ? "bg-green-500 text-black font-bold" : ""}
                        ${isWrong && i === userAnswer ? "bg-red-500 text-white font-bold" : ""}
                        ${submitted ? "opacity-80" : "hover:bg-gray-700"}
                      `}
                    >
                      <input
                        type="radio"
                        name={`q-${index}`}
                        value={i}
                        checked={userAnswer === i}
                        onChange={() => handleAnswerChange(index, i)}
                        disabled={submitted}
                        className="mr-2"
                      />
                      {opt}
                    </label>
                  ))}

                {/* free-text answers */}
                {(q.type === "theory" || q.type === "practical") && (
                  <textarea
                    className="w-full mt-2 p-2 rounded bg-gray-700 text-white"
                    rows={4}
                    placeholder="Write your answer here..."
                    value={userAnswer as string}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    disabled={submitted}
                  />
                )}

                {/* MCQ feedback */}
                {submitted && isMCQ && (
                  <>
                    {isCorrect && (
                      <p className="mt-2 text-green-400">✅ You got it!</p>
                    )}
                    {isWrong && correctIndex !== null && q.options && (
                      <p className="mt-2 text-yellow-300">
                        <strong>Correct answer:</strong>{" "}
                        {q.options[correctIndex]}
                      </p>
                    )}
                  </>
                )}

                {/* Theory/Practical feedback */}
                {submitted && fb && (
                  <div className="mt-2 p-3 rounded bg-gray-700">
                    <p className="text-sm text-blue-400">
                      <strong>Feedback:</strong> {fb.feedback}
                    </p>
                    <p className="text-sm text-yellow-400">
                      <strong>Score:</strong> {fb.score}/10
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="font-semibold text-gray-400 mb-6">
              AI-Tutor is checking your answers…
            </div>
          )}

          {/* Submit vs. Results */}
          {!submitted ? (
            <button
              onClick={handleSubmit}
              className="mt-4 py-2 px-6 bg-green-500 text-black font-bold rounded-md shadow-md hover:bg-green-400 transition"
            >
              Submit Test
            </button>
          ) : (
            <div className="mt-4">
              <p className="text-green-500 font-bold">
                ✅ Test Submitted! Your Score: {score?.toFixed(2)}%
              </p>
              {score !== null && score >= 80 && (
                <p className="text-green-500">
                  Recommended: Excellent job! Keep up the good work!
                </p>
              )}
              <button
                onClick={handleGenerateNewTest}
                className="mt-4 py-2 px-6 bg-blue-500 text-white font-bold rounded-md shadow-md hover:bg-blue-400 transition"
              >
                {loadingNewTest ? "Generating..." : "Generate New Test"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TestComponent;
