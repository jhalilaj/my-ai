import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TestResult from '@/models/TestResult';

export async function POST(req: Request) {
    await dbConnect();

    try {
        const body = await req.json();
        const { userId, lessonId, score } = body;

        const result = await TestResult.create({
            userId,
            lessonId,
            score,
            timestamp: new Date(),
        });

        return NextResponse.json({ message: 'Test result saved successfully.', result }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to save test result.' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ error: 'GET method not allowed.' }, { status: 405 });
}
