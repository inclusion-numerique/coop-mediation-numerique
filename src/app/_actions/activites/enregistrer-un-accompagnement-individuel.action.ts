'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { signaler } from '@/configuration/telemetry/serveur'
import { ENREGISTRER_UN_ACCOMPAGNEMENT_INDIVIDUEL_ERRORS } from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/action/enregistrer-un-accompagnement-individuel.errors'
import { accompagnementEnregistre } from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/action/enregistrer-un-accompagnement-individuel.transfer'
import { EnregistrerUnAccompagnementIndividuelValidation } from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/action/enregistrer-un-accompagnement-individuel.validation'
import { enregistrerUnAccompagnementIndividuel } from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/domain/enregistrer-un-accompagnement-individuel'
import { beneficiaireDuMediateur } from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/implementations/prisma/beneficiaire-du-mediateur.query'
import { MediateurId, UtilisateurId } from '@/features/activites/domain'
import {
  creerLActiviteDeMediation,
  modifierLActiviteDeMediation,
} from '@/features/activites/implementations/prisma/activite-de-mediation.mutation'
import {
  employeuseDeLaDateDepuis,
  tagsUtilisablesDepuis,
} from '@/features/activites/implementations/prisma/fournisseurs-de-la-saisie.transfer'
import {
  activiteDeMediationDuMediateur,
  nouvelIdentifiantDActivite,
  rendezVousDejaSaisi,
  rendezVousDUnAutreMediateur,
} from '@/features/activites/implementations/prisma/saisie-de-mediation.query'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { consulterEmployeuseAUneDate } from '@/features/employeuse/abilities/consulter-employeuse-a-une-date/implementations/prisma/consulter-employeuse-a-une-date.query'
import { lieuUtilisablePar } from '@/features/lieux-activite/abilities/verifier-un-lieu-d-activite/implementations/prisma/lieu-utilisable-par.where'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { mettreAJourStatutRdv } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/domain/mettre-a-jour-statut-rdv'
import { contexteMiseAJourStatut } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/implementations/prisma/contexte-mise-a-jour-statut.query'
import { enregistrerStatutRdv } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/implementations/prisma/enregistrer-statut-rdv.mutation'
import { RdvId } from '@/features/rdvsp/domain/identifiants/rdv-id'
import { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import { StatutPresenceModifiable } from '@/features/rdvsp/domain/rdv/statut-presence'
import { rdvServicePublicApi } from '@/features/rdvsp/implementations/api/rdv-service-public.client'
import { configurationRdvServicePublic } from '@/features/rdvsp/implementations/api/rdv-service-public-configuration.client'
import { enregistrerLesJetons } from '@/features/rdvsp/implementations/prisma/jetons-du-compte.mutation'
import { jetonsCourants } from '@/features/rdvsp/implementations/prisma/jetons-du-compte.query'
import { tagsVisiblesPar } from '@/features/tags/abilities/lire-les-tags-visibles/implementations/prisma/tags-visibles-par.query'
import { acteurDe } from '@/features/tags/implementations/session/acteur.transfer'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

const mettreAJourLeStatutDuRdv = mettreAJourStatutRdv({
  contexte: contexteMiseAJourStatut,
  changerStatutRdv: rdvServicePublicApi({
    ...configurationRdvServicePublic(),
    onJetonsRenouveles: enregistrerLesJetons,
    jetonsCourants,
  }).changerStatutRdv,
  enregistrer: enregistrerStatutRdv,
})

const marquerLeRendezVousHonore =
  (utilisateurId: UtilisateurCoopId) =>
  async (rdvId: number): Promise<void> => {
    try {
      const marquage = await mettreAJourLeStatutDuRdv({
        utilisateurId,
        rdvId: RdvId(rdvId),
        statut: StatutPresenceModifiable('seen'),
      })

      if (!marquage.success)
        signaler(
          new Error(
            `Statut du rendez-vous ${rdvId} non mis à jour (${marquage.error._tag})`,
          ),
        )
    } catch (erreur) {
      signaler(erreur)
    }
  }

export const enregistrerUnAccompagnementIndividuelAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(EnregistrerUnAccompagnementIndividuelValidation))
  .execute(
    fromResult(
      async ({ user, input }) => {
        const enregistre = await enregistrerUnAccompagnementIndividuel({
          activiteDuMediateur: activiteDeMediationDuMediateur,
          nouvelIdentifiant: nouvelIdentifiantDActivite,
          beneficiaireDuMediateur,
          employeuseDeLaDate: employeuseDeLaDateDepuis((date) =>
            consulterEmployeuseAUneDate({ userId: user.id, date }),
          ),
          lieuUtilisable: lieuUtilisablePar(user.mediateur?.id ?? null),
          tagsUtilisables: tagsUtilisablesDepuis(
            tagsVisiblesPar(acteurDe(profilDeLaSession(user))),
          ),
          rendezVousDUnAutreMediateur,
          rendezVousDejaSaisi,
          creer: creerLActiviteDeMediation(UtilisateurId(user.id)),
          modifier: modifierLActiviteDeMediation(UtilisateurId(user.id)),
          marquerLeRendezVousHonore: marquerLeRendezVousHonore(
            UtilisateurCoopId(user.id),
          ),
        })({
          saisie: input,
          mediateurId:
            user.mediateur == null ? null : MediateurId(user.mediateur.id),
          maintenant: new Date(),
        })
        return enregistre.success
          ? success(accompagnementEnregistre(enregistre.data))
          : enregistre
      },
      { onError: ENREGISTRER_UN_ACCOMPAGNEMENT_INDIVIDUEL_ERRORS },
    ),
  )
