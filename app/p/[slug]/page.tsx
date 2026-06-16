import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import LandingPage from "./landing-page";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
};

function detectBrowserLang(acceptLang: string | null, available: string[]): string | null {
  if (!acceptLang) return null;
  const codes = acceptLang
    .split(",")
    .map((l) => l.split(";")[0].trim().split("-")[0].toLowerCase());
  return codes.find((c) => available.includes(c)) ?? null;
}

async function getProductData(slug: string, lang?: string) {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      translations: { include: { language: true } },
      images: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }] },
    },
  });
  if (!product) return null;

  const langs = product.translations.map((t) => t.language.code);
  const reqHeaders = await headers();
  const browserLang = detectBrowserLang(reqHeaders.get("accept-language"), langs);
  const activeLang =
    lang && langs.includes(lang) ? lang : browserLang ?? langs[0];
  const translation =
    product.translations.find((t) => t.language.code === activeLang) ??
    product.translations[0];

  const allLanguages = product.translations
    .filter((t) => t.language.isActive)
    .map((t) => t.language);

  return { product, translation, allLanguages };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { lang } = await searchParams;
  const data = await getProductData(slug, lang);
  if (!data) return { title: "Not Found" };
  const { translation } = data;
  return {
    title: translation.metaTitle ?? translation.title,
    description:
      translation.metaDescription ??
      translation.description.replace(/\n/g, " ").slice(0, 160),
    openGraph: {
      title: translation.metaTitle ?? translation.title,
      description:
        translation.metaDescription ??
        translation.description.replace(/\n/g, " ").slice(0, 160),
    },
  };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const data = await getProductData(slug, lang);
  if (!data) notFound();

  return (
    <LandingPage
      product={data.product}
      translation={data.translation}
      allLanguages={data.allLanguages}
      slug={slug}
    />
  );
}
