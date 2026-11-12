'use server'

import { enregistrerUnAccompagnementIndividuel } from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel'
import { ENREGISTRER_UN_ACCOMPAGNEMENT_INDIVIDUEL_ERRORS } from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel/action/enregistrer-un-accompagnement-individuel.errors'
import { EnregistrerUnAccompagnementIndividuelValidation } from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel/action/enregistrer-un-accompagnement-individuel.validation'
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
          employeuseDeLaDate: employeuseDeLaDateDepuis((date) =>
            consulterEmployeuseAUneDate({ userId: user.id, date }),
          ),
          lieuUtilisable: lieuUtilisablePar(user.mediateur?.id ?? null),
          tagsUtilisables: tagsUtilisablesDepuis(tagsVisiblesPar(user)),
          marquerLeRendezVousHonore: rendezVousHonorePar(user.id),
        }),
      { onError: ENREGISTRER_UN_ACCOMPAGNEMENT_INDIVIDUEL_ERRORS },
    ),
  )
