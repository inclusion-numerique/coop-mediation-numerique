import Card from '@app/web/components/Card'
import Image from 'next/image'
import React from 'react'

export const CommunicationConum = () => (
  <>
    <h2 className="fr-h5 fr-text-mention--grey">
      <Image
        className="fr-mr-1w"
        width={24}
        height={24}
        src="/images/services/conseillers-numerique-icon.svg"
        alt=""
      />
      La communication du dispositif Conseiller numérique
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
              <Image
                className="fr-mr-3v"
                width={24}
                height={24}
                src="/images/services/mattermost.svg"
                alt=""
              />
              <span className="fr-text--uppercase fr-text--xs fr-mb-0 fr-text-default--grey">
                Mattermost
              </span>
            </span>
          }
          href="https://discussion.conseiller-numerique.gouv.fr/"
          isExternal
        >
          Accédez à la plateforme de discussions des conseillers numériques.
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
                className="ri-megaphone-line fr-text--regular fr-text-title--blue-france fr-mr-3v"
                aria-hidden
              />
              <span className="fr-text--uppercase fr-text--xs fr-mb-0 fr-text-default--grey">
                Kit de communication
              </span>
            </span>
          }
          href="https://lesbases.anct.gouv.fr/ressources/kit-de-communication-conseiller-numerique"
          isExternal
        >
          Valorisez le dispositif sur vos différents canaux de communication.
        </Card>
      </div>
    </div>
  </>
)
