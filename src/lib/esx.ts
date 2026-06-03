import mysql from 'mysql2/promise'

let pool: mysql.Pool | null = null

function getESXPool(): mysql.Pool | null {
  if (!process.env.ESX_DATABASE_URL) return null
  if (!pool) {
    try {
      pool = mysql.createPool(process.env.ESX_DATABASE_URL)
    } catch {
      return null
    }
  }
  return pool
}

export interface ESXUser {
  identifier: string
  money: number
  bank: number
  job: string
  job_grade: number
  group: string
  firstname?: string
  lastname?: string
}

export async function getESXUser(identifier: string): Promise<ESXUser | null> {
  const db = getESXPool()
  if (!db) return null
  try {
    const [rows] = await db.execute<mysql.RowDataPacket[]>(
      'SELECT identifier, money, bank, job, job_grade, `group` FROM users WHERE identifier = ? LIMIT 1',
      [identifier]
    )
    return (rows[0] as ESXUser) ?? null
  } catch { return null }
}

export async function getESXCharacter(identifier: string): Promise<{ firstname: string; lastname: string } | null> {
  const db = getESXPool()
  if (!db) return null
  try {
    // Tabellenname kann je nach ESX-Version variieren: characters / players
    const [rows] = await db.execute<mysql.RowDataPacket[]>(
      'SELECT firstname, lastname FROM characters WHERE identifier = ? LIMIT 1',
      [identifier]
    ).catch(() => [[], []])
    return rows[0] ? { firstname: rows[0].firstname, lastname: rows[0].lastname } : null
  } catch { return null }
}

export async function isESXAvailable(): Promise<boolean> {
  const db = getESXPool()
  if (!db) return false
  try {
    await db.execute('SELECT 1')
    return true
  } catch { return false }
}
