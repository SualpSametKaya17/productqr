import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const languages = await prisma.language.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(languages);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch languages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, nativeName, isDefault } = body;

    if (!code || !name || !nativeName) {
      return NextResponse.json({ error: "code, name, and nativeName are required" }, { status: 400 });
    }

    if (isDefault) {
      await prisma.language.updateMany({
        data: { isDefault: false },
      });
    }

    const language = await prisma.language.create({
      data: { code, name, nativeName, isDefault: isDefault ?? false },
    });

    return NextResponse.json(language, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "Language code already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create language" }, { status: 500 });
  }
}
