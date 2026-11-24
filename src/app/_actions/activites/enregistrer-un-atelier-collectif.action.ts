'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { ENREGISTRER_UN_ATELIER_COLLECTIF_ERRORS } from '@/features/activites/abilities/enregistrer-un-atelier-collectif/action/enregistrer-un-atelier-collectif.errors'
import { EnregistrerUnAtelierCollectifValidation } from '@/features/activites/abilities/enregistrer-un-atelier-collectif/action/enregistrer-un-atelier-collectif.validation'
import { enregistrerUnAtelierCollectif } from '@/features/activites/abilities/enregistrer-un-atelier-collectif/implementations/prisma/enregistrer-un-atelier-collectif.mutation'
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
import { rendezVousHonorePar } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/implementations/rendez-vous-honore-par.binding'
import { tagsVisiblesPar } from '@/features/tags/abilities/lire-les-tags-visibles/implementations/session/tags-visibles-par.query'
import { acteurDe } from '@/features/tags/domain'
import { fromResult, withInput } from '@/libraries/nextjs'

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
          tagsUtilisables: tagsUtilisablesDepuis(
            tagsVisiblesPar(acteurDe(profilDeLaSession(user))),
          ),
          marquerLeRendezVousHonore: rendezVousHonorePar(user.id),
        }),
      { onError: ENREGISTRER_UN_ATELIER_COLLECTIF_ERRORS },
    ),
  )
