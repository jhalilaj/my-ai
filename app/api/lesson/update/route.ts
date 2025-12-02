import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

let client: MongoClient
async function connectDB() {
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI!)
    await client.connect()
  }
  return client.db(process.env.MONGODB_DB)
}

export async function PATCH(req: NextRequest) {
  const { lessonId, completed } = await req.json()
  const db = await connectDB()
  const lessons = db.collection('lessons')

  const result = await lessons.updateOne(
    { _id: new ObjectId(lessonId) },
    { $set: { completed } }
  )

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
