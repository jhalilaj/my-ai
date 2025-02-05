"use client";

import { useState } from "react";

type Question = {
    id: number;
    type: "MCQ" | "TrueFalse" | "Coding";
    questionText: string;
    options?: string[];
    correctAnswer?: string; // Add correctAnswer for evaluation
};

type Answer = {
    [key: number]: string;
};

export default function TestPage() {
    const [questions, setQuestions] = useState<Question[]>([
        {
            id: 1,
            type: "MCQ",
            questionText: "What is the output of print(2 + 3)?",
            options: ["2", "3", "5", "23"],
            correctAnswer: "5",
        },
        {
            id: 2,
            type: "TrueFalse",
            questionText: "Python is a statically typed language.",
            correctAnswer: "False",
        },
        {
            id: 3,
            type: "Coding",
            questionText: "Write a Python function to return the square of a number.",
            correctAnswer: "def square(n): return n * n",
        },
    ]);

    const [answers, setAnswers] = useState<Answer>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const handleAnswerChange = (questionId: number, answer: string) => {
        setAnswers((prevAnswers) => ({ ...prevAnswers, [questionId]: answer }));
    };

    const handleSubmit = async () => {
        let total = questions.length;
        let correct = 0;
    
        questions.forEach((q) => {
            if (q.correctAnswer && answers[q.id] === q.correctAnswer) {
                correct += 1;
            } else if (q.type === "Coding" && answers[q.id]) {
                const userCode = answers[q.id].replace(/\s/g, "");
                const correctCode = q.correctAnswer?.replace(/\s/g, "");
                if (userCode === correctCode) {
                    correct += 1;
                }
            }
        });
        
        const finalScore = Math.round((correct / total) * 100);
        setScore(finalScore);
        setSubmitted(true);
    
        // ✅ Send the result to MongoDB
        try {
            const response = await fetch('/api/tests/saveTestResults', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 'user123',
                    lessonId: 'lesson_2',
                    score: finalScore,
                }),
            });
            
    
            if (response.ok) {
                console.log('Test result saved successfully.');
            } else {
                console.error('Failed to save test result.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    

    return (
        <div style={{ padding: "20px" }}>
            <h1>Lesson Test</h1>

            {submitted ? (
                <div>
                    <h2>Test Completed!</h2>
                    <p>Your Score: {score}%</p>
                </div>
            ) : (
                <div>
                    {questions.map((q) => (
                        <div key={q.id} style={{ marginBottom: "20px" }}>
                            <p>
                                <strong>{q.questionText}</strong>
                            </p>

                            {q.type === "MCQ" &&
                                q.options?.map((option) => (
                                    <div key={option}>
                                        <input
                                            type="radio"
                                            name={q.id.toString()}
                                            value={option}
                                            onChange={() =>
                                                handleAnswerChange(q.id, option)
                                            }
                                        />
                                        <label>{option}</label>
                                    </div>
                                ))}

                            {q.type === "TrueFalse" && (
                                <div>
                                    <input
                                        type="radio"
                                        name={q.id.toString()}
                                        value="True"
                                        onChange={() =>
                                            handleAnswerChange(q.id, "True")
                                        }
                                    />
                                    <label>True</label>

                                    <input
                                        type="radio"
                                        name={q.id.toString()}
                                        value="False"
                                        onChange={() =>
                                            handleAnswerChange(q.id, "False")
                                        }
                                    />
                                    <label>False</label>
                                </div>
                            )}

                            {q.type === "Coding" && (
                                <textarea
                                    style={{ width: "100%", height: "100px" }}
                                    placeholder="Write your code here..."
                                    onChange={(e) =>
                                        handleAnswerChange(q.id, e.target.value)
                                    }
                                />
                            )}
                        </div>
                    ))}

                    <button
                        onClick={handleSubmit}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "blue",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                        }}
                    >
                        Submit Test
                    </button>
                </div>
            )}
        </div>
    );
}
