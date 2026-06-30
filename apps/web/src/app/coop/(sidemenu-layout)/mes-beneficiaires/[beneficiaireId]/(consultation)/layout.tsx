import PrendreRendezVousAvecBeneficiaireButton from '@app/web/app/coop/(full-width-layout)/mon-profil/PrendreRendezVousAvecBeneficiaireButton'
import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import BeneficiaireEnregistrerUneActivite from '@app/web/features/activites/use-cases/cra/components/BeneficiaireEnregistrerUneActivite'
import type { BeneficiaireCraData } from '@app/web/features/activites/use-cases/cra/validation/BeneficiaireCraValidation'
import { consulterBeneficiaire } from '@app/web/features/beneficiaire/abilities/consulter-beneficiaire/implementation'
import BeneficiaireConsultationLayout from '@app/web/features/beneficiaire/abilities/consulter-beneficiaire/ui/components/BeneficiaireConsultationLayout'
import { findDuplicatesForBeneficiaireById } from '@app/web/features/beneficiaire/abilities/detecter-doublons/implementation'
import DeleteBeneficiaireModalContent from '@app/web/features/beneficiaire/abilities/supprimer-beneficiaires/ui/components/DeleteBeneficiaireModalContent'
import { displayNameFromIdentity } from '@app/web/features/beneficiaire/domain/beneficiaire'
import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import RefreshRdvDataOnLoad from '@app/web/features/rdvsp/ui/RefreshRdvDataOnLoad'
import { notFound } from 'next/navigation'
import type { PropsWithChildren } from 'react'

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

  const displayName = displayNameFromIdentity(beneficiaire)
  const beneficiaireCraData = {
    id: beneficiaire.id,
    prenom: beneficiaire.prenom ?? '',
    nom: beneficiaire.nom ?? '',
  } satisfies BeneficiaireCraData

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
          <PrendreRendezVousAvecBeneficiaireButton
            beneficiaire={beneficiaireCraData}
            user={user}
            returnPath={`/coop/mes-beneficiaires/${beneficiaire.id}`}
          />
        </>
      }
      deleteModal={
        <DeleteBeneficiaireModalContent
          beneficiaireId={beneficiaire.id}
          displayName={displayName}
        />
      }
      refreshRdvs={
        hasRdvIntegration &&
        user.rdvAccount &&
        user.rdvAccount.invalidWebhookOrganisationIds.length > 0 ? (
          <RefreshRdvDataOnLoad userId={user.id} syncDataOnLoad={true} />
        ) : undefined
      }
    >
      {children}
    </BeneficiaireConsultationLayout>
  )
}

export default BeneficiaireLayout
