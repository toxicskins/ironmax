import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1),
  imageUrl: z.string().optional(),
  paynetApiUrl: z.string().optional(),
  paynetEndpointId: z.string().min(1),
  paynetSigningKey: z.string().min(1),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const methods = await prisma.paymentMethod.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(methods.map((method) => ({
    id: method.id,
    name: method.name,
    imageUrl: method.imageUrl ?? "",
    paynetApiUrl: method.paynetApiUrl ?? "",
    paynetEndpointId: method.paynetEndpointId,
    active: method.active,
    sortOrder: method.sortOrder,
    configured: !!method.paynetSigningKey,
  })));
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const method = await prisma.paymentMethod.create({
    data: {
      name: parsed.data.name,
      imageUrl: parsed.data.imageUrl?.trim() || null,
      paynetApiUrl: parsed.data.paynetApiUrl?.trim() || null,
      paynetEndpointId: parsed.data.paynetEndpointId,
      paynetSigningKey: parsed.data.paynetSigningKey,
      active: parsed.data.active,
      sortOrder: parsed.data.sortOrder,
    },
  });

  return NextResponse.json({ id: method.id });
}
