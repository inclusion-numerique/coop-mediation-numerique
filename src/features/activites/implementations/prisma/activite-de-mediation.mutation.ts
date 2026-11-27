import { v4 } from 'uuid'
import { addMutationLog, prismaClient } from '@/configuration/prisma'
import type { Prisma } from '@/generated/prisma/client'
import type {
  ActiviteDeMediation,
  CreerLActiviteDeMediation,
  ModifierLActiviteDeMediation,
  UtilisateurId,
} from '../../domain'
import { activiteDeMediationFromDomain } from './activite-de-mediation.transfer'
import { recalculerLesPremiersAccompagnements } from './premier-accompagnement.mutation'

const DELAI_DE_TRANSACTION_MS = 20_000

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

const journaliser = (
  auteurId: UtilisateurId,
  nom: 'CreerActivite' | 'ModifierActivite',
  activite: ActiviteDeMediation,
) =>
  addMutationLog({
    userId: auteurId,
    nom,
    data: { type: activite._tag, id: activite.id },
  })

export const creerLActiviteDeMediation =
  (auteurId: UtilisateurId): CreerLActiviteDeMediation =>
  async (activite) => {
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
    journaliser(auteurId, 'CreerActivite', activite)
  }

export const modifierLActiviteDeMediation =
  (auteurId: UtilisateurId): ModifierLActiviteDeMediation =>
  async (activite, precedente) => {
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
          where: {
            id: { in: [...precedente.anonymesOrphelins] },
            anonyme: true,
          },
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
    journaliser(auteurId, 'ModifierActivite', activite)
  }
