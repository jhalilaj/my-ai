import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TestResult from '@/models/TestResult';

export async function GET(req: Request) {
    await dbConnect();

    const url = new URL(req.url || '');
    const userId = url.searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    try {
        const results = await TestResult.find({ userId }).sort({ timestamp: -1 });

        console.log("Fetched test results:", results); // Add this log to check the fetched data

        const formattedResults = results.map(result => {
            const timestamp = result.timestamp ? result.timestamp.toISOString() : 'Invalid Date';
            console.log(`Timestamp for result ${result._id}:`, timestamp); // Add this log to debug the timestamp
            return {
                ...result.toObject(),
                timestamp,
            };
        });

        return NextResponse.json({ results: formattedResults }, { status: 200 });
    } catch (error) {
        console.error("Error in GET request:", error);
        return NextResponse.json({ error: 'Failed to fetch test results.' }, { status: 500 });
    }
}
