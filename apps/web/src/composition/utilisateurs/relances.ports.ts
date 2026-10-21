import { removeBrevoUserContact } from '@app/web/external-apis/brevo/removeBrevoUserContact'
import {
  effacerLInscription,
  type RelancerLesInscriptionsInacheveesPorts,
  relancerLesInscriptionsInachevees,
  sendAccountDeletedEmail,
  sendDeletionWarningEmail,
  sendFinishYourSignupEmail,
} from '@app/web/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees'
import {
  type RelancerLesInscritsInactifsPorts,
  relancerLesInscritsInactifs,
  sendGettingStartedEmail,
  sendNouveauAccountDeletedEmail,
  sendNouveauAccountDeletionWarningEmail,
  sendNouveauAccountEmail,
} from '@app/web/features/utilisateurs/abilities/relancer-les-inscrits-inactifs'
import {
  RetentionPolicy,
  supprimerCompte,
} from '@app/web/features/utilisateurs/abilities/supprimer-compte'
import { compterLesInscrits } from '@app/web/features/utilisateurs/db/compter-les-inscrits.query'
import { success } from '@app/web/libraries/result'
import { supprimerComptePorts } from './supprimer-compte.ports'

const dateFrancaise = (date: Date): string => date.toLocaleDateString('fr-FR')

export const relancesDInscriptionPorts = (
  totalInscrits: number,
): RelancerLesInscriptionsInacheveesPorts => ({
  envoyerLaRelance: ({ courriel, prenom }, palier) =>
    sendFinishYourSignupEmail({
      email: courriel,
      firstname: prenom,
      totalUsers: totalInscrits,
      matomoCampaignId: `finaliser_inscription_j${palier}`,
    }),
  envoyerLAvertissement: ({ courriel, prenom }, echeance) =>
    sendDeletionWarningEmail({
      email: courriel,
      firstname: prenom,
      deletionDate: dateFrancaise(echeance.suppressionLe),
      daysRemaining: echeance.joursRestants,
      matomoCampaignId: 'finaliser_inscription_j90',
    }),
  envoyerLAvisDEffacement: ({ courriel, prenom }) =>
    sendAccountDeletedEmail({ email: courriel, firstname: prenom }),
  effacerLInscription,
  retirerDesListes: async (courriel) => {
    await removeBrevoUserContact(courriel)
  },
})

export const relancesDesInscritsPorts = (
  totalInscrits: number,
  maintenant: Date,
): RelancerLesInscritsInactifsPorts => ({
  envoyerLaRelance: (destinataire, palier) =>
    palier === 7
      ? sendGettingStartedEmail({
          email: destinataire.courriel,
          firstname: destinataire.prenom,
          matomoCampaignId: 'nouveau_j7',
          isMediateur: destinataire.estMediateur,
          isCoordinateur: destinataire.estCoordinateur,
        })
      : sendNouveauAccountEmail({
          email: destinataire.courriel,
          firstname: destinataire.prenom,
          totalUsers: totalInscrits,
          matomoCampaignId: `nouveau_j${palier}`,
          isMediateur: destinataire.estMediateur,
          isCoordinateur: destinataire.estCoordinateur,
          monthsCount: palier === 30 ? 1 : 2,
        }),
  envoyerLAvertissement: (destinataire, echeance) =>
    sendNouveauAccountDeletionWarningEmail({
      email: destinataire.courriel,
      firstname: destinataire.prenom,
      deletionDate: dateFrancaise(echeance.suppressionLe),
      daysRemaining: echeance.joursRestants,
      matomoCampaignId: 'nouveau_j90',
      isMediateur: destinataire.estMediateur,
      isCoordinateur: destinataire.estCoordinateur,
    }),
  envoyerLAvisDEffacement: (destinataire) =>
    sendNouveauAccountDeletedEmail({
      email: destinataire.courriel,
      isMediateur: destinataire.estMediateur,
    }),
  supprimerLeCompte: async (utilisateurId) => {
    const resultat = await supprimerCompte({
      command: {
        cible: utilisateurId,
        auteur: {
          _tag: 'systeme',
          policy: RetentionPolicy('InscritJamaisActif'),
        },
        maintenant,
      },
      ports: supprimerComptePorts,
    })
    return resultat.success ? success(undefined) : resultat
  },
})

export const lancerLesRelancesDInscription = async (maintenant: Date) =>
  relancerLesInscriptionsInachevees({
    maintenant,
    ports: relancesDInscriptionPorts(await compterLesInscrits()),
  })

export const lancerLesRelancesDesInscrits = async (maintenant: Date) =>
  relancerLesInscritsInactifs({
    maintenant,
    ports: relancesDesInscritsPorts(await compterLesInscrits(), maintenant),
  })
