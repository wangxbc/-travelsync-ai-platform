import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

const hasValidDatabaseUrl = () => {
  const databaseUrl = process.env.DATABASE_URL
  return (
    databaseUrl &&
    (databaseUrl.startsWith('postgresql://') ||
      databaseUrl.startsWith('postgres://') ||
      databaseUrl.startsWith('mysql://') ||
      databaseUrl.startsWith('sqlite://')) &&
    !databaseUrl.includes('localhost:5432') &&
    !databaseUrl.includes('mock')
  )
}

const createPrismaClient = () => {
  if (!hasValidDatabaseUrl()) {
    console.warn(
      ' DATABASE_URL not found or invalid. Using mock Prisma client.'
    )
    return new PrismaClient({
      datasources: {
        db: {
          url: 'postgresql://mock:mock@localhost:5432/mock',
        },
      },
      log: [],
    })
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
}

const prisma = globalThis.prisma || createPrismaClient()

if (process.env.NODE_ENV === 'development') {
  globalThis.prisma = prisma
}

export default prisma
export { prisma }

export type {
  User,
  Itinerary,
  Location,
  Activity,
  Collaboration,
  UserAction,
  Recommendation,
} from '@prisma/client'
