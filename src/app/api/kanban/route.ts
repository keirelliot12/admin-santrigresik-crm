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

    const boards = await prisma.board.findMany({
      orderBy: { order: "asc" },
      include: {
        tasks: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(boards);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch kanban boards" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, payload } = await req.json();

    if (action === "ADD_BOARD") {
      const newBoard = await prisma.board.create({
        data: {
          title: payload.title,
          order: payload.order || 0,
        },
      });
      return NextResponse.json(newBoard);
    } 
    else if (action === "ADD_TASK") {
      const newTask = await prisma.task.create({
        data: {
          title: payload.title,
          boardId: payload.boardId,
          order: payload.order || 0,
          creatorId: session.user.id,
        },
      });
      return NextResponse.json(newTask);
    }
    else if (action === "UPDATE_BOARD_ORDER") {
      const promises = payload.boards.map((board) =>
        prisma.board.update({
          where: { id: board.id },
          data: { order: board.order },
        })
      );
      await Promise.all(promises);
      return NextResponse.json({ success: true });
    }
    else if (action === "UPDATE_TASK_ORDER") {
      // payload: { taskId, newBoardId, newOrder, oldBoardTasks, newBoardTasks }
      const promises = [];
      
      // Update Task's Board and Order
      promises.push(
        prisma.task.update({
          where: { id: payload.taskId },
          data: { 
            boardId: payload.newBoardId,
            order: payload.newOrder
          },
        })
      );

      // Re-order new board
      payload.newBoardTasks.forEach((t, i) => {
        promises.push(
          prisma.task.update({
            where: { id: t.id },
            data: { order: i },
          })
        );
      });
      
      if (payload.oldBoardTasks) {
         payload.oldBoardTasks.forEach((t, i) => {
            promises.push(
              prisma.task.update({
                where: { id: t.id },
                data: { order: i },
              })
            );
          });
      }

      await Promise.all(promises);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("KANBAN POST ERROR:", error);
    return NextResponse.json({ error: "Failed to update kanban" }, { status: 500 });
  }
}