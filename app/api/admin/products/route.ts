import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        translations: {
          include: { language: true },
        },
        images: true,
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, isActive, translations } = body;

    if (!slug) {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        slug,
        isActive: isActive ?? true,
        translations: translations?.length
          ? {
              create: translations.map((t: {
                languageId: string;
                title: string;
                description: string;
                metaTitle?: string;
                metaDescription?: string;
              }) => ({
                languageId: t.languageId,
                title: t.title,
                description: t.description,
                metaTitle: t.metaTitle,
                metaDescription: t.metaDescription,
              })),
            }
          : undefined,
      },
      include: {
        translations: {
          include: { language: true },
        },
        images: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
