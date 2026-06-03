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

  // Guide-Kategorien
  const guideCategories = [
    { name: 'Erste Schritte', slug: 'erste-schritte', icon: 'Zap',       sortOrder: 1 },
    { name: 'Jobs & Wirtschaft', slug: 'jobs',         icon: 'Briefcase', sortOrder: 2 },
    { name: 'Fahrzeuge',         slug: 'fahrzeuge',    icon: 'Car',       sortOrder: 3 },
    { name: 'Roleplay',          slug: 'roleplay',     icon: 'Users',     sortOrder: 4 },
    { name: 'Fraktionen',        slug: 'fraktionen',   icon: 'Shield',    sortOrder: 5 },
  ]

  for (const cat of guideCategories) {
    await prisma.guideCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }

  // Guides
  const guideCatMap: Record<string, number> = {}
  const allGuideCats = await prisma.guideCategory.findMany()
  for (const c of allGuideCats) guideCatMap[c.slug] = c.id

  const guides = [
    {
      slug: 'erste-schritte',
      title: 'Erste Schritte auf Greifenberg RP',
      categorySlug: 'erste-schritte',
      estimatedReadMinutes: 5,
      sortOrder: 1,
      content: `<h2>Willkommen auf Greifenberg RP!</h2>
<p>Diese Anleitung hilft dir, schnell in die Welt von Greifenberg RP einzusteigen.</p>
<h3>1. FiveM installieren</h3>
<p>Lade FiveM von <a href="https://fivem.net">fivem.net</a> herunter und installiere es. Du benötigst außerdem ein legales Exemplar von GTA V.</p>
<h3>2. Server beitreten</h3>
<p>Öffne FiveM, klicke auf "Server suchen" und suche nach <strong>Greifenberg RP</strong>. Alternativ kannst du in der F8-Konsole den Befehl <code>connect &lt;server-ip&gt;</code> eingeben.</p>
<h3>3. Charakter erstellen</h3>
<p>Beim ersten Beitritt wirst du durch die Charaktererstellung geführt. Wähle Vor- und Nachname sowie das Aussehen deines Charakters.</p>
<h3>4. Tutorial abschließen</h3>
<p>Folge den Anweisungen des Tutorials, um die Grundmechaniken kennenzulernen und deine Starterausstattung zu erhalten.</p>`,
    },
    {
      slug: 'dein-erster-job',
      title: 'Dein erster Job & erstes Geld verdienen',
      categorySlug: 'jobs',
      estimatedReadMinutes: 8,
      sortOrder: 1,
      content: `<h2>Geld verdienen als Einsteiger</h2>
<p>Als neuer Spieler stehen dir mehrere Einstiegsjobs zur Verfügung.</p>
<h3>Zum Arbeitsamt</h3>
<p>Das Arbeitsamt ist auf deiner Karte markiert. Dort kannst du einen der verfügbaren Jobs annehmen.</p>
<h3>Verfügbare Einstiegsjobs</h3>
<ul>
<li><strong>Müllabfuhr</strong> – Einfach zu starten, gute Grundvergütung</li>
<li><strong>Taxifahrer</strong> – Lerne die Karte kennen und verdiene Trinkgeld</li>
<li><strong>Busfahrer</strong> – Feste Routen, ruhiges Gameplay</li>
<li><strong>LKW-Fahrer</strong> – Längere Fahrten, höhere Bezahlung</li>
</ul>
<h3>Gehalt</h3>
<p>Das Gehalt wird automatisch alle 30 Minuten auf dein Konto überwiesen, solange du aktiv arbeitest.</p>`,
    },
    {
      slug: 'fahrzeuge-fuehrerschein',
      title: 'Fahrzeuge kaufen & Führerschein machen',
      categorySlug: 'fahrzeuge',
      estimatedReadMinutes: 6,
      sortOrder: 1,
      content: `<h2>Mobilität auf Greifenberg RP</h2>
<p>Ein eigenes Fahrzeug ist essenziell für das Roleplay auf unserem Server.</p>
<h3>Führerschein</h3>
<p>Besuche die Fahrschule (auf der Karte markiert) und bestehe die Prüfung. Ohne Führerschein drohen Bußgelder bei Polizeikontrollen.</p>
<h3>Fahrzeug kaufen</h3>
<p>Bei den verschiedenen Fahrzeughändlern kannst du neue und gebrauchte Fahrzeuge erwerben. Achte auf dein Budget!</p>
<h3>Versicherung</h3>
<p>Jedes Fahrzeug muss versichert werden. Ohne Versicherung kann das Fahrzeug bei einem Unfall oder einer Kontrolle beschlagnahmt werden.</p>
<h3>Garage</h3>
<p>Deine Fahrzeuge werden in der persönlichen Garage gespeichert. Über die Karte findest du alle Garagen in der Stadt.</p>`,
    },
    {
      slug: 'roleplay-grundlagen',
      title: 'Roleplay-Grundlagen & wichtige Regeln',
      categorySlug: 'roleplay',
      estimatedReadMinutes: 10,
      sortOrder: 1,
      content: `<h2>Was ist Roleplay?</h2>
<p>Roleplay bedeutet, in die Rolle deines Charakters zu schlüpfen und Situationen realistisch zu spielen.</p>
<h3>FearRP</h3>
<p>Dein Charakter hat Angst vor dem Tod. Wenn jemand eine Waffe auf dich richtet, musst du realistisch reagieren – nicht einfach wegrennen oder angreifen.</p>
<h3>New Life Rule (NLR)</h3>
<p>Nach dem Tod deines Charakters vergisst dieser alle Ereignisse, die zum Tod geführt haben. Du darfst nicht zurückgehen und Rache nehmen.</p>
<h3>Kein Metagaming</h3>
<p>Informationen aus Discord, Streams oder anderen externen Quellen dürfen nicht im Spiel genutzt werden.</p>
<h3>Kein RDM / VDM</h3>
<p>Töte andere Spieler nicht ohne Grund (RDM) und überfahre sie nicht absichtlich mit Fahrzeugen (VDM).</p>
<h3>Charakter-Kontinuität</h3>
<p>Bleib deinem Charakter treu. Entwickle eine Geschichte, Persönlichkeit und Motivationen für deinen Charakter.</p>`,
    },
    {
      slug: 'fraktionen-beitreten',
      title: 'Fraktionen beitreten & bewerben',
      categorySlug: 'fraktionen',
      estimatedReadMinutes: 4,
      sortOrder: 1,
      content: `<h2>Fraktionen auf Greifenberg RP</h2>
<p>Unser Server bietet verschiedene offizielle Fraktionen mit eigener Struktur und Aufgaben.</p>
<h3>Verfügbare Fraktionen</h3>
<ul>
<li><strong>Polizei (LSPD)</strong> – Ordnung und Sicherheit in der Stadt</li>
<li><strong>Feuerwehr</strong> – Brandbekämpfung und technische Hilfeleistung</li>
<li><strong>Rettungsdienst (EMS)</strong> – Medizinische Versorgung</li>
<li><strong>Justiz</strong> – Staatsanwaltschaft und Richter</li>
</ul>
<h3>Bewerbungsprozess</h3>
<ol>
<li>Tritt unserem Discord bei: discord.gg/TspeGxXr2C</li>
<li>Navigiere zum entsprechenden Bewerbungskanal</li>
<li>Fülle das Bewerbungsformular vollständig aus</li>
<li>Warte auf die Rückmeldung des Fraktionsführers</li>
<li>Bestehe das Vorstellungsgespräch im Roleplay</li>
</ol>
<h3>Voraussetzungen</h3>
<p>In der Regel werden mindestens 10 Stunden Spielzeit und ein sauberes Regelwerk-Protokoll vorausgesetzt.</p>`,
    },
  ]

  for (const g of guides) {
    await prisma.guide.upsert({
      where: { slug: g.slug },
      update: {},
      create: {
        slug: g.slug,
        title: g.title,
        authorId: admin.id,
        categoryId: guideCatMap[g.categorySlug] ?? null,
        estimatedReadMinutes: g.estimatedReadMinutes,
        sortOrder: g.sortOrder,
        content: g.content,
        isPublished: true,
      },
    })
  }
  console.log(`✓ Guides seeded`)

  console.log('✅ Seeding complete!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
