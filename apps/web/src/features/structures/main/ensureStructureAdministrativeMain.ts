import {
  findAdresseMainId,
  insertAdresseMain,
  resolveAdresseMain,
} from '@app/web/features/structures/main/adresseMain'
import { resolveIdentiteFromSiret } from '@app/web/features/structures/main/resolveIdentiteSirene'
import { throttleApiEntreprise } from '@app/web/features/structures/siret/siretIdentity'
import { prismaClient } from '@app/web/prismaClient'
import * as Sentry from '@sentry/nextjs'

/**
 * Garantit qu'une ligne `main.structure_administrative` existe pour la structure employeuse coop
 * `coopId`, à partir du SIRET (identité API Recherche d'entreprises + adresse géocodée BAN). Anti-
 * dérive de l'ADR-002 : appelée à chaque création/réutilisation d'une employeuse pour qu'aucune ligne
 * coop ne reste sans équivalent `main` (prérequis de la bascule des clés étrangères).
 *
 * - Ne fait rien de coûteux si la ligne `main` existe déjà (simple lookup par `structure_coop_id`).
 * - Sans SIRET (seule donnée coop de confiance), ne crée rien.
 * - **Best-effort et non bloquant** : toute erreur (API, géocodage, conflit d'unicité) est avalée —
 *   le chemin d'écriture ne doit JAMAIS échouer à cause de la couverture `main`. La dérive résiduelle
 *   est rattrapée par le job `completer-structures-main`.
 */
export const ensureStructureAdministrativeMain = async ({
  coopId,
  siret,
}: {
  coopId: string
  siret: string | null
}): Promise<{ id: number } | null> => {
  const existing = await prismaClient.structureAdministrativeMain.findFirst({
    where: { structureCoopId: coopId },
    select: { id: true },
  })
  if (existing) return existing

  if (!siret || siret.trim() === '') return null

  try {
    await throttleApiEntreprise()
    const resolved = await resolveIdentiteFromSiret(siret)
    if ('erreur' in resolved) return null

    const { identite } = resolved
    const denominationAntenne = identite.nom.trim() === '' ? null : identite.nom

    // Dédoublonnage par la clé métier `(siret, denomination_antenne)` AVANT de créer : une même
    // employeuse peut déjà exister dans `main` sous un autre `structure_coop_id` (données Entrepôt,
    // ou un autre coop pointant la même identité légale). Sans ce lookup, la création violerait
    // `structure_administrative_siret_antenne_ukey` et l'erreur (avalée) laisserait un emploi sans
    // `main` -> employeuse invisible. On réutilise alors la ligne existante (id partagé).
    const existingByIdentity =
      await prismaClient.structureAdministrativeMain.findFirst({
        where: { siret, denominationAntenne },
        select: { id: true },
      })
    if (existingByIdentity) return existingByIdentity

    const adresse = await resolveAdresseMain(identite)
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
