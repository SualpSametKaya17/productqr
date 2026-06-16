import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const GIRNE_TR = `Lefkoşa'yı çevreleyen ve kökeni Orta Çağ'a uzanan Venedik surlarının üç ana giriş kapısından biri olan Girne Kapısı, adını Girne şehrine açılan yol üzerinde yer almasından alır. Yüzyıllar boyunca farklı medeniyetlere ev sahipliği yapan bu kapı, Lefkoşa'nın en önemli tarihî simgelerinden biridir.

Venedikliler tarafından Osmanlı saldırılarına karşı savunma amacıyla yeniden inşa edilen Girne Kapısı'nın yapımına 1562 yılında başlanmıştır. Bu tarih, kapı üzerinde Latince rakamlarla "MDLXII" olarak günümüze kadar ulaşmıştır.

1571 yılında Kıbrıs'ın Osmanlılar tarafından fethedilmesinin ardından kapı, Osmanlı döneminde de önemini korumuştur. 1821 yılında yapılan bir düzenleme ile kapının üzerine bir gözetleme kulesi eklenmiş; mevcut Latince kitabeye ise dönemin padişahı II. Mahmut'un tuğrası yerleştirilmiştir.

Kapının şehir dışına bakan cephesinde, Osmanlı dönemine ait anlamlı bir mesaj yer almaktadır. Kur'an-ı Kerim'in Saff Suresi 13. Ayeti ve halk arasında "Rızık Duası" olarak bilinen şu ifade kapıyı süslemektedir: "Ey kapıları açan Allah'ım, bize hayır kapılarını aç."

Girne Kapısı'nın en dikkat çekici hikâyelerinden biri Horoz Ali'ye aittir. Osmanlı döneminde kapının son bekçisi olan Horoz Ali, her sabah gün doğumunda kapıyı açar, gün batımında ise kapatırdı. 1878 yılında Kıbrıs'ın İngiliz yönetimine geçmesi sırasında, İngiliz yetkililer Girne Kapısı'ndan şehre girmek istediklerinde, durumdan habersiz olan Horoz Ali buna izin vermemiştir. Ancak Osmanlı yetkililerinin durumu kendisine açıklamasının ardından, Horoz Ali İngilizlerin geçişine onay vermiştir. Görev ve sorumluluklarına olan bağlılığından etkilenen İngiliz yetkililer, Horoz Ali'nin görevine devam etmesine izin vermiştir. Horoz Ali, 1946 yılında 121 yaşında Girne Kapısı'nda hayatını kaybetmiştir.

1931 yılında İngiliz yönetimi sırasında yapılan düzenlemelerle, kapının her iki yanında surlar yıkılarak araç geçişi için yollar açılmıştır. Bu yenileme sırasında, dönemin hükümdarını simgeleyen "GVRI" (V. George, Kral ve İmparator) yazısı kapıya eklenmiştir.

Venedik, Osmanlı ve İngiliz dönemlerinden izler taşıyan Girne Kapısı, bugün Lefkoşa'nın çok katmanlı tarihini yansıtan eşsiz bir anıt niteliğindedir. Günümüzde Lefkoşa Turizm Enformasyon Ofisi olarak hizmet veren bu tarihî yapı, kenti keşfetmek isteyen ziyaretçiler için ideal bir başlangıç noktasıdır.

Girne Kapısı, Lefkoşa'nın geçmişten günümüze uzanan hikâyesine açılan yaşayan bir tarih kapısıdır.`;

