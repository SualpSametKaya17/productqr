import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const body = await request.json();
    const { url, alt, isPrimary, order } = body;

    if (!url) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    if (isPrimary) {
      await prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });
    }

    const image = await prisma.productImage.create({
      data: {
        productId,
        url,
        alt: alt ?? null,
        isPrimary: isPrimary ?? false,
        order: order ?? 0,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add image" }, { status: 500 });
  }
}
