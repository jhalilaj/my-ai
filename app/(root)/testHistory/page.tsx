"use client";

import { useEffect, useState } from "react";

type TestResult = {
    lessonId: string;
    score: number;
    timestamp: string;
};

export default function TestHistoryPage() {
    const [testResults, setTestResults] = useState<TestResult[]>([]);

    useEffect(() => {
        const fetchTestResults = async () => {
            const response = await fetch("/api/tests/getTestResults?userId=user123");
            const data = await response.json();
            setTestResults(data.results);
        };

        fetchTestResults();
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <h1>User Test History</h1>

            {testResults.length === 0 ? (
                <p>No test results found.</p>
            ) : (
                <ul>
                    {testResults.map((result, index) => (
                        <li key={index} style={{ marginBottom: "15px" }}>
                            <strong>Lesson:</strong> {result.lessonId} <br />
                            <strong>Score:</strong> {result.score}% <br />
                            <strong>Date:</strong> {new Date(result.timestamp).toLocaleString()}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
