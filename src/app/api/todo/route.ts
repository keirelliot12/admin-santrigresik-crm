import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Default Kanban Board fallback
    let defaultBoard = await prisma.board.findFirst();
    if (!defaultBoard) {
        defaultBoard = await prisma.board.create({
            data: { title: "General Tasks", order: 0 }
        });
    }

    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, payload } = await req.json();

    if (action === "ADD_TASK") {
        let defaultBoard = await prisma.board.findFirst();
        
        const newTask = await prisma.task.create({
            data: {
                title: payload.title,
                description: payload.description || null,
                priority: payload.priority || "MEDIUM",
                status: "TODO",
                boardId: defaultBoard.id,
                creatorId: session.user.id
            }
        });
        return NextResponse.json(newTask);
    } 
    else if (action === "TOGGLE_STATUS") {
        const currentTask = await prisma.task.findUnique({ where: { id: payload.id }});
        const newStatus = currentTask.status === "DONE" ? "TODO" : "DONE";
        
        const updatedTask = await prisma.task.update({
            where: { id: payload.id },
            data: { status: newStatus }
        });
        return NextResponse.json(updatedTask);
    }

    return NextResponse.json({ error: "Invalid Action" }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ error: "Failed to process task" }, { status: 500 });
  }
}