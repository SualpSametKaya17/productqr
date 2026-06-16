import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { code, name, nativeName, isDefault, isActive } = body;

    if (isDefault) {
      await prisma.language.updateMany({
        where: { id: { not: id } },
        data: { isDefault: false },
      });
    }

    const language = await prisma.language.update({
      where: { id },
      data: {
        ...(code !== undefined && { code }),
        ...(name !== undefined && { name }),
        ...(nativeName !== undefined && { nativeName }),
        ...(isDefault !== undefined && { isDefault }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(language);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update language" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.language.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete language" }, { status: 500 });
  }
}
