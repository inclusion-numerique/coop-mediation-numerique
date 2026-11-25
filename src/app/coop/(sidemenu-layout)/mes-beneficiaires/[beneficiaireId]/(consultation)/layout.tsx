import { notFound } from 'next/navigation'
import type { PropsWithChildren } from 'react'
import { supprimerBeneficiairesAction } from '@/app/_actions/beneficiaire/supprimer-beneficiaires.action'
import { prendreRendezVousAction } from '@/app/_actions/rdvsp/prendre-rendez-vous.action'
import { rattraperRdvsSansWebhookAction } from '@/app/_actions/rdvsp/rattraper-rdvs-sans-webhook.action'
import BeneficiaireEnregistrerUneActivite from '@/features/activites/ui/slots/BeneficiaireEnregistrerUneActivite.slot'
import { authenticateMediateur } from '@/features/authentification/implementations/session/authenticate-user.middleware'
import { consulterBeneficiaire } from '@/features/beneficiaire/abilities/consulter-beneficiaire/implementations/prisma/consulter-beneficiaire.query'
import BeneficiaireConsultationLayout from '@/features/beneficiaire/abilities/consulter-beneficiaire/ui/layouts/BeneficiaireConsultationLayout'
import { findDuplicatesForBeneficiaireById } from '@/features/beneficiaire/abilities/detecter-doublons/implementations/prisma/index'
import { SUPPRIMER_BENEFICIAIRES_ACTION_KEY } from '@/features/beneficiaire/abilities/supprimer-beneficiaires/action/supprimer-beneficiaires.key'
import DeleteBeneficiaireModalContent from '@/features/beneficiaire/abilities/supprimer-beneficiaires/ui/slots/DeleteBeneficiaireModalContent.slot'
import { nomAfficheDepuisLIdentite } from '@/features/beneficiaire/domain/beneficiaire'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { PRENDRE_RENDEZ_VOUS_ACTION_KEY } from '@/features/rdvsp/abilities/prendre-rendez-vous/action/prendre-rendez-vous.key'
import PrendreRendezVousAvecBeneficiaireButton from '@/features/rdvsp/abilities/prendre-rendez-vous/ui/slots/PrendreRendezVousAvecBeneficiaireButton.slot'
import { RATTRAPER_RDVS_SANS_WEBHOOK_ACTION_KEY } from '@/features/rdvsp/action/rattraper-rdvs-sans-webhook.key'
import RefreshRdvDataOnLoad from '@/features/rdvsp/ui/slots/RefreshRdvDataOnLoad.slot'
import { ClientBinder } from '@/libraries/nextjs/injection'

// Route hub : lit le bénéficiaire (ability consulter-beneficiaire) et ses doublons
// (ability detecter-doublons), puis compose les concerns croisés (activité, RDV,
// suppression, refresh) qu'elle injecte au shell de consultation via des slots.
const BeneficiaireLayout = async (
  props: PropsWithChildren<{
    params: Promise<{ beneficiaireId: string }>
  }>,
) => {
  const { beneficiaireId } = await props.params
  const { children } = props

  const user = await authenticateMediateur()

  const mediateurId = MediateurId(user.mediateur.id)
  const beneficiaire = await consulterBeneficiaire({
    beneficiaireId: BeneficiaireId(beneficiaireId),
    mediateurId,
  })

  if (!beneficiaire) {
    notFound()
  }

  const duplicates = await findDuplicatesForBeneficiaireById({
    beneficiaireId: BeneficiaireId(beneficiaire.id),
    mediateurId,
  })

  const displayName = nomAfficheDepuisLIdentite(beneficiaire)
  const beneficiaireCraData = {
    id: beneficiaire.id,
    prenom: beneficiaire.prenom ?? '',
    nom: beneficiaire.nom ?? '',
  }

  const hasRdvIntegration = !!user.rdvAccount?.hasOauthTokens

  return (
    <BeneficiaireConsultationLayout
      beneficiaire={beneficiaire}
      hasDuplicates={duplicates.length > 0}
      hasRdvIntegration={hasRdvIntegration}
      primaryActions={
        <BeneficiaireEnregistrerUneActivite
          beneficiaire={beneficiaireCraData}
        />
      }
      rdvActions={
        <>
          <BeneficiaireEnregistrerUneActivite
            beneficiaire={beneficiaireCraData}
            size="small"
            label="Enregistrer un accompagnement individuel"
          />
          <ClientBinder
            bind={PRENDRE_RENDEZ_VOUS_ACTION_KEY}
            to={prendreRendezVousAction}
          >
            <PrendreRendezVousAvecBeneficiaireButton
              beneficiaire={beneficiaireCraData}
              user={user}
            />
          </ClientBinder>
        </>
      }
      deleteModal={
        <ClientBinder
          bind={SUPPRIMER_BENEFICIAIRES_ACTION_KEY}
          to={supprimerBeneficiairesAction}
        >
          <DeleteBeneficiaireModalContent
            beneficiaireId={beneficiaire.id}
            displayName={displayName}
          />
        </ClientBinder>
      }
      refreshRdvs={
        hasRdvIntegration &&
        user.rdvAccount &&
        user.rdvAccount.invalidWebhookOrganisationIds.length > 0 ? (
          <ClientBinder
            bind={RATTRAPER_RDVS_SANS_WEBHOOK_ACTION_KEY}
            to={rattraperRdvsSansWebhookAction}
          >
            <RefreshRdvDataOnLoad synchroniserAuChargement />
          </ClientBinder>
        ) : undefined
      }
    >
      {children}
    </BeneficiaireConsultationLayout>
  )
}

export default BeneficiaireLayout
