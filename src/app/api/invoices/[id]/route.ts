import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({ where: { id } });
  const userId = (session.user as { id: string; role?: string }).id;
  const isAdmin = (session.user as { role?: string }).role === "ADMIN";
  if (!invoice || (invoice.userId !== userId && !isAdmin)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(invoice.pdfData, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.number}.pdf"`,
    },
  });
}
