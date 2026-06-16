import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const en = await prisma.language.upsert({
    where: { code: "en" },
    update: {},
    create: { code: "en", name: "English", nativeName: "English", isDefault: true },
  });

  const tr = await prisma.language.upsert({
    where: { code: "tr" },
    update: {},
    create: { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  });

  const de = await prisma.language.upsert({
    where: { code: "de" },
    update: {},
    create: { code: "de", name: "German", nativeName: "Deutsch" },
  });

  const product = await prisma.product.upsert({
    where: { slug: "sample-product" },
    update: {},
    create: {
      slug: "sample-product",
      isActive: true,
      translations: {
        create: [
          {
            languageId: en.id,
            title: "Sample Product",
            description:
              "This is a sample product description in English. It showcases the multilingual capability of this platform.",
            metaTitle: "Sample Product | ProductQR",
            metaDescription:
              "Discover our sample product with detailed information in multiple languages.",
          },
          {
            languageId: tr.id,
            title: "Örnek Ürün",
            description:
              "Bu, bu platformun çok dilli özelliğini gösteren Türkçe örnek bir ürün açıklamasıdır.",
            metaTitle: "Örnek Ürün | ProductQR",
            metaDescription: "Çok dilli destek ile örnek ürünümüzü keşfedin.",
          },
          {
            languageId: de.id,
            title: "Beispielprodukt",
            description:
              "Dies ist eine Beispiel-Produktbeschreibung auf Deutsch, die die mehrsprachige Fähigkeit dieser Plattform zeigt.",
            metaTitle: "Beispielprodukt | ProductQR",
            metaDescription:
              "Entdecken Sie unser Beispielprodukt mit Informationen in mehreren Sprachen.",
          },
        ],
      },
    },
  });

  console.log("Seeded:", { en, tr, de, product: product.slug });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
