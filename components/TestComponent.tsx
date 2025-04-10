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
  const [isTyping, setIsTyping] = useState(false); // Typing indicator state

  useEffect(() => {
    const storedAnswers = localStorage.getItem(`answers-${test._id}`);
    const storedScore = localStorage.getItem(`score-${test._id}`);
    const storedFeedback = localStorage.getItem(`feedback-${test._id}`);

    if (storedAnswers) setUserAnswers(JSON.parse(storedAnswers));
    if (storedScore) {
      setScore(parseFloat(storedScore));
      setSubmitted(true);
    }
    if (storedFeedback) {
      setFeedback(JSON.parse(storedFeedback));
    }
  }, [test._id]);

  const handleAnswerChange = (index: number, value: number | string) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = value;
    setUserAnswers(newAnswers);
    localStorage.setItem(`answers-${test._id}`, JSON.stringify(newAnswers));
  };

  const handleSubmit = async () => {
    if (userAnswers.includes("") || userAnswers.includes(-1)) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setIsTyping(true); // Show typing animation while submitting the test

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
        setSubmitted(true);
        setFeedback(data.feedback || []);
        localStorage.setItem(`score-${test._id}`, data.score.toString());
        localStorage.setItem(`feedback-${test._id}`, JSON.stringify(data.feedback || []));
      } else {
        setError(data.error || "Test submission failed.");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsTyping(false); // Hide typing animation once the test is submitted
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
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoadingNewTest(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-md shadow-lg text-white overflow-auto h-[87vh] custom-scrollbar">
      <h3 className="text-xl font-bold mb-4">Answer the Questions</h3>
      {error && <p className="text-red-500">{error}</p>}

      {loadingNewTest ? (
        <div className="text-center text-white">Generating New Test...</div>
      ) : (
        <>
          {currentTest.questions.map((q, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = q.type === "mcq" && submitted && currentTest.correctAnswers[index] === userAnswer;
            const isWrong =
              q.type === "mcq" && submitted && userAnswer === userAnswer && !isCorrect;

            const fb = feedback.find((f) => f.index === index);

            return (
              <div key={index} className="mb-6">
                <p className="font-semibold">
                  {index + 1}. {q.question}
                </p>

                {q.type === "mcq" &&
                  q.options?.map((option, i) => (
                    <label
                      key={i}
                      className={`block cursor-pointer p-2 rounded-md 
                      ${isCorrect && i === userAnswer ? "bg-green-500 text-black font-bold" : ""}
                      ${isWrong && i === userAnswer ? "bg-red-500 text-white font-bold" : ""}
                      ${submitted ? "opacity-80" : "hover:bg-gray-700"}`}
                    >
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={i}
                        checked={userAnswer === i}
                        onChange={() => handleAnswerChange(index, i)}
                        disabled={submitted}
                        className="mr-2"
                      />
                      {option}
                    </label>
                  ))}

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

                {/* Show feedback after submission */}
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

          {/* Show Typing animation */}
          {isTyping && (
            <div className="font-semibold text-gray-400 mb-6">
              <p className="">AI-Tutor is checking your mark</p>
            </div>
          )}

          {!submitted ? (
            <button
              onClick={handleSubmit}
              className="mt-4 py-2 px-6 bg-green-500 text-black font-bold rounded-md shadow-md hover:bg-green-400 transition"
            >
              Submit Test
            </button>
          ) : (
            <div className="mt-4">
              <p className="text-green-500 font-bold">✅ Test Submitted! Your Score: {score?.toFixed(2)}%</p>
              {score && score >= 80 && (
                <p className="text-green-500">Recommended: Excellent job! Keep up the good work!</p>
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
