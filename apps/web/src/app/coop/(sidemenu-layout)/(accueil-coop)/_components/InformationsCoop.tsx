import Card from '@app/web/components/Card'
import React from 'react'

export const InformationsCoop = () => (
  <>
    <h2 className="fr-h5 fr-text-mention--grey">
      <span className="ri-information-line fr-mr-1w" aria-hidden />
      Plus d’informations sur la Coop
    </h2>
    <div className="fr-grid-row fr-grid-row--gutters">
      <div className="fr-col-lg-6 fr-col-md-12 fr-col-sm-6 fr-col-12">
        <Card
          noBorder
          arrowTop
          arrowSm
          className="fr-border fr-border-radius--16"
          classes={{
            content: 'fr-p-0 fr-text--sm fr-text--medium fr-mb-0',
          }}
          title={
            <span className="fr-inline-flex fr-align-items-center">
              <span
                className="ri-question-line fr-text--regular fr-text-default--info fr-mr-3v"
                aria-hidden
              />
              <span className="fr-text--uppercase fr-text--xs fr-mb-0 fr-text-default--info">
                Le centre d’aide
              </span>
            </span>
          }
          href="https://docs.numerique.gouv.fr/docs/1cf724be-c40c-4299-906d-df22c181c77b/"
          isExternal
        >
          Nous vous guidons dans la prise en main des différentes
          fonctionnalités de la Coop de la médiation numérique.
        </Card>
      </div>
      <div className="fr-col-lg-6 fr-col-md-12 fr-col-sm-6 fr-col-12">
        <Card
          noBorder
          arrowTop
          arrowSm
          className="fr-border fr-border-radius--16"
          classes={{
            content: 'fr-p-0 fr-text--sm fr-text--medium fr-mb-0',
          }}
          title={
            <span className="fr-inline-flex fr-align-items-center">
              <span
                className="ri-flashlight-line fr-text--regular fr-text-label--yellow-tournesol fr-mr-3v"
                aria-hidden
              />
              <span className="fr-text--uppercase fr-text--xs fr-mb-0 fr-text-label--yellow-tournesol">
                Prochaines évolutions
              </span>
            </span>
          }
          href="https://projets.suite.anct.gouv.fr/boards/1572441353164424613"
          isExternal
        >
          Retrouvez ici les prochaines évolutions de la plateforme et comment
          contribuer à son amélioration.
        </Card>
      </div>
    </div>
  </>
)
