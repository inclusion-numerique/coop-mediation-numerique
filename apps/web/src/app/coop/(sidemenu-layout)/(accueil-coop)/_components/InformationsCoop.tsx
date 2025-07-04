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
          href="https://incubateurdesterritoires.notion.site/Centre-d-aide-de-La-Coop-de-la-m-diation-num-rique-e2db421ac63249769c1a9aa155af5f2f"
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
          href="https://incubateurdesterritoires.notion.site/105744bf03dd80349c26e76cd8459eac?v=8949acfdde544d12860f5c0ca89af72f"
          isExternal
        >
          Retrouvez ici les prochaines évolutions de la plateforme et comment
          contribuer à son amélioration.
        </Card>
      </div>
    </div>
  </>
)
