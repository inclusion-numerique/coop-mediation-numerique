import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import BackButton from '@app/web/components/BackButton'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { displayNameFromIdentity } from '@app/web/features/beneficiaire/domain/beneficiaire'
import { contentId } from '@app/web/utils/skipLinks'
import classNames from 'classnames'
import Link from 'next/link'
import type { PropsWithChildren, ReactNode } from 'react'

/**
 * Shell de consultation d'un bénéficiaire. Pur affichage : il agence l'en-tête
 * (nom, année, alerte doublon) et la zone d'actions, mais ne connaît aucun
 * concern croisé — la route-hub lui injecte les boutons (activité, RDV), la
 * modale de suppression et l'effet de rafraîchissement RDV via des slots.
 */
const BeneficiaireConsultationLayout = ({
  beneficiaire,
  hasDuplicates,
  hasRdvIntegration,
  primaryActions,
  rdvActions,
  deleteModal,
  refreshRdvs,
  children,
}: PropsWithChildren<{
  beneficiaire: {
    prenom: string | null
    nom: string | null
    anneeNaissance: number | null
  }
  hasDuplicates: boolean
  hasRdvIntegration: boolean
  primaryActions?: ReactNode
  rdvActions?: ReactNode
  deleteModal?: ReactNode
  refreshRdvs?: ReactNode
}>) => {
  const displayName = displayNameFromIdentity(beneficiaire)
  const { anneeNaissance } = beneficiaire

  return (
    <CoopPageContainer size={56}>
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
        <BackButton fallbackHref="/coop/mes-beneficiaires" />
        <div
          className={classNames(
            'fr-width-full fr-flex fr-justify-content-space-between fr-align-items-center fr-flex-gap-8v',
            hasRdvIntegration ? 'fr-mb-2v' : 'fr-mb-4v',
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
            {hasDuplicates && (
              <Link
                href="/coop/mes-beneficiaires/doublons"
                className="fr-link--no-underline fr-text--xs fr-text-default--info fr-mb-0 fr-mt-2v fr-text--info fr-background-contrast--info fr-border-radius--4 fr-px-1-5v fr-inline-flex fr-align-items-center fr-text-blue-france-925"
              >
                <span className="fr-icon--xs fr-icon-error-warning-line fr-mr-1v" />{' '}
                <span
                  style={{
                    textDecoration: 'underline',
                    textDecorationThickness: '1px',
                    textUnderlineOffset: '2px',
                  }}
                >
                  Doublon potentiel détecté
                </span>
              </Link>
            )}
          </div>
          {!hasRdvIntegration && primaryActions && (
            <div className="fr-flex fr-flex-gap-4v fr-flex-nowrap fr-flex-shrink-0">
              {primaryActions}
            </div>
          )}
        </div>
        {hasRdvIntegration && rdvActions && (
          <div className="fr-border--top fr-border--bottom fr-py-4v fr-width-full fr-my-6v ">
            <div className="fr-flex fr-flex-gap-4v fr-flex-nowrap fr-flex-shrink-0">
              {rdvActions}
            </div>
          </div>
        )}
        {children}
        {deleteModal}
      </main>
      {refreshRdvs}
    </CoopPageContainer>
  )
}

export default BeneficiaireConsultationLayout
