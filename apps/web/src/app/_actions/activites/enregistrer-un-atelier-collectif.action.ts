'use server'

import { enregistrerUnAtelierCollectif } from '@app/web/features/activites/abilities/enregistrer-un-atelier-collectif'
import { ENREGISTRER_UN_ATELIER_COLLECTIF_ERRORS } from '@app/web/features/activites/abilities/enregistrer-un-atelier-collectif/action/enregistrer-un-atelier-collectif.errors'
import { EnregistrerUnAtelierCollectifValidation } from '@app/web/features/activites/abilities/enregistrer-un-atelier-collectif/action/enregistrer-un-atelier-collectif.validation'
import { MediateurId, UtilisateurId } from '@app/web/features/activites/domain'
import { withAuth } from '@app/web/features/authentification'
import { withMaintenance } from '@app/web/features/maintenance-mode'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'
import {
  employeuseDeLaDatePour,
  lieuUtilisablePar,
  marquerLeRendezVousHonorePar,
  tagsUtilisablesPar,
} from './ports-de-la-saisie'

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
          employeuseDeLaDate: employeuseDeLaDatePour(user),
          lieuUtilisable: lieuUtilisablePar(user),
          tagsUtilisables: tagsUtilisablesPar(user),
          marquerLeRendezVousHonore: marquerLeRendezVousHonorePar(user),
        }),
      { onError: ENREGISTRER_UN_ATELIER_COLLECTIF_ERRORS },
    ),
  )
