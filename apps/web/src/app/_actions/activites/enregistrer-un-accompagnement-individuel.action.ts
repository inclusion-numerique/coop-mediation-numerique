'use server'

import { enregistrerUnAccompagnementIndividuel } from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel'
import { ENREGISTRER_UN_ACCOMPAGNEMENT_INDIVIDUEL_ERRORS } from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel/action/enregistrer-un-accompagnement-individuel.errors'
import { EnregistrerUnAccompagnementIndividuelValidation } from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel/action/enregistrer-un-accompagnement-individuel.validation'
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

export const enregistrerUnAccompagnementIndividuelAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(EnregistrerUnAccompagnementIndividuelValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        enregistrerUnAccompagnementIndividuel({
          saisie: input,
          mediateurId:
            user.mediateur == null ? null : MediateurId(user.mediateur.id),
          auteurId: UtilisateurId(user.id),
          employeuseDeLaDate: employeuseDeLaDatePour(user),
          lieuUtilisable: lieuUtilisablePar(user),
          tagsUtilisables: tagsUtilisablesPar(user),
          marquerLeRendezVousHonore: marquerLeRendezVousHonorePar(user),
        }),
      { onError: ENREGISTRER_UN_ACCOMPAGNEMENT_INDIVIDUEL_ERRORS },
    ),
  )