const GIRNE_EN = `The Kyrenia Gate is one of the three main entrances in the medieval Venetian walls surrounding Nicosia. It takes its name from the road leading to the city of Kyrenia and is one of the most important historical landmarks of Nicosia.

Construction of the gate began in 1562 by the Venetians for defensive purposes against Ottoman attacks. This date is preserved on the gate in Latin numerals as "MDLXII."

After Cyprus was conquered by the Ottomans in 1571, the gate continued to hold its importance. In 1821, a watchtower was added and the tughra (seal) of Sultan Mahmud II was placed alongside the existing Latin inscription.

On the outer facade of the gate, a Quranic verse from Surah As-Saff known as the "Prayer for Provision" reads: "O God who opens doors, open the gates of goodness for us."

Horoz Ali, the last Ottoman gatekeeper, faithfully opened the gate at sunrise and closed it at sunset. When British officials arrived in 1878 to enter the city, Horoz Ali refused them entry until Ottoman authorities explained the situation. Impressed by his dedication, the British allowed him to continue his duties. Horoz Ali passed away at the Kyrenia Gate in 1946 at the age of 121.

In 1931, under British rule, parts of the walls on both sides of the gate were demolished to create roads for vehicles. The inscription "GVRI" (George V, King and Emperor) was added during this renovation.

Carrying traces of the Venetian, Ottoman and British periods, the Kyrenia Gate today serves as the Nicosia Tourism Information Office and is an ideal starting point for visitors exploring the city.`;

const DIKILITAS_TR = `Lefkoşa'nın kalbinde, Sarayönü (Atatürk) Meydanı'nda yer alan Lefkoşa Dikilitaşı, kentin Venedik döneminden günümüze ulaşan en önemli tarihî simgelerinden biridir. Halk arasında Venedik Sütunu olarak da bilinen bu anıt, Kıbrıs'ın yüzyıllar boyunca ev sahipliği yaptığı medeniyetlerin izlerini taşımaktadır.

Tek parça granitten oluşan sütunun, antik Salamis kentinden getirildiği ve Roma dönemine ait bir yapıdan alındığı düşünülmektedir. 16. yüzyılın ortalarında Venedikliler tarafından Lefkoşa'ya getirilen sütun, bilinçli bir tercihle eski Lüzinyan Sarayı'nın (daha sonra Venedik valisinin sarayı) önüne, yani bugünkü yerine dikilmiştir. Bu konumlandırma, Venedik Cumhuriyeti'nin Kıbrıs üzerindeki siyasi gücünü ve hâkimiyetini açık bir güç gösterisiyle sergileme amacı taşımaktaydı.

Sütunun tepesinde, Venedik Cumhuriyeti'nin simgesi olan Aziz Markos'un Aslanı (San Marco Aslanı) yer almaktaydı. Ayrıca sütunun kaidesi üzerinde, Venedikli soylu aileleri temsil eden 6 adet arma bulunuyordu. Bu armalar, Venedik yönetiminin aristokrat yapısını ve Kıbrıs'taki idari gücünü simgeleyen önemli detaylardı.

1571 yılında Kıbrıs'ın Osmanlılar tarafından fethedilmesinin ardından, Venedik egemenliğinin sembolü olarak görülen sütun yerinden sökülmüş ve bir süre Sarayönü Camii'nin (eski St. Sophia Katedrali) avlusuna taşınmıştır. Bu taşıma ve yeniden yerleştirme süreci sırasında, sütunun üzerindeki Aziz Markos Aslanı tamamen kaybolmuş, kaideyi süsleyen armaların bir kısmı da günümüze ulaşamamıştır.

Osmanlı döneminde meydan ve çevresi önemini korurken, sütun farklı işlevlerle varlığını sürdürmüştür. İngiliz yönetimi döneminde, 20. yüzyılın başlarında sütun yeniden düzenlenmiş ve 1915 yılında bugünkü yerine tekrar dikilmiştir. Kayıp olan aslan heykelinin yerine ise sütunun tepesine bronz bir küre yerleştirilmiştir.

Bugün Sarayönü Meydanı'nın merkezinde yükselen Lefkoşa Dikilitaşı, Venedik, Osmanlı ve İngiliz dönemlerinin izlerini tek bir yapı üzerinde birleştiren nadir tarihî anıtlardan biridir. Yerli ve yabancı ziyaretçiler için önemli bir buluşma noktası olan bu anıt, Lefkoşa'nın çok katmanlı geçmişinin sessiz ama güçlü bir tanığıdır.

Lefkoşa Dikilitaşı, yüzyıllar boyunca değişen iktidarların ve kültürlerin izlerini bugüne taşıyan, kentin tarihsel kimliğini simgeleyen eşsiz bir anıttır.`;

