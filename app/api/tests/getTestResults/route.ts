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
        return NextResponse.json({ results }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch test results.' }, { status: 500 });
    }
}
