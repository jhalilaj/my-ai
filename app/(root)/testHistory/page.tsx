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
            try {
                const response = await fetch("/api/tests/getTestResults?userId=jhalilaj@york.citycollege.eu");
                if (!response.ok) {
                    throw new Error("Failed to fetch test results");
                }
                const data = await response.json();
                setTestResults(data.results);
            } catch (error) {
                console.error("Error fetching test results:", error);
            }
        };

        fetchTestResults();
    }, []);

    return (
        <div className="min-h-screen bg-customDark text-white p-6">
            <h1 className="text-2xl font-bold mb-4">📊 Your Test History</h1>

            {testResults.length === 0 ? (
                <p className="text-gray-400">No test results found.</p>
            ) : (
                <ul className="space-y-4">
                    {testResults.map((result, index) => {
                        // Try to parse the timestamp
                        const date = new Date(result.timestamp);
                        const formattedDate = date instanceof Date && !isNaN(date.getTime()) 
                            ? date.toLocaleString() 
                            : 'Invalid Date';

                        return (
                            <li key={index} className="bg-customGray p-4 rounded shadow-md border border-gray-700">
                                <strong>Lesson:</strong> {result.lessonId.replace("lesson", "Lesson ")} <br />
                                <strong>Score:</strong> {result.score}% <br />
                                <strong>Date:</strong> {formattedDate}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
