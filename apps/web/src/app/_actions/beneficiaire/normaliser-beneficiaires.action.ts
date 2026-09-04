'use server'

import { withAdmin, withAuth } from '@app/web/features/authentification'
import { normaliserBeneficiaires } from '@app/web/features/beneficiaire/abilities/normaliser-beneficiaires/implementation'
import { actionBuilder } from '@app/web/libraries/nextjs'

/**
 * L'outil d'administration appelle l'ability directement.
 *
 * Il passait par un job, dont c'était le seul emploi : la re-canonicalisation a
 * été jouée en prod le 07/07/2026 et n'a plus de raison d'être planifiée. Ce qui
 * reste utile est le bouton, pour rattraper au cas par cas.
 */
export const normaliserBeneficiairesAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  // L'ability est dry-run par défaut : l'action admin applique réellement.
  .execute(async () => normaliserBeneficiaires({ dryRun: false }))
