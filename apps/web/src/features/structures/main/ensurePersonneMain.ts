import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'

type PrismaLike = Prisma.TransactionClient

// Garantit qu'une ligne `main.personne` existe et porte le `coop_id` du user coop (ADR-002, périmètre
// élargi 2026-07-23). Trois cas, l'email servant de pivot (décision Marc) :
//   1. déjà reliée (coop_id posé) -> on la renvoie ;
//   2. existe via un AUTRE flux (idposte/CN, coop déjà sync) retrouvée par email -> on pose le coop_id ;
//   3. n'existe pas -> on la crée (coop_id + email dans le contact).
// La coop n'assure PAS une synchro continue de main.personne : elle garantit juste son existence au
// moment où elle en a besoin (création d'une employeuse à l'inscription).
//
// ⚠️ Non branché dans le flux live : ce câblage fait partie du cutover coordonné avec l'Entrepôt
// (FK personne.coop_id posée par Flyway, grants INSERT/UPDATE sur main.personne au rôle `sonum`,
// arrêt de la branche emploi du coop-dag). Voir docs/adr/adr-002-reconciliation-dataspace.md.

// Sources non-coop où chercher l'email d'une personne préexistante (le flux coop, lui, aurait déjà
// posé le coop_id — donc capté au cas 1).
const EMAIL_SOURCES = ['idposte', 'coop'] as const

const findPersonneByEmail = async (
  email: string,
  prisma: PrismaLike,
): Promise<{ id: number } | null> => {
  for (const source of EMAIL_SOURCES) {
    const found = await prisma.personneMain.findFirst({
      where: { contact: { path: [source, 'email'], equals: email } },
      select: { id: true },
    })
    if (found) return found
  }
  return null
}

export const ensurePersonneMain = async (
  {
    coopUserId,
    email,
  }: {
    coopUserId: string
    email: string
  },
  prisma: PrismaLike = prismaClient,
): Promise<{ id: number }> => {
  const byCoopId = await prisma.personneMain.findFirst({
    where: { coopId: coopUserId },
    select: { id: true },
  })
  if (byCoopId) return byCoopId

  const byEmail = await findPersonneByEmail(email, prisma)
  if (byEmail) {
    return prisma.personneMain.update({
      where: { id: byEmail.id },
      data: { coopId: coopUserId },
      select: { id: true },
    })
  }

  return prisma.personneMain.create({
    data: {
      coopId: coopUserId,
      contact: { coop: { email } },
    },
    select: { id: true },
  })
}
