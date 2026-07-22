import { searchAdresse } from '@app/web/external-apis/apiAdresse'
import { banFeatureToAdresseBanData } from '@app/web/external-apis/ban/banFeatureToAdresseBanData'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import type { FindOrCreateInput } from './findOrCreateLieuInclusion'
import { isContainedName, sameDepartement } from './findOrCreateLieuInclusion'
import { ensureStructureAdministrativeMain } from './main/ensureStructureAdministrativeMain'

// Frère de findOrCreateLieuInclusion dédié au rôle EMPLOYEUSE : crée une
// `structure_administrative` (identité légale) et non une `structures` (lieu).
// Même stratégie de déduplication (SIRET + codeInsee normalisé BAN, fallback nom),
// car les payloads Dataspace présentent les mêmes divergences de codeInsee.
// La normalisation BAN sert ici uniquement à fiabiliser le lookup ; l'adresse
// stockée reste celle du payload (alignée API Entreprise).

const undeleteIfDeleted = async ({
  id,
  suppression,
}: {
  id: string
  suppression: Date | null
}) => {
  if (suppression) {
    await prismaClient.structureAdministrative.update({
      where: { id },
      data: { suppression: null },
    })
  }
}

const findExistingBySiretOrNom = async ({
  siret,
  nom,
  codeInsee,
}: {
  siret: string | null
  nom: string
  codeInsee: string
}): Promise<{ id: string } | null> => {
  const where = siret
    ? { siret, codeInsee, suppression: null }
    : { nom, codeInsee, suppression: null }

  const existing = await prismaClient.structureAdministrative.findFirst({
    where,
    select: { id: true, suppression: true },
    orderBy: { creation: 'desc' },
  })

  if (existing) {
    await undeleteIfDeleted(existing)
    return existing
  }

  // Fallback : même SIRET, n'importe quel codeInsee, avec nom "contenu".
  if (siret) {
    const candidatesBySiret =
      await prismaClient.structureAdministrative.findMany({
        where: { siret, suppression: null },
        select: { id: true, nom: true, suppression: true },
        orderBy: { creation: 'desc' },
      })

    const match = candidatesBySiret.find((s) => isContainedName(s.nom, nom))

    if (match) {
      await undeleteIfDeleted(match)
      return match
    }
  }

  return null
}

/**
 * Find-or-create de la ligne COOP structure_administrative (rôle employeuse) suivant la
 * même hiérarchie que findOrCreateLieuInclusion : coopId → SIRET+codeInsee → nom+codeInsee.
 */
const findOrCreateCoopStructureAdministrative = async ({
  coopId,
  siret,
  nom,
  adresse,
  codePostal,
  codeInsee,
  commune,
  nomReferent,
  courrielReferent,
  telephoneReferent,
}: FindOrCreateInput): Promise<{ id: string }> => {
  if (coopId) {
    const existing = await prismaClient.structureAdministrative.findFirst({
      where: { id: coopId },
      select: { id: true, suppression: true },
    })
    if (existing) {
      await undeleteIfDeleted(existing)
      return existing
    }
  }

  // Normalise le codeInsee via BAN pour que le lookup utilise la même valeur que
  // le payload, en se gardant des mauvais géocodages hors-département (DOM).
  const fullAdresse = `${adresse}, ${codePostal} ${commune}`
  const adresseResult = await searchAdresse(fullAdresse)
  const banData = adresseResult
    ? banFeatureToAdresseBanData(adresseResult)
    : null
  const trustedBanData =
    banData && sameDepartement(banData.codeInsee, codeInsee) ? banData : null
  const resolvedCodeInsee = trustedBanData?.codeInsee ?? codeInsee

  if (siret) {
    const existing = await prismaClient.structureAdministrative.findFirst({
      where: { siret, codeInsee: resolvedCodeInsee, suppression: null },
      select: { id: true, suppression: true },
      orderBy: [
        { suppression: { sort: 'desc', nulls: 'last' } },
        { creation: 'desc' },
      ],
    })
    if (existing) {
      await undeleteIfDeleted(existing)
      return existing
    }
  }

  if (!siret) {
    const existing = await prismaClient.structureAdministrative.findFirst({
      where: { nom, codeInsee: resolvedCodeInsee },
      select: { id: true, suppression: true },
      orderBy: [
        { suppression: { sort: 'desc', nulls: 'last' } },
        { creation: 'desc' },
      ],
    })
    if (existing) {
      await undeleteIfDeleted(existing)
      return existing
    }
  }

  // Garde anti-doublon avant création
  const existingGuard = await findExistingBySiretOrNom({
    siret,
    nom,
    codeInsee: resolvedCodeInsee,
  })
  if (existingGuard) return existingGuard

  return prismaClient.structureAdministrative.create({
    data: {
      id: v4(),
      siret,
      nom,
      adresse,
      commune,
      codePostal,
      codeInsee,
      nomReferent,
      courrielReferent,
      telephoneReferent,
      source: 'coop',
    },
    select: { id: true },
  })
}

/**
 * Find-or-create d'une structure employeuse : crée/réutilise la ligne coop, PUIS garantit
 * (best-effort, non bloquant) la ligne `main` correspondante à partir du SIRET — anti-dérive de
 * l'ADR-002. Renvoie `id` (uuid coop) ET `mainId` (int main, `null` si la garantie a échoué), pour
 * que les écritures d'emplois/activités peuplent les deux colonnes pendant la bascule (dual-write).
 */
export const findOrCreateStructureAdministrative = async (
  input: FindOrCreateInput,
): Promise<{ id: string; mainId: number | null }> => {
  const coop = await findOrCreateCoopStructureAdministrative(input)
  const main = await ensureStructureAdministrativeMain({
    coopId: coop.id,
    siret: input.siret,
  })
  return { id: coop.id, mainId: main?.id ?? null }
}
