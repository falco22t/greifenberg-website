import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { prisma } from '@/lib/prisma'

async function getLawBooks() {
  try {
    return await prisma.lawBook.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
      select: { name: true, slug: true },
    })
  } catch { return [] }
}

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const lawBooks = await getLawBooks()

  return (
    <>
      <Navbar lawBooks={lawBooks} />
      <main className="flex-1">{children}</main>
      <Footer lawBooks={lawBooks} />
    </>
  )
}
