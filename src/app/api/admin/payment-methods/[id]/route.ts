import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1),
  imageUrl: z.string().optional(),
  paynetApiUrl: z.string().optional(),
  paynetLogin: z.string().optional(),
  paynetEndpointId: z.string().min(1),
  paynetSigningKey: z.string().optional(),
  active: z.boolean(),
  sortOrder: z.number().int(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { id } = await params;
  await prisma.paymentMethod.update({
    where: { id },
    data: {
      name: parsed.data.name,
      imageUrl: parsed.data.imageUrl?.trim() || null,
      paynetApiUrl: parsed.data.paynetApiUrl?.trim() || null,
      paynetLogin: parsed.data.paynetLogin?.trim() || null,
      paynetEndpointId: parsed.data.paynetEndpointId,
      ...(parsed.data.paynetSigningKey ? { paynetSigningKey: parsed.data.paynetSigningKey } : {}),
      active: parsed.data.active,
      sortOrder: parsed.data.sortOrder,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.paymentMethod.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
