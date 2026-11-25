'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { signaler } from '@/configuration/telemetry/serveur'
import { ENREGISTRER_UN_ACCOMPAGNEMENT_INDIVIDUEL_ERRORS } from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/action/enregistrer-un-accompagnement-individuel.errors'
import { EnregistrerUnAccompagnementIndividuelValidation } from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/action/enregistrer-un-accompagnement-individuel.validation'
import { enregistrerUnAccompagnementIndividuel } from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/implementations/prisma/enregistrer-un-accompagnement-individuel.mutation'
import { MediateurId, UtilisateurId } from '@/features/activites/domain'
import {
  employeuseDeLaDateDepuis,
  tagsUtilisablesDepuis,
} from '@/features/activites/domain/fournisseurs-de-la-saisie'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { consulterEmployeuseAUneDate } from '@/features/employeuse/abilities/consulter-employeuse-a-une-date/implementations/prisma/consulter-employeuse-a-une-date.query'
import { lieuUtilisablePar } from '@/features/lieux-activite/abilities/verifier-un-lieu-d-activite/implementations/prisma/lieu-utilisable-par.where'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { marquerLeRendezVousHonore } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/domain/marquer-le-rendez-vous-honore'
import { mettreAJourStatutRdvBinding } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/implementations/mettre-a-jour-statut-rdv.binding'
import { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import { tagsVisiblesPar } from '@/features/tags/abilities/lire-les-tags-visibles/implementations/session/tags-visibles-par.query'
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
          marquerLeRendezVousHonore: marquerLeRendezVousHonore({
            mettreAJour: mettreAJourStatutRdvBinding,
            signaler,
          })(UtilisateurCoopId(user.id)),
        }),
      { onError: ENREGISTRER_UN_ACCOMPAGNEMENT_INDIVIDUEL_ERRORS },
    ),
  )
