'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { enregistrerUnAccompagnementIndividuel } from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel'
import { ENREGISTRER_UN_ACCOMPAGNEMENT_INDIVIDUEL_ERRORS } from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/action/enregistrer-un-accompagnement-individuel.errors'
import { EnregistrerUnAccompagnementIndividuelValidation } from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/action/enregistrer-un-accompagnement-individuel.validation'
import { MediateurId, UtilisateurId } from '@/features/activites/domain'
import {
  employeuseDeLaDateDepuis,
  tagsUtilisablesDepuis,
} from '@/features/activites/implementations/fournisseurs-de-la-saisie'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { consulterEmployeuseAUneDate } from '@/features/employeuse/abilities/consulter-employeuse-a-une-date/implementations'
import { lieuUtilisablePar } from '@/features/lieux-activite/abilities/verifier-un-lieu-d-activite'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { rendezVousHonorePar } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/implementations/rendez-vous-honore-par'
import { tagsVisiblesPar } from '@/features/tags/abilities/lire-les-tags-visibles'
import { acteurDe } from '@/features/tags/domain'
import { fromResult, withInput } from '@/libraries/nextjs'

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
          tagsUtilisables: tagsUtilisablesDepuis(
            tagsVisiblesPar(acteurDe(profilDeLaSession(user))),
          ),
          marquerLeRendezVousHonore: rendezVousHonorePar(user.id),
        }),
      { onError: ENREGISTRER_UN_ACCOMPAGNEMENT_INDIVIDUEL_ERRORS },
    ),
  )
