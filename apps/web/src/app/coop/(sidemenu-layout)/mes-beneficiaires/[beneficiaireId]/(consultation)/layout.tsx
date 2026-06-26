import PrendreRendezVousAvecBeneficiaireButton from '@app/web/app/coop/(full-width-layout)/mon-profil/PrendreRendezVousAvecBeneficiaireButton'
import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import BeneficiaireEnregistrerUneActivite from '@app/web/features/activites/use-cases/cra/components/BeneficiaireEnregistrerUneActivite'
import type { BeneficiaireCraData } from '@app/web/features/activites/use-cases/cra/validation/BeneficiaireCraValidation'
import BeneficiaireConsultationLayout from '@app/web/features/beneficiaire/abilities/consulter-beneficiaire/ui/components/BeneficiaireConsultationLayout'
import { findDuplicatesForBeneficiaire } from '@app/web/features/beneficiaire/abilities/detecter-doublons/implementation'
import DeleteBeneficiaireModalContent from '@app/web/features/beneficiaire/abilities/supprimer-beneficiaires/ui/components/DeleteBeneficiaireModalContent'
import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { Email } from '@app/web/features/beneficiaire/domain/email'
import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import { Nom } from '@app/web/features/beneficiaire/domain/nom'
import { Prenom } from '@app/web/features/beneficiaire/domain/prenom'
import { Telephone } from '@app/web/features/beneficiaire/domain/telephone'
import RefreshRdvDataOnLoad from '@app/web/features/rdvsp/ui/RefreshRdvDataOnLoad'
import { prismaClient } from '@app/web/prismaClient'
import { notFound } from 'next/navigation'
import type { PropsWithChildren } from 'react'

// Route hub : lit le bénéficiaire et ses doublons (ability detecter-doublons),
// puis compose les concerns croisés (activité, RDV, suppression, refresh) qu'elle
// injecte au shell de consultation via des slots.
const BeneficiaireLayout = async (
  props: PropsWithChildren<{
    params: Promise<{ beneficiaireId: string }>
  }>,
) => {
  const { beneficiaireId } = await props.params
  const { children } = props

  const user = await authenticateMediateur()

  const beneficiaire = await prismaClient.beneficiaire.findUnique({
    where: {
      id: beneficiaireId,
      mediateurId: user.mediateur.id,
      suppression: null,
    },
    select: {
      id: true,
      prenom: true,
      nom: true,
      email: true,
      anneeNaissance: true,
      mediateurId: true,
      rdvUserId: true,
      telephone: true,
    },
  })

  if (!beneficiaire) {
    notFound()
  }

  const duplicates = await findDuplicatesForBeneficiaire({
    beneficiaire: {
      id: BeneficiaireId(beneficiaire.id),
      mediateurId: MediateurId(beneficiaire.mediateurId),
      nom: beneficiaire.nom ? Nom(beneficiaire.nom) : null,
      prenom: beneficiaire.prenom ? Prenom(beneficiaire.prenom) : null,
      telephone: beneficiaire.telephone
        ? Telephone(beneficiaire.telephone)
        : null,
      email: beneficiaire.email ? Email(beneficiaire.email) : null,
    },
    withConflictingFields: 'include',
    fuzzyMatching: true,
  })

  const displayName = getBeneficiaireDisplayName(beneficiaire)
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
