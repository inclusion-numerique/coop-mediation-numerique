'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { enregistrerUnAtelierCollectif } from '@/features/activites/abilities/enregistrer-un-atelier-collectif'
import { ENREGISTRER_UN_ATELIER_COLLECTIF_ERRORS } from '@/features/activites/abilities/enregistrer-un-atelier-collectif/action/enregistrer-un-atelier-collectif.errors'
import { EnregistrerUnAtelierCollectifValidation } from '@/features/activites/abilities/enregistrer-un-atelier-collectif/action/enregistrer-un-atelier-collectif.validation'
import { MediateurId, UtilisateurId } from '@/features/activites/domain'
import {
  employeuseDeLaDateDepuis,
  tagsUtilisablesDepuis,
} from '@/features/activites/implementations/fournisseurs-de-la-saisie'
import { profilDeLaSession, withAuth } from '@/features/authentification'
import { consulterEmployeuseAUneDate } from '@/features/employeuse/server'
import { lieuUtilisablePar } from '@/features/lieux-activite/abilities/verifier-un-lieu-d-activite'
import { withMaintenance } from '@/features/maintenance-mode'
import { rendezVousHonorePar } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/implementations/rendez-vous-honore-par'
import { tagsVisiblesPar } from '@/features/tags/abilities/lire-les-tags-visibles'
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
