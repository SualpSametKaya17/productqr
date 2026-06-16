import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        translations: {
          include: { language: true },
        },
        images: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { slug, isActive, translations } = body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(slug !== undefined && { slug }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    if (translations?.length) {
      for (const t of translations as {
        languageId: string;
        title: string;
        description: string;
        metaTitle?: string;
        metaDescription?: string;
      }[]) {
        await prisma.productTranslation.upsert({
          where: {
            productId_languageId: {
              productId: id,
              languageId: t.languageId,
            },
          },
          create: {
            productId: id,
            languageId: t.languageId,
            title: t.title,
            description: t.description,
            metaTitle: t.metaTitle,
            metaDescription: t.metaDescription,
          },
          update: {
            title: t.title,
            description: t.description,
            metaTitle: t.metaTitle,
            metaDescription: t.metaDescription,
          },
        });
      }
    }

    const updated = await prisma.product.findUnique({
      where: { id },
      include: {
        translations: {
          include: { language: true },
        },
        images: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
