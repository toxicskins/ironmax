import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  firstName: z.string().max(80).optional(),
  lastName: z.string().max(80).optional(),
  billingAddress: z.string().max(300).optional(),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const userId = (session.user as { id: string }).id;
  await prisma.user.update({ where: { id: userId }, data: parsed.data });

  return NextResponse.json({ ok: true });
}