const DIKILITAS_EN = `The Nicosia Column, also known as the Venice Column, stands in Sarayönü (Atatürk) Square in the heart of Nicosia. It is one of the most important historical landmarks surviving from the Venetian period, bearing traces of the civilizations that have called Cyprus home over the centuries.

The single-piece granite column is believed to have been brought from ancient Salamis and taken from a Roman-era structure. It was brought to Nicosia by the Venetians in the mid-16th century and deliberately erected in front of the former Lusignan Palace, demonstrating the Venetian Republic's political power and dominance over Cyprus.

At the top of the column stood the Lion of Saint Mark, symbol of the Venetian Republic. The base also bore six coats of arms representing noble Venetian families, symbolizing the aristocratic nature of Venetian rule in Cyprus.

After Cyprus was conquered by the Ottomans in 1571, the column was removed and temporarily relocated to the courtyard of the Sarayönü Mosque (formerly St. Sophia Cathedral). During this process, the Lion of Saint Mark disappeared entirely and some coats of arms were lost.

Under British rule, the column was reorganized and re-erected at its present location in 1915. A bronze sphere was placed atop the column to replace the missing lion statue.

Today, the Nicosia Column rising at the center of Sarayönü Square is a rare monument combining traces of the Venetian, Ottoman and British periods in a single structure — a silent but powerful witness to Nicosia's multilayered past.`;

async function main() {
  const en = await prisma.language.findFirst({ where: { code: "en" } });
  const tr = await prisma.language.findFirst({ where: { code: "tr" } });

  if (!en || !tr) throw new Error("Languages not found. Run `npx tsx prisma/seed.ts` first.");

  const girne = await prisma.product.upsert({
    where: { slug: "girne-kapisi" },
    update: {},
    create: {
      slug: "girne-kapisi",
      isActive: true,
      translations: {
        create: [
          {
            languageId: tr.id,
            title: "Girne Kapısı",
            description: GIRNE_TR,
            metaTitle: "Girne Kapısı — Lefkoşa'nın Tarihe Açılan Kapısı",
            metaDescription:
              "Kıbrıs'ın başkenti Lefkoşa'nın en önemli tarihi simgelerinden biri olan Girne Kapısı hakkında bilgi edinin.",
          },
          {
            languageId: en.id,
            title: "Kyrenia Gate",
            description: GIRNE_EN,
            metaTitle: "Kyrenia Gate — Nicosia's Gateway to History",
            metaDescription:
              "Discover the history of Kyrenia Gate, one of Nicosia's most iconic landmarks in Cyprus.",
          },
        ],
      },
    },
  });

  const dikilitas = await prisma.product.upsert({
    where: { slug: "lefkosa-dikilitas" },
    update: {},
    create: {
      slug: "lefkosa-dikilitas",
      isActive: true,
      translations: {
        create: [
          {
            languageId: tr.id,
            title: "Lefkoşa Dikilitaşı",
            description: DIKILITAS_TR,
            metaTitle: "Lefkoşa Dikilitaşı (Venedik Sütunu)",
            metaDescription:
              "Sarayönü Meydanı'ndaki Lefkoşa Dikilitaşı'nın tarihi ve hikâyesi.",
          },
          {
            languageId: en.id,
            title: "Nicosia Column",
            description: DIKILITAS_EN,
            metaTitle: "Nicosia Column (Venice Column)",
            metaDescription:
              "Learn about the Nicosia Column in Atatürk Square, a monument carrying traces of Venetian, Ottoman and British rule.",
          },
        ],
      },
    },
  });

  console.log("Seeded:", girne.slug, dikilitas.slug);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
