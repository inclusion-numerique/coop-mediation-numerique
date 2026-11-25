import type {
  EstConseillerNumeriqueEnPoste,
  RattacherAUneEmployeuseDepuisSiret,
} from '@/features/employeuse/abilities/rattacher-a-une-employeuse/domain'

export type ResultatDeLImportDepuisProConnect = {
  success: boolean
  noOp: boolean
  reason?: string
}

/**
 * Import de l'employeuse déclarée par ProConnect pour un médiateur NON-CN.
 *
 * ProConnect fait autorité sur l'employeur courant : on résout l'identité depuis le SIRET et on
 * rattache la personne. Le rattachement clôt lui-même les autres affectations coop — un seul
 * employeur actif, celui que ProConnect vient d'affirmer.
 *
 * ADR-002 échange final : plus aucun emploi `coop.employes_structures`. Le modèle main exprime
 * l'employeur courant par `est_active` (pas de fenêtre de dates pour les non-CN), ce qui remplace
 * fidèlement l'ancienne logique de clôture/chevauchement des emplois coop (artefact du modèle daté).
 */
export const importerLaStructureEmployeuseDepuisProConnect =
  ({
    rattacherDepuisSiret,
    estConseillerNumeriqueEnPoste,
  }: {
    readonly rattacherDepuisSiret: RattacherAUneEmployeuseDepuisSiret
    readonly estConseillerNumeriqueEnPoste: EstConseillerNumeriqueEnPoste
  }) =>
  async ({
    userId,
    siret,
  }: {
    userId: string
    siret: string | null | undefined
  }): Promise<ResultatDeLImportDepuisProConnect> => {
    // ProConnect may not provide a SIRET; in that case we intentionally do nothing.
    if (!siret) {
      return {
        success: true,
        noOp: true,
        reason: 'No SIRET provided by ProConnect',
      }
    }

    const conseillerNumerique = await estConseillerNumeriqueEnPoste(userId)

    if (conseillerNumerique === null) {
      return { success: false, noOp: true, reason: 'User not found' }
    }

    // This import logic only applies to non-conseiller users.
    if (conseillerNumerique) {
      return {
        success: true,
        noOp: true,
        reason: 'User is conseiller numerique',
      }
    }

    const rattachement = await rattacherDepuisSiret({
      userId,
      siret,
    })

    // Un SIRET fermé, illisible ou une API muette : on l'expose comme un échec
    // fonctionnel, sans jeter — la connexion ne doit pas en dépendre.
    if (rattachement._tag !== 'rattachee') {
      return {
        success: false,
        noOp: false,
        reason: `Rattachement impossible depuis le SIRET ProConnect (${rattachement._tag})`,
      }
    }

    return { success: true, noOp: false }
  }
