import { prisma } from './prisma'

interface LogParams {
  userId?: number
  action: string
  entityType?: string
  entityId?: number
  details?: object
  ipAddress?: string
  userAgent?: string
}

export async function log(params: LogParams) {
  try {
    await prisma.activityLog.create({ data: params })
  } catch {
    // Logging darf niemals die App crashen
  }
}

export const LogAction = {
  // Auth
  USER_REGISTER:       'USER_REGISTER',
  USER_LOGIN:          'USER_LOGIN',
  USER_LOGOUT:         'USER_LOGOUT',
  USER_BAN:            'USER_BAN',
  USER_UNBAN:          'USER_UNBAN',
  // Forum
  FORUM_THREAD_CREATE: 'FORUM_THREAD_CREATE',
  FORUM_POST_CREATE:   'FORUM_POST_CREATE',
  FORUM_POST_DELETE:   'FORUM_POST_DELETE',
  FORUM_THREAD_LOCK:   'FORUM_THREAD_LOCK',
  // News
  NEWS_CREATE:         'NEWS_CREATE',
  NEWS_UPDATE:         'NEWS_UPDATE',
  NEWS_DELETE:         'NEWS_DELETE',
  // Tickets
  TICKET_CREATE:       'TICKET_CREATE',
  TICKET_CLOSE:        'TICKET_CLOSE',
  TICKET_REPLY:        'TICKET_REPLY',
  // Admin
  ADMIN_EDIT:          'ADMIN_EDIT',
  ADMIN_DELETE:        'ADMIN_DELETE',
  ADMIN_SETTING:       'ADMIN_SETTING',
  // Laws
  LAW_CREATE:          'LAW_CREATE',
  LAW_UPDATE:          'LAW_UPDATE',
  LAW_DELETE:          'LAW_DELETE',
} as const
