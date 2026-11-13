'use server'

import { enregistrerUnAtelierCollectif } from '@app/web/features/activites/abilities/enregistrer-un-atelier-collectif'
import { ENREGISTRER_UN_ATELIER_COLLECTIF_ERRORS } from '@app/web/features/activites/abilities/enregistrer-un-atelier-collectif/action/enregistrer-un-atelier-collectif.errors'
import { EnregistrerUnAtelierCollectifValidation } from '@app/web/features/activites/abilities/enregistrer-un-atelier-collectif/action/enregistrer-un-atelier-collectif.validation'
import { MediateurId, UtilisateurId } from '@app/web/features/activites/domain'
import {
  employeuseDeLaDateDepuis,
  tagsUtilisablesDepuis,
} from '@app/web/features/activites/implementation/fournisseurs-de-la-saisie'
import { withAuth } from '@app/web/features/authentification'
import { consulterEmployeuseAUneDate } from '@app/web/features/employeuse/server'
import { lieuUtilisablePar } from '@app/web/features/lieux-activite/abilities/verifier-un-lieu-d-activite'
import { withMaintenance } from '@app/web/features/maintenance-mode'
import { rendezVousHonorePar } from '@app/web/features/rdvsp/abilities/mettre-a-jour-statut-rdv/implementation/rendez-vous-honore-par'
import { tagsVisiblesPar } from '@app/web/features/tags/abilities/lire-les-tags-visibles'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const enregistrerUnAtelierCollectifAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(EnregistrerUnAtelierCollectifValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        enregistrerUnAtelierCollectif({
          saisie: input,
          mediateurId:
            user.mediateur == null ? null : MediateurId(user.mediateur.id),
          auteurId: UtilisateurId(user.id),
          employeuseDeLaDate: employeuseDeLaDateDepuis((date) =>
            consulterEmployeuseAUneDate({ userId: user.id, date }),
          ),
          lieuUtilisable: lieuUtilisablePar(user.mediateur?.id ?? null),
          tagsUtilisables: tagsUtilisablesDepuis(tagsVisiblesPar(user)),
          marquerLeRendezVousHonore: rendezVousHonorePar(user.id),
        }),
      { onError: ENREGISTRER_UN_ATELIER_COLLECTIF_ERRORS },
    ),
  )
