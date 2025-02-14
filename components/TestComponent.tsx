"use client";

import React, { useState, useEffect } from "react";

interface TestComponentProps {
  test: {
    _id: string;
    lessonId: string;
    questions: { question: string; options: string[] }[];
    correctAnswers: number[]; // ✅ Correct answers array
  };
}

const TestComponent: React.FC<TestComponentProps> = ({ test }) => {
  const [userAnswers, setUserAnswers] = useState<number[]>(new Array(test.questions.length).fill(-1));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingNewTest, setLoadingNewTest] = useState(false); // ✅ Loading state for new test
  const [currentTest, setCurrentTest] = useState(test);

  // ✅ Use localStorage to load previous answers
  useEffect(() => {
    const storedAnswers = localStorage.getItem(`answers-${test._id}`);
    const storedScore = localStorage.getItem(`score-${test._id}`);
    
    if (storedAnswers) {
      setUserAnswers(JSON.parse(storedAnswers));
    }
    if (storedScore) {
      setScore(parseInt(storedScore, 10));
      setSubmitted(true);
    }
  }, [test._id]);

  // ✅ Handle user selecting an answer
  const handleAnswerChange = (index: number, answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = answerIndex;
    setUserAnswers(newAnswers);

    // ✅ Store updated answers in localStorage
    localStorage.setItem(`answers-${test._id}`, JSON.stringify(newAnswers));
  };

  // ✅ Handle test submission
  const handleSubmit = async () => {
    if (userAnswers.includes(-1)) {
      setError("Please answer all questions before submitting.");
      return;
    }

    try {
      console.log("🟢 Submitting test with:", {
        testId: currentTest._id,
        lessonId: currentTest.lessonId,
        userAnswers,
      });

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
        console.log("✅ Test submitted successfully:", data);
        setScore(data.score);
        setSubmitted(true);

        // ✅ Save the score in localStorage
        localStorage.setItem(`score-${test._id}`, data.score.toString());
      } else {
        console.error("❌ Test submission failed:", data.error);
        setError(data.error || "Test submission failed.");
      }
    } catch (error) {
      console.error("❌ Network error during test submission:", error);
      setError("Network error. Please try again.");
    }
  };

  // ✅ Handle new test generation
  const handleGenerateNewTest = async () => {
    setLoadingNewTest(true); // Set loading state
    setSubmitted(false);
    setScore(null);
    setError(null);

    try {
      console.log("🔄 Generating a new test for lesson:", currentTest.lessonId);

      const res = await fetch("/api/test/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: currentTest.lessonId }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        console.log("✅ New test generated:", data.test);
        setCurrentTest(data.test); // Set new test data
        setUserAnswers(new Array(data.test.questions.length).fill(-1)); // Reset answers for the new test
        localStorage.removeItem(`answers-${test._id}`); // Clear previous answers
        localStorage.removeItem(`score-${test._id}`);   // Clear previous score
      } else {
        console.error("❌ Failed to generate test:", data.error);
        setError(data.error || "Failed to generate a new test.");
      }
    } catch (error) {
      console.error("❌ Network error during test generation:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoadingNewTest(false); // End loading state after fetching the new test
    }
  };

  return (
    <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-md shadow-lg text-white">
      <h3 className="text-xl font-bold mb-4">Answer the Questions</h3>

      {error && <p className="text-red-500">{error}</p>}

      {/* Show Loading Indicator while generating new test */}
      {loadingNewTest ? (
        <div className="text-center text-white">
          <p>Generating New Test...</p>
        </div>
      ) : (
        <>
          {currentTest.questions.map((q, index) => (
            <div key={index} className="mb-4">
              <p className="font-semibold">{q.question}</p>
              {q.options.map((option, i) => {
                const isCorrect = submitted && currentTest.correctAnswers[index] === i;
                const isWrong = submitted && userAnswers[index] === i && !isCorrect;

                return (
                  <label
                    key={i}
                    className={`block cursor-pointer p-2 rounded-md 
                      ${isCorrect ? "bg-green-500 text-black font-bold" : ""}
                      ${isWrong ? "bg-red-500 text-white font-bold" : ""}
                      ${submitted ? "opacity-80" : "hover:bg-gray-700"}
                    `}
                  >
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={i}
                      checked={userAnswers[index] === i}
                      onChange={() => handleAnswerChange(index, i)}
                      disabled={submitted}
                      className="mr-2"
                    />
                    {option}
                  </label>
                );
              })}
            </div>
          ))}

          {!submitted ? (
            <button
              onClick={handleSubmit}
              className="mt-4 py-2 px-6 bg-green-500 text-black font-bold rounded-md shadow-md hover:bg-green-400 transition"
            >
              Submit Test
            </button>
          ) : (
            <div className="mt-4">
              <p className="text-green-500 font-bold">✅ Test Submitted! Your Score: {score}%</p>
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
