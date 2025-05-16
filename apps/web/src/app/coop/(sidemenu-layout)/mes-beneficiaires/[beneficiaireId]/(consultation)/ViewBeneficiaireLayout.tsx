import PrendreRendezVousAvecBeneficiaireButton from '@app/web/app/coop/(full-width-layout)/mon-profil/PrendreRendezVousAvecBeneficiaireButton'
import BeneficiaireAjouterUneActivite from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/BeneficiaireAjouterUneActivite'
import { DeleteBeneficiaireModal } from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/DeleteBeneficiaireModal'
import DeleteBeneficiaireModalContent from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/DeleteBeneficiaireModalContent'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { SessionUser } from '@app/web/auth/sessionUser'
import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import BackButton from '@app/web/components/BackButton'
import type { BeneficiaireCraData } from '@app/web/features/beneficiaires/validation/BeneficiaireValidation'
import { hasFeatureFlag } from '@app/web/security/hasFeatureFlag'
import Button from '@codegouvfr/react-dsfr/Button'
import type { Beneficiaire } from '@prisma/client'
import classNames from 'classnames'
import type { PropsWithChildren } from 'react'

const ViewBeneficiaireLayout = ({
  beneficiaire,
  user,
  children,
}: PropsWithChildren<{
  user: SessionUser
  beneficiaire: Pick<
    Beneficiaire,
    'id' | 'prenom' | 'nom' | 'anneeNaissance' | 'mediateurId'
  >
}>) => {
  const displayName = getBeneficiaireDisplayName(beneficiaire)
  const {
    anneeNaissance,
    id: beneficiaireId,
    nom,
    prenom,
    mediateurId,
  } = beneficiaire

  const beneficiaireCraData = {
    id: beneficiaireId,
    prenom,
    nom,
    mediateurId,
  } satisfies BeneficiaireCraData

  const canPrendreRendezVous =
    !!user && hasFeatureFlag(user, 'RdvServicePublic')

  return (
    <CoopPageContainer size={794}>
      <CoopBreadcrumbs
        parents={[
          {
            label: 'Mes bénéficiaires',
            linkProps: { href: '/coop/mes-beneficiaires' },
          },
        ]}
        currentPage={displayName}
      />
      <BackButton href="/coop/mes-beneficiaires">
        Retour à mes bénéficiaires
      </BackButton>
      <div
        className={classNames(
          'fr-width-full fr-flex fr-justify-content-space-between fr-align-items-center fr-flex-gap-8v',
          canPrendreRendezVous ? 'fr-mb-2v' : 'fr-mb-4v',
        )}
      >
        <div>
          <h1 className="fr-text-title--blue-france fr-mb-0">{displayName}</h1>
          {!!anneeNaissance && (
            <p className="fr-mb-0 fr-mt-2v">
              Année de naissance&nbsp;: {anneeNaissance}
            </p>
          )}
        </div>
        <div className="fr-flex fr-flex-gap-4v fr-flex-nowrap fr-flex-shrink-0">
          <BeneficiaireAjouterUneActivite
            beneficiaire={beneficiaireCraData}
            displayName={displayName}
          />
          <Button
            iconId="fr-icon-edit-line"
            priority="secondary"
            title="Modifier"
            linkProps={{
              href: `/coop/mes-beneficiaires/${beneficiaire.id}/modifier`,
            }}
          />
          <Button
            iconId="fr-icon-delete-bin-line"
            priority="secondary"
            title="Supprimer"
            type="button"
            {...DeleteBeneficiaireModal.buttonProps}
          />
        </div>
      </div>
      {canPrendreRendezVous && (
        <div className="fr-width-full fr-flex  fr-justify-content-end fr-mb-2v ">
          <PrendreRendezVousAvecBeneficiaireButton
            beneficiaire={{ id: beneficiaire.id }}
            user={user}
            returnPath={`/coop/mes-beneficiaires/${beneficiaire.id}`}
          />
        </div>
      )}
      {children}
      <DeleteBeneficiaireModalContent
        beneficiaireId={beneficiaire.id}
        displayName={displayName}
      />
    </CoopPageContainer>
  )
}

export default ViewBeneficiaireLayout
