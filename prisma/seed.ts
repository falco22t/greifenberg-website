import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Admin-User anlegen
  const passwordHash = await bcrypt.hash('Admin1234!', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@greifenberg-rp.de' },
    update: {},
    create: {
      username: 'Administrator',
      email: 'admin@greifenberg-rp.de',
      passwordHash,
      role: 'OWNER',
    },
  })
  console.log(`✓ Admin user: ${admin.username}`)

  // Gesetzbücher
  const books = [
    {
      name: 'Strafgesetzbuch',
      slug: 'stgb',
      description: 'Das Strafgesetzbuch (StGB) regelt die allgemeinen Grundsätze des Strafrechts sowie die einzelnen Straftatbestände.',
      colorAccent: '#EF4444',
      sortOrder: 1,
      chapters: [
        {
          number: 'I',
          title: 'Allgemeine Bestimmungen',
          sortOrder: 1,
          paragraphs: [
            {
              paragraphNumber: '§ 1',
              title: 'Grundsatz der Legalität',
              content: `(1) Eine Tat kann nur bestraft werden, wenn die Strafbarkeit gesetzlich bestimmt war, bevor die Tat begangen wurde.\n\n(2) Analoge Strafbegründung ist unzulässig. Im Zweifel gilt der Grundsatz der Unschuldsvermutung.`,
              sortOrder: 1,
            },
            {
              paragraphNumber: '§ 2',
              title: 'Vorsatz und Fahrlässigkeit',
              content: `(1) Strafbar ist nur vorsätzliches Handeln, wenn nicht das Gesetz fahrlässiges Handeln ausdrücklich mit Strafe bedroht.\n\n(2) Vorsätzlich handelt, wer die Verwirklichung eines Tatbestandsmerkmals wissentlich und willentlich herbeiführt.\n\n(3) Fahrlässig handelt, wer die im Verkehr erforderliche Sorgfalt außer Acht lässt.`,
              sortOrder: 2,
            },
          ],
        },
        {
          number: 'II',
          title: 'Straftaten gegen die Person',
          sortOrder: 2,
          paragraphs: [
            {
              paragraphNumber: '§ 10',
              title: 'Körperverletzung',
              content: `(1) Wer eine andere Person körperlich misshandelt oder an der Gesundheit schädigt, wird mit einer Geldstrafe von 5.000€ bis 20.000€ oder Freiheitsstrafe bis zu 5 Jahren bestraft.\n\n(2) Schwere Körperverletzung liegt vor, wenn das Opfer dauerhaft in seiner Gesundheit beeinträchtigt wird. Strafe: Freiheitsstrafe von 2 bis 10 Jahren.\n\n(3) Versuchte Körperverletzung ist strafbar.`,
              sortOrder: 1,
            },
            {
              paragraphNumber: '§ 11',
              title: 'Bedrohung',
              content: `(1) Wer eine Person mit einer gegenwärtigen Gefahr für Leib oder Leben bedroht, wird mit Geldstrafe von 2.500€ bis 10.000€ bestraft.\n\n(2) Die Bedrohung mit einer Schusswaffe erhöht die Strafe auf mindestens 5.000€.`,
              sortOrder: 2,
            },
            {
              paragraphNumber: '§ 12',
              title: 'Totschlag und Mord',
              content: `(1) Wer einen Menschen tötet, ohne Mörder zu sein, wird wegen Totschlags mit Freiheitsstrafe von 10 bis 20 Jahren bestraft.\n\n(2) Mörder ist, wer aus Habgier, zur Befriedigung des Geschlechtstriebs, aus Mordlust oder sonst aus niedrigen Beweggründen, heimtückisch oder grausam oder mit gemeingefährlichen Mitteln oder um eine andere Straftat zu ermöglichen oder zu verdecken, einen Menschen tötet. Strafe: lebenslange Freiheitsstrafe.`,
              sortOrder: 3,
            },
          ],
        },
        {
          number: 'III',
          title: 'Straftaten gegen das Eigentum',
          sortOrder: 3,
          paragraphs: [
            {
              paragraphNumber: '§ 20',
              title: 'Diebstahl',
              content: `(1) Wer eine fremde bewegliche Sache einem anderen in der Absicht wegnimmt, die Sache sich oder einem Dritten rechtswidrig zuzueignen, wird mit Geldstrafe von 3.000€ bis 15.000€ bestraft.\n\n(2) Schwerer Diebstahl liegt vor bei: Einbruch, Verwendung falscher Schlüssel, Diebstahl in besonders großem Ausmaß (ab 50.000€ Wert). Strafe: Freiheitsstrafe von 1 bis 5 Jahren.`,
              sortOrder: 1,
            },
            {
              paragraphNumber: '§ 21',
              title: 'Raub',
              content: `(1) Wer mit Gewalt gegen eine Person oder unter Anwendung von Drohungen mit gegenwärtiger Gefahr für Leib oder Leben eine fremde bewegliche Sache einem anderen in Zueignungsabsicht wegnimmt, wird mit Freiheitsstrafe von 2 bis 10 Jahren bestraft.\n\n(2) Schwerer Raub (bewaffneter Raub): Freiheitsstrafe von 5 bis 15 Jahren.`,
              sortOrder: 2,
            },
          ],
        },
      ],
    },
    {
      name: 'Straßenverkehrsordnung',
      slug: 'stvo',
      description: 'Die Straßenverkehrsordnung (StVO) regelt das Verhalten aller Verkehrsteilnehmer im öffentlichen Straßenverkehr.',
      colorAccent: '#F59E0B',
      sortOrder: 2,
      chapters: [
        {
          number: 'I',
          title: 'Grundregeln',
          sortOrder: 1,
          paragraphs: [
            {
              paragraphNumber: '§ 1',
              title: 'Grundsätze der Verkehrssicherheit',
              content: `(1) Die Teilnahme am Straßenverkehr erfordert ständige Vorsicht und gegenseitige Rücksichtnahme.\n\n(2) Jeder Verkehrsteilnehmer hat sich so zu verhalten, dass kein Anderer geschädigt, gefährdet oder mehr als nach den Umständen unvermeidbar behindert oder belästigt wird.`,
              sortOrder: 1,
            },
            {
              paragraphNumber: '§ 2',
              title: 'Geschwindigkeitsüberschreitung',
              content: `(1) Innerorts gilt eine Höchstgeschwindigkeit von 50 km/h.\n\n(2) Außerorts gilt eine Höchstgeschwindigkeit von 100 km/h.\n\n(3) Auf Autobahnen gilt keine generelle Geschwindigkeitsbeschränkung, jedoch sind die Verkehrszeichen zu beachten.\n\n(4) Bußgelder:\n- Bis 10 km/h: 100€\n- 11–20 km/h: 250€\n- 21–30 km/h: 500€\n- 31–40 km/h: 1.000€ + Fahrverbot 1 Monat\n- Über 40 km/h: 2.500€ + Fahrverbot 3 Monate`,
              sortOrder: 2,
            },
          ],
        },
        {
          number: 'II',
          title: 'Fahren unter Einfluss',
          sortOrder: 2,
          paragraphs: [
            {
              paragraphNumber: '§ 10',
              title: 'Fahren unter Alkoholeinfluss',
              content: `(1) Es ist verboten, unter dem Einfluss von Alkohol am Straßenverkehr teilzunehmen.\n\n(2) Wer mit einem Blutalkoholgehalt von 0,5‰ oder mehr ein Fahrzeug führt, begeht eine Ordnungswidrigkeit: Bußgeld 1.500€, Führerscheinentzug 3 Monate.\n\n(3) Ab 1,6‰ liegt eine Straftat vor: Geldstrafe 5.000€, Führerscheinentzug mindestens 6 Monate.`,
              sortOrder: 1,
            },
          ],
        },
      ],
    },
    {
      name: 'Polizeigesetz',
      slug: 'polg',
      description: 'Das Polizeigesetz (PolG) regelt die Befugnisse und Aufgaben der Polizei sowie die Rechte der Bürger gegenüber Polizeimaßnahmen.',
      colorAccent: '#3B82F6',
      sortOrder: 3,
      chapters: [
        {
          number: 'I',
          title: 'Aufgaben der Polizei',
          sortOrder: 1,
          paragraphs: [
            {
              paragraphNumber: '§ 1',
              title: 'Aufgaben und Befugnisse',
              content: `(1) Die Polizei hat die Aufgabe, von der Allgemeinheit oder dem Einzelnen Gefahren abzuwehren, durch die die öffentliche Sicherheit oder Ordnung bedroht wird.\n\n(2) Zu den Aufgaben gehören:\n- Schutz der Bürger vor Straftaten\n- Verfolgung von Straftaten\n- Aufrechterhaltung der öffentlichen Ordnung\n- Hilfeleistung in Notlagen`,
              sortOrder: 1,
            },
            {
              paragraphNumber: '§ 2',
              title: 'Identitätsfeststellung',
              content: `(1) Die Polizei kann die Identität einer Person feststellen, wenn:\n- die Person sich an einem gefährlichen Ort befindet\n- Tatsachen die Annahme rechtfertigen, dass die Person eine Straftat begehen will\n- die Person sich in der Nähe eines Tatortes befindet\n\n(2) Die Person ist verpflichtet, sich auszuweisen oder ihren Personalausweis vorzuzeigen.`,
              sortOrder: 2,
            },
          ],
        },
      ],
    },
  ]

  for (const bookData of books) {
    const { chapters, ...bookFields } = bookData
    const book = await prisma.lawBook.upsert({
      where: { slug: bookFields.slug },
      update: bookFields,
      create: bookFields,
    })

    for (const chapterData of chapters) {
      const { paragraphs, ...chapterFields } = chapterData
      const chapter = await prisma.lawChapter.create({
        data: { ...chapterFields, bookId: book.id },
      })

      for (const paraData of paragraphs) {
        await prisma.lawParagraph.create({
          data: { ...paraData, chapterId: chapter.id, bookId: book.id },
        })
      }
    }
    console.log(`✓ Law book: ${book.name}`)
  }

  // Forum-Kategorien
  const categories = [
    { name: 'Allgemein', slug: 'allgemein', description: 'Allgemeine Diskussionen rund um Greifenberg RP', icon: 'MessageSquare', sortOrder: 1 },
    { name: 'Vorstellungen', slug: 'vorstellungen', description: 'Stell dich der Community vor', icon: 'User', sortOrder: 2 },
    { name: 'Feedback & Ideen', slug: 'feedback', description: 'Teile dein Feedback und deine Ideen mit uns', icon: 'Lightbulb', sortOrder: 3 },
    { name: 'Off-Topic', slug: 'offtopic', description: 'Alles was nicht in die anderen Kategorien passt', icon: 'Coffee', sortOrder: 4 },
  ]

  for (const cat of categories) {
    await prisma.forumCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log(`✓ Forum categories seeded`)

  // News-Kategorien
  const newsCategories = [
    { name: 'Update', slug: 'update', color: '#1C559A' },
    { name: 'Event', slug: 'event', color: '#F59E0B' },
    { name: 'Team', slug: 'team', color: '#10B981' },
    { name: 'Ankündigung', slug: 'ankuendigung', color: '#8B5CF6' },
  ]

  for (const cat of newsCategories) {
    await prisma.newsCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log(`✓ News categories seeded`)

  // Ticket-Kategorien
  const ticketCategories = [
    { name: 'Allgemein', color: '#64748B' },
    { name: 'Bug-Report', color: '#EF4444' },
    { name: 'Beschwerde', color: '#F59E0B' },
    { name: 'Entbannungsantrag', color: '#8B5CF6' },
    { name: 'Sonstiges', color: '#10B981' },
  ]

  for (const cat of ticketCategories) {
    await prisma.ticketCategory.create({ data: cat }).catch(() => {})
  }
  console.log(`✓ Ticket categories seeded`)

  console.log('✅ Seeding complete!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
