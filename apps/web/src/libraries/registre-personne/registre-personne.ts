import type { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import * as Sentry from '@sentry/nextjs'
import { alignementDe, aUneAutreSource } from './alignement'

type Transaction = Prisma.TransactionClient

type LigneCandidate = {
  readonly id: number
  readonly occupee: boolean
}

const ligneQuiPorteLeCourriel = async (
  email: string,
  prisma: Transaction,
): Promise<LigneCandidate | null> => {
  const normalise = email.trim().toLowerCase()
  if (normalise === '') return null

  const [ligne] = await prisma.$queryRaw<LigneCandidate[]>`
    SELECT
      p.id,
      EXISTS (
        SELECT 1 FROM coop.users titulaire
        WHERE titulaire.id = p.coop_id AND titulaire.deleted IS NULL
      ) AS occupee
    FROM main.personne p
    WHERE lower(p.contact->'coop'->>'email') = ${normalise}
       OR lower(p.contact->'idposte'->>'mail_perso') = ${normalise}
       OR lower(p.contact->'idposte'->>'mail_pro') = ${normalise}
    ORDER BY
      2 ASC,
      EXISTS (
        SELECT 1 FROM main.personne_affectations_emploi a
        WHERE a.personne_id = p.id
          AND a.source = 'idposte' AND a.est_active
          AND a.structure_administrative_id IS NOT NULL
      ) DESC,
      p.id ASC
    LIMIT 1`

  return ligne ?? null
}

const signalerLaLigneOccupee = (
  coopUserId: string,
  personneId: number,
): void => {
  Sentry.captureMessage?.(
    'Courriel d’un compte Coop trouvé sur la ligne d’un autre compte vivant',
    { level: 'warning', extra: { coopUserId, personneId } },
  )
}

const creerLaLigne = (
  { coopUserId, email }: { coopUserId: string; email: string },
  prisma: Transaction,
): Promise<{ id: number }> =>
  prisma.personneMain.upsert({
    where: { coopId: coopUserId },
    create: { coopId: coopUserId, contact: { coop: { email } } },
    update: {},
    select: { id: true },
  })

export const ensurePersonneMain = async (
  {
    coopUserId,
    email,
  }: {
    coopUserId: string
    email: string
  },
  prisma: Transaction = prismaClient,
): Promise<{ id: number }> => {
  const reliee = await prisma.personneMain.findUnique({
    where: { coopId: coopUserId },
    select: { id: true },
  })
  if (reliee) return reliee

  const candidate = await ligneQuiPorteLeCourriel(email, prisma)

  if (candidate === null) return creerLaLigne({ coopUserId, email }, prisma)

  if (candidate.occupee) {
    signalerLaLigneOccupee(coopUserId, candidate.id)
    return creerLaLigne({ coopUserId, email }, prisma)
  }

  return prisma.personneMain.update({
    where: { id: candidate.id },
    data: { coopId: coopUserId },
    select: { id: true },
  })
}

const compteCoopSelect = {
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  deleted: true,
  mediateur: { select: { isVisible: true } },
  coordinateur: { select: { id: true } },
} as const

const ligneDuRegistreSelect = {
  id: true,
  nom: true,
  prenom: true,
  contact: true,
  cnPgId: true,
  conseillerNumeriqueId: true,
  aidantConnectId: true,
  isMediateur: true,
  isCoordinateur: true,
  isVisible: true,
  deletedAt: true,
  deletedBy: true,
} as const

const personneASynchroniser = async (
  transaction: Transaction,
  userId: string,
  compte: { readonly email: string; readonly deleted: Date | null },
): Promise<{ id: number } | null> =>
  compte.deleted === null
    ? ensurePersonneMain(
        { coopUserId: userId, email: compte.email },
        transaction,
      )
    : transaction.personneMain.findUnique({
        where: { coopId: userId },
        select: { id: true },
      })

export const synchroniserPersonne = async (
  transaction: Transaction,
  userId: string,
  maintenant: Date = new Date(),
): Promise<void> => {
  const compte = await transaction.user.findUnique({
    where: { id: userId },
    select: compteCoopSelect,
  })
  if (compte === null) return

  const personne = await personneASynchroniser(transaction, userId, compte)
  if (personne === null) return

  const ligne = await transaction.personneMain.findUniqueOrThrow({
    where: { id: personne.id },
    select: ligneDuRegistreSelect,
  })

  const alignement = alignementDe({ compte, ligne, maintenant })
  if (alignement === null) return

  await transaction.personneMain.update({
    where: { id: ligne.id },
    data: alignement,
  })
}

const sansLeBlocCoop = (contact: unknown) =>
  typeof contact === 'object' && contact !== null && !Array.isArray(contact)
    ? Object.fromEntries(
        Object.entries(contact).filter(([source]) => source !== 'coop'),
      )
    : {}

export const retirerDuRegistre = async (
  transaction: Transaction,
  userId: string,
  maintenant: Date = new Date(),
): Promise<void> => {
  const ligne = await transaction.personneMain.findUnique({
    where: { coopId: userId },
    select: {
      ...ligneDuRegistreSelect,
      _count: { select: { contrats: true, postes: true } },
    },
  })
  if (ligne === null) return

  if (
    aUneAutreSource(ligne) ||
    ligne._count.contrats > 0 ||
    ligne._count.postes > 0
  ) {
    await transaction.personneMain.update({
      where: { id: ligne.id },
      data: {
        coopId: null,
        contact: sansLeBlocCoop(ligne.contact),
        editedBy: 'coop',
        updatedAtCoop: maintenant,
      },
    })
    return
  }

  await transaction.personneAffectationEmploiMain.deleteMany({
    where: { personneId: ligne.id },
  })
  await transaction.personneMain.delete({ where: { id: ligne.id } })
}
