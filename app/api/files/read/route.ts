import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import mammoth from "mammoth";
import pdf from 'pdf-parse/lib/pdf-parse'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let filePath = searchParams.get("filePath");

    if (!filePath) {
      return NextResponse.json({ error: "File path is required" }, { status: 400 });
    }

    if (filePath.startsWith("/")) {
      filePath = filePath.substring(1);
    }

    const fullPath = path.join(process.cwd(), "public", filePath);

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: "File not found", fullPath }, { status: 404 });
    }

    let fileContent = "";
    if (filePath.endsWith(".docx")) {
      const buffer = fs.readFileSync(fullPath);
      const result = await mammoth.extractRawText({ buffer });
      fileContent = result.value || "Could not extract text.";
    } else if (filePath.endsWith(".pdf")) {
      const buffer = fs.readFileSync(fullPath);
      const result = await pdf(buffer);
      fileContent = result.text || "Could not extract text from PDF.";
    } else {
    
      fileContent = fs.readFileSync(fullPath, "utf-8");
    }

    return NextResponse.json({ success: true, content: fileContent });
  } catch (error) {
    console.error("Error reading file:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
