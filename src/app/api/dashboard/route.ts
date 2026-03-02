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

    // Gather Aggregated Statistics
    const totalContacts = await prisma.contact.count();
    const totalTasks = await prisma.task.count();
    const completedTasks = await prisma.task.count({ where: { status: "DONE" } });
    
    const invoices = await prisma.invoice.findMany({
        select: { amount: true, status: true }
    });
    
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(inv => inv.status === "PAID");
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    const upcomingEvents = await prisma.event.count({
        where: { start: { gte: new Date() } }
    });

    return NextResponse.json({
      contacts: { total: totalContacts },
      tasks: { total: totalTasks, completed: completedTasks },
      invoices: { total: totalInvoices, revenue: totalRevenue, paidCount: paidInvoices.length },
      events: { upcoming: upcomingEvents }
    });

  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}