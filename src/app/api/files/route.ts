import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { writeFile } from 'fs/promises';
import path from 'path';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const files = await prisma.fileNode.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(files);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    
    // Check if creating a folder
    const action = formData.get("action");
    if (action === "CREATE_FOLDER") {
        const folderName = formData.get("name");
        const newFolder = await prisma.fileNode.create({
            data: {
                name: folderName,
                type: "FOLDER"
            }
        });
        return NextResponse.json(newFolder, { status: 201 });
    }

    // Handle File Upload
    const file = formData.get("file");
    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create unique filename
    const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, uniqueName);

    // Save to public/uploads
    await writeFile(filePath, buffer);
    const fileUrl = `/uploads/${uniqueName}`;

    // Save to DB
    const newFile = await prisma.fileNode.create({
      data: {
        name: file.name,
        type: "FILE",
        url: fileUrl,
        size: file.size,
        mimeType: file.type,
      },
    });

    return NextResponse.json(newFile, { status: 201 });
  } catch (error) {
    console.error("UPLOAD ERROR", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}