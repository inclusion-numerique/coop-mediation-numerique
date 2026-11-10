import type { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import { type ActiviteDeMediation, nombreDAccompagnements } from '../domain'
import { activiteDeMediationFromDomain } from './activite-de-mediation.transfer'
import { recalculerLesPremiersAccompagnements } from './premier-accompagnement'

const DELAI_DE_TRANSACTION_MS = 20_000

export type ActiviteDeMediationPrecedente = {
  readonly lieuActiviteId: string | null
  readonly beneficiaireIds: readonly string[]
  readonly suivis: readonly string[]
  readonly anonymesOrphelins: readonly string[]
}

export const lireLActiviteDeMediationPrecedente = async ({
  id,
  mediateurId,
}: {
  readonly id: string
  readonly mediateurId: string
}) => {
  const activite = await prismaClient.activite.findFirst({
    where: { id, mediateurId, suppression: null },
    select: {
      type: true,
      structureId: true,
      creation: true,
      v1CraId: true,
      accompagnements: {
        select: {
          beneficiaire: { select: { id: true, anonyme: true } },
        },
      },
    },
  })
  if (activite === null) return null

  const orphelins = await prismaClient.$queryRaw<{ id: string }[]>`
    SELECT accompagnement.beneficiaire_id AS id
    FROM accompagnements accompagnement
    INNER JOIN beneficiaires beneficiaire
      ON beneficiaire.id = accompagnement.beneficiaire_id
    WHERE accompagnement.activite_id = ${id}::uuid
      AND beneficiaire.anonyme = true
      AND NOT EXISTS (
        SELECT 1 FROM accompagnements autre
        WHERE autre.beneficiaire_id = accompagnement.beneficiaire_id
          AND autre.activite_id <> ${id}::uuid
      )
  `

  const precedente: ActiviteDeMediationPrecedente = {
    lieuActiviteId: activite.structureId,
    beneficiaireIds: activite.accompagnements.map(
      ({ beneficiaire }) => beneficiaire.id,
    ),
    suivis: activite.accompagnements
      .filter(({ beneficiaire }) => !beneficiaire.anonyme)
      .map(({ beneficiaire }) => beneficiaire.id),
    anonymesOrphelins: orphelins.map((orphelin) => orphelin.id),
  }

  return {
    type: activite.type,
    creation: activite.creation,
    identifiantV1: activite.v1CraId,
    precedente,
  }
}

const lignesDe = (activite: ActiviteDeMediation) => {
  const { tags, accompagnements, ...colonnes } = activiteDeMediationFromDomain(
    activite,
    v4,
  )
  const anonymes = accompagnements
    .filter(({ beneficiaire }) => beneficiaire.anonyme)
    .map(({ beneficiaire }) => ({
      ...beneficiaire,
      mediateurId: activite.mediateurId,
      accompagnementsCount: 1,
    }))
  const suivis = accompagnements
    .filter(({ beneficiaire }) => !beneficiaire.anonyme)
    .map(({ beneficiaire }) => beneficiaire.id)
  return {
    colonnes: {
      ...colonnes,
      rdvServicePublicId: colonnes.rdvId,
      accompagnementsCount: nombreDAccompagnements(activite),
    },
    tags: tags.map(({ tagId }) => ({ activiteId: activite.id, tagId })),
    accompagnements: accompagnements.map(
      ({ premierAccompagnement, beneficiaire }) => ({
        activiteId: activite.id,
        beneficiaireId: beneficiaire.id,
        premierAccompagnement,
      }),
    ),
    anonymes,
    suivis,
  }
}

const rattacher = async (
  transaction: Prisma.TransactionClient,
  lignes: ReturnType<typeof lignesDe>,
): Promise<void> => {
  await transaction.accompagnement.createMany({ data: lignes.accompagnements })
  await transaction.activitesTags.createMany({ data: lignes.tags })
  await transaction.beneficiaire.updateMany({
    where: { id: { in: lignes.suivis } },
    data: { accompagnementsCount: { increment: 1 } },
  })
}

const compterLeLieu = (
  transaction: Prisma.TransactionClient,
  lieuActiviteId: string | null,
  variation: number,
) =>
  lieuActiviteId === null
    ? Promise.resolve(null)
    : transaction.lieuInclusion.update({
        where: { id: lieuActiviteId },
        data: { activitesCount: { increment: variation } },
      })

export const creerLActiviteDeMediation = async (
  activite: ActiviteDeMediation,
): Promise<void> => {
  const lignes = lignesDe(activite)
  await prismaClient.$transaction(
    async (transaction) => {
      await transaction.beneficiaire.createMany({ data: lignes.anonymes })
      await transaction.activite.create({ data: lignes.colonnes })
      await rattacher(transaction, lignes)
      await transaction.mediateur.update({
        where: { id: activite.mediateurId },
        data: {
          activitesCount: { increment: 1 },
          accompagnementsCount: { increment: lignes.accompagnements.length },
          derniereCreationActivite: activite.modification,
        },
      })
      await compterLeLieu(transaction, lignes.colonnes.structureId, 1)
      await recalculerLesPremiersAccompagnements(transaction, lignes.suivis)
    },
    { timeout: DELAI_DE_TRANSACTION_MS },
  )
}

export const modifierLActiviteDeMediation = async (
  activite: ActiviteDeMediation,
  precedente: ActiviteDeMediationPrecedente,
): Promise<void> => {
  const lignes = lignesDe(activite)
  await prismaClient.$transaction(
    async (transaction) => {
      await transaction.accompagnement.deleteMany({
        where: { activiteId: activite.id },
      })
      await transaction.activitesTags.deleteMany({
        where: { activiteId: activite.id },
      })
      await transaction.beneficiaire.deleteMany({
        where: { id: { in: [...precedente.anonymesOrphelins] }, anonyme: true },
      })
      await transaction.beneficiaire.updateMany({
        where: {
          id: {
            in: precedente.beneficiaireIds.filter(
              (id) => !precedente.anonymesOrphelins.includes(id),
            ),
          },
        },
        data: { accompagnementsCount: { decrement: 1 } },
      })
      await transaction.beneficiaire.createMany({ data: lignes.anonymes })
      await transaction.activite.update({
        where: {
          id: activite.id,
          mediateurId: activite.mediateurId,
          suppression: null,
        },
        data: lignes.colonnes,
      })
      await rattacher(transaction, lignes)
      await transaction.mediateur.update({
        where: { id: activite.mediateurId },
        data: {
          accompagnementsCount: {
            increment:
              lignes.accompagnements.length - precedente.beneficiaireIds.length,
          },
          derniereCreationActivite: activite.modification,
        },
      })
      await compterLeLieu(transaction, precedente.lieuActiviteId, -1)
      await compterLeLieu(transaction, lignes.colonnes.structureId, 1)
      await recalculerLesPremiersAccompagnements(transaction, [
        ...new Set([...precedente.suivis, ...lignes.suivis]),
      ])
    },
    { timeout: DELAI_DE_TRANSACTION_MS },
  )
}
