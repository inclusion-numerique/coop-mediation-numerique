import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma/prisma-client'
import type { Prisma } from '@/generated/prisma/client'
import type { ActiviteDeMediation } from '../../domain'
import { activiteDeMediationFromDomain } from './activite-de-mediation.transfer'
import { recalculerLesPremiersAccompagnements } from './premier-accompagnement.mutation'

const DELAI_DE_TRANSACTION_MS = 20_000

export type ActiviteDeMediationPrecedente = {
  readonly lieuActiviteId: string | null
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
    }))
  const suivis = accompagnements
    .filter(({ beneficiaire }) => !beneficiaire.anonyme)
    .map(({ beneficiaire }) => beneficiaire.id)
  return {
    colonnes: {
      ...colonnes,
      rdvServicePublicId: colonnes.rdvId,
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
}

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
        data: { derniereCreationActivite: activite.modification },
      })
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
        data: { derniereCreationActivite: activite.modification },
      })
      await recalculerLesPremiersAccompagnements(transaction, [
        ...new Set([...precedente.suivis, ...lignes.suivis]),
      ])
    },
    { timeout: DELAI_DE_TRANSACTION_MS },
  )
}
