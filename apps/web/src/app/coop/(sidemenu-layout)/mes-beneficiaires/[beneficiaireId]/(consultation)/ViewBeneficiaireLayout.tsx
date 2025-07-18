import PrendreRendezVousAvecBeneficiaireButton from '@app/web/app/coop/(full-width-layout)/mon-profil/PrendreRendezVousAvecBeneficiaireButton'
import BeneficiaireEnregistrerUneActivite from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/BeneficiaireEnregistrerUneActivite'
import DeleteBeneficiaireModalContent from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/DeleteBeneficiaireModalContent'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { SessionUser } from '@app/web/auth/sessionUser'
import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import BackButton from '@app/web/components/BackButton'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import type { BeneficiaireCraData } from '@app/web/features/beneficiaires/validation/BeneficiaireValidation'
import { hasFeatureFlag } from '@app/web/security/hasFeatureFlag'
import { contentId } from '@app/web/utils/skipLinks'
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
  const { anneeNaissance, id: beneficiaireId, nom, prenom } = beneficiaire

  const beneficiaireCraData = {
    id: beneficiaireId,
    prenom: prenom ?? '',
    nom: nom ?? '',
  } satisfies BeneficiaireCraData

  const canPrendreRendezVous =
    !!user && hasFeatureFlag(user, 'RdvServicePublic')

  const hasRdvIntegration =
    canPrendreRendezVous && user.rdvAccount?.hasOauthTokens

  return (
    <CoopPageContainer size={49}>
      <SkipLinksPortal />
      <CoopBreadcrumbs
        parents={[
          {
            label: 'Mes bénéficiaires',
            linkProps: { href: '/coop/mes-beneficiaires' },
          },
        ]}
        currentPage={displayName}
      />
      <main id={contentId}>
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
            <h1 className="fr-text-title--blue-france fr-h2 fr-mb-0">
              {displayName}
            </h1>
            {!!anneeNaissance && (
              <p className="fr-text--sm fr-text-mention--grey fr-mb-0 fr-mt-1v">
                Année de naissance&nbsp;: {anneeNaissance}
              </p>
            )}
          </div>
          {!hasRdvIntegration && (
            <div className="fr-flex fr-flex-gap-4v fr-flex-nowrap fr-flex-shrink-0">
              <BeneficiaireEnregistrerUneActivite
                beneficiaire={beneficiaireCraData}
                displayName={displayName}
              />
            </div>
          )}
        </div>
        {hasRdvIntegration && (
          <div className="fr-border--top fr-border--bottom fr-py-4v fr-width-full fr-my-6v ">
            <div className="fr-flex fr-flex-gap-4v fr-flex-nowrap fr-flex-shrink-0">
              <BeneficiaireEnregistrerUneActivite
                beneficiaire={beneficiaireCraData}
                displayName={displayName}
                size="small"
                label="Enregistrer un accompagnement individuel"
              />
              <PrendreRendezVousAvecBeneficiaireButton
                beneficiaire={beneficiaireCraData}
                user={user}
                returnPath={`/coop/mes-beneficiaires/${beneficiaire.id}`}
              />
            </div>
          </div>
        )}
        {children}
        <DeleteBeneficiaireModalContent
          beneficiaireId={beneficiaire.id}
          displayName={displayName}
        />
      </main>
    </CoopPageContainer>
  )
}

export default ViewBeneficiaireLayout
