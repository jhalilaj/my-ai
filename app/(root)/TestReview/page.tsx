"use client";

import React from "react";
import { useParams } from "next/navigation";

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  userAnswer: string;
  explanation?: string;
}

const TestReview: React.FC = () => {
  const { testId } = useParams();

  // Simulated Test Data (Replace with API later)
  const testData: { 
    lessonTitle: string;
    dateTaken: string;
    questions: Question[];
  } = {
    lessonTitle: "Lesson 3: Introduction to Data Structures",
    dateTaken: "Feb 10, 2025",
    questions: [
      {
        id: "1",
        questionText: "What is the capital of France?",
        options: ["Berlin", "Madrid", "Paris", "Rome"],
        correctAnswer: "Paris",
        userAnswer: "Madrid",
        explanation: "Paris is the capital of France.",
      },
      {
        id: "2",
        questionText: "Which data structure uses LIFO?",
        options: ["Queue", "Stack", "Linked List", "Tree"],
        correctAnswer: "Stack",
        userAnswer: "Stack",
        explanation: "LIFO stands for 'Last In, First Out', which is the behavior of a Stack.",
      },
    ],
  };

  // Calculate the Score
  const correctAnswers = testData.questions.filter(q => q.userAnswer === q.correctAnswer).length;
  const totalQuestions = testData.questions.length;
  const score = Math.round((correctAnswers / totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-customDark text-white p-6">
      {/* Test Summary */}
      <div className="mb-6 p-6 bg-customGray rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold">📖 Test Review</h1>
        <h2 className="text-xl mt-2">{testData.lessonTitle}</h2>
        <p className="text-gray-400">Taken on: {testData.dateTaken}</p>
        <p className={`mt-3 text-2xl font-bold ${score >= 70 ? "text-green-500" : "text-red-500"}`}>
          Score: {score}% ({correctAnswers}/{totalQuestions} correct)
        </p>
      </div>

      {/* Questions & Answers */}
      {testData.questions.map((question, index) => (
        <div key={question.id} className="mb-6 p-4 bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">{index + 1}. {question.questionText}</h2>

          <div className="space-y-2">
            {question.options.map((option) => (
              <div
                key={option}
                className={`p-2 rounded-md 
                  ${option === question.correctAnswer ? "bg-green-500 text-black font-bold" : 
                    option === question.userAnswer ? "bg-red-500 text-white font-bold" : 
                    "bg-gray-700 text-gray-300"
                  }`}
              >
                {option} {option === question.correctAnswer ? "✅ (Correct Answer)" : option === question.userAnswer ? "❌ (Your Answer)" : ""}
              </div>
            ))}
          </div>

          {/* Explanation */}
          {question.explanation && (
            <p className="mt-3 text-sm text-gray-300 italic">💡 {question.explanation}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default TestReview;
