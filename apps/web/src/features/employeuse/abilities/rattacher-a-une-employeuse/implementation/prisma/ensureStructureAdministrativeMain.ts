import { throttleApiEntreprise } from '@app/web/libraries/siret'
import { prismaClient } from '@app/web/prismaClient'
import * as Sentry from '@sentry/nextjs'
import {
  type AdresseSource,
  findAdresseMainId,
  insertAdresseMain,
  resolveAdresseMain,
} from './adresseMain'
import { resolveIdentiteFromSiret } from './resolveIdentiteSirene'

// Identité minimale pour peupler `main.structure_administrative` : la dénomination (`nom`) + l'adresse
// à géocoder. Le chemin d'écriture au fil de l'eau la connaît déjà (payload / saisie).
export type IdentiteStructureMain = AdresseSource & { nom: string }

// Résout l'identité via l'API Recherche d'entreprises. Réservé au cas où l'appelant n'a PAS l'identité
// en main (reprise depuis un simple SIRET) : le chemin d'écriture au fil de l'eau, lui, la fournit
// déjà (`identite`) et évite cet aller-retour throttlé et faillible (indisponible en e2e).
const resolveIdentiteViaApi = async (
  siret: string | null,
): Promise<IdentiteStructureMain | null> => {
  if (!siret || siret.trim() === '') return null
  await throttleApiEntreprise()
  const resolved = await resolveIdentiteFromSiret(siret)
  if ('erreur' in resolved) return null
  return resolved.identite
}

const memeDenomination = (a: string | null, b: string | null): boolean =>
  a !== null && b !== null && a.trim().toLowerCase() === b.trim().toLowerCase()

/**
 * Ligne `main` déjà existante pour cette identité, s'il y en a une.
 *
 * Chercher sur la seule clé `(siret, denomination_antenne)` ne suffit pas : les producteurs de
 * l'Entrepôt écrivent la raison sociale dans `denomination_sirene` et laissent
 * `denomination_antenne` à NULL. 7 163 SIRET de production sont dans ce cas, et ces lignes étaient
 * donc invisibles au lookup — on créait un doublon à côté, avec le même SIRET et la même
 * dénomination, sans violer la clé d'unicité puisqu'elle ne porte que sur l'antenne. Le compte
 * `REPUBLIQUE FRANCAISE PRESIDENCE` en portait déjà deux exemplaires (33156 et 33275).
 *
 * On élargit donc à la dénomination SIRENE, en gardant l'antenne prioritaire : deux antennes
 * distinctes d'un même SIRET restent deux lignes, ce qu'elles doivent être. Ordre par `id` pour que
 * deux écritures concurrentes retiennent la même ligne.
 */
const findStructureMainByIdentity = async ({
  siret,
  denominationAntenne,
}: {
  siret: string | null
  denominationAntenne: string | null
}): Promise<{ id: number } | null> => {
  // Sans SIRET, aucune identité légale à rapprocher : on ne rapproche rien plutôt que de
  // rassembler toutes les lignes qui n'en portent pas.
  if (!siret) return null

  const candidats = await prismaClient.structureAdministrativeMain.findMany({
    where: { siret },
    select: { id: true, denominationAntenne: true, denominationSirene: true },
    orderBy: { id: 'asc' },
  })

  const parAntenne = candidats.find((candidat) =>
    memeDenomination(candidat.denominationAntenne, denominationAntenne),
  )
  const parSirene = candidats.find((candidat) =>
    memeDenomination(candidat.denominationSirene, denominationAntenne),
  )

  const retenu = parAntenne ?? parSirene
  return retenu ? { id: retenu.id } : null
}

/**
 * Garantit qu'une ligne `main.structure_administrative` existe pour la structure employeuse coop
 * `coopId` (adresse géocodée BAN). Anti-dérive de l'ADR-002 : appelée à chaque création/réutilisation
 * d'une employeuse pour qu'aucune ligne coop ne reste sans équivalent `main` (prérequis de la bascule
 * des clés étrangères, et du read de l'employeuse depuis `main`).
 *
 * - Ne fait rien de coûteux si la ligne `main` existe déjà (simple lookup par `structure_coop_id`).
 * - **Dual-write au fil de l'eau** : l'appelant fournit `identite` (déjà connue puisqu'on vient
 *   d'écrire la structure coop) -> aucun appel API Entreprise. À défaut, on la résout depuis le SIRET.
 * - Sans identité fournie NI SIRET résolvable, ne crée rien.
 * - **Best-effort et non bloquant** : toute erreur (API, géocodage, conflit d'unicité) est avalée —
 *   le chemin d'écriture ne doit JAMAIS échouer à cause de la couverture `main`. La dérive résiduelle
 *   reste à compléter à la main : le job de rattrapage a été supprimé une fois
 *   la reprise ADR-002 passée.
 */
export const ensureStructureAdministrativeMain = async ({
  coopId,
  siret,
  identite,
}: {
  coopId: string | null
  siret: string | null
  identite?: IdentiteStructureMain
}): Promise<{ id: number } | null> => {
  // Fast-path par `structure_coop_id` uniquement si un lien coop existe. ADR-002 échange final : le
  // chemin d'écriture au fil de l'eau n'écrit plus de `coop.structure_administrative` -> `coopId` est
  // null et la dédup repose alors sur la seule clé métier `(siret, denomination_antenne)` ci-dessous.
  const existing = coopId
    ? await prismaClient.structureAdministrativeMain.findFirst({
        where: { structureCoopId: coopId },
        select: { id: true },
      })
    : null
  if (existing) return existing

  try {
    // Identité en main (dual-write) -> pas d'aller-retour API. Sinon on la résout depuis le SIRET.
    const resolvedIdentite = identite ?? (await resolveIdentiteViaApi(siret))
    if (!resolvedIdentite) return null

    const denominationAntenne =
      resolvedIdentite.nom.trim() === '' ? null : resolvedIdentite.nom

    // Dédoublonnage AVANT de créer : une même employeuse peut déjà exister dans `main` sous un autre
    // `structure_coop_id` (données Entrepôt, ou un autre coop pointant la même identité légale). Sans
    // ce lookup, la création violerait `structure_administrative_siret_antenne_ukey` et l'erreur
    // (avalée) laisserait un emploi sans `main` -> employeuse invisible.
    const existingByIdentity = await findStructureMainByIdentity({
      siret,
      denominationAntenne,
    })
    if (existingByIdentity) return existingByIdentity

    const adresse = await resolveAdresseMain(resolvedIdentite)
    const adresseId =
      (await findAdresseMainId(adresse))?.id ??
      (await insertAdresseMain(adresse))

    return await prismaClient.structureAdministrativeMain.create({
      data: {
        siret,
        denominationAntenne,
        adresseId,
        structureCoopId: coopId,
      },
      select: { id: true },
    })
  } catch (error) {
    // Ne jamais casser l'écriture : on trace et on laisse le job de complétion rattraper.
    console.error(
      `ensureStructureAdministrativeMain: échec pour coopId ${coopId} (siret ${siret})`,
      error,
    )
    Sentry.captureException?.(error)
    return null
  }
}
