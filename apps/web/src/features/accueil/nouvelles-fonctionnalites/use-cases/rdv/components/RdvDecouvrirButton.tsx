'use client'

import Badge from '@codegouvfr/react-dsfr/Badge'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'

const RdvModalInstance = createModal({
  id: 'rdv-decouvrir',
  isOpenedByDefault: false,
})

const RdvDecouvrirButton = () => {
  return (
    <>
      <Button
        type="button"
        priority="secondary"
        size="small"
        {...RdvModalInstance.buttonProps}
      >
        Découvrir
      </Button>
      <RdvModalInstance.Component title="" className="twoPanesModal">
        <div className="fr-flex fr-direction-column fr-direction-xl-row">
          <div className="fr-flex fr-flex-1 fr-direction-column fr-justify-content-space-between fr-p-12v">
            <div>
              <Badge
                small
                className="fr-badge--new fr-mb-0 fr-py-1v fr-text--uppercase"
              >
                <span className="ri-calendar-line ri-lg fr-mr-1w" aria-hidden />
                Nouveauté&nbsp;: Intégration RDV Service public
              </Badge>
              <h4 className="fr-mt-8v fr-mb-4v">
                Connectez RDV Service Public à La Coop de la médiation numérique
              </h4>
              <p>Grâce à cette intégration, vous pourrez, depuis La Coop :</p>
              <ol>
                <li>Retrouver vos RDV à venir et passés</li>
                <li>
                  Planifier un RDV avec un bénéficiaire et le retrouver dans son
                  historique d’accompagnement
                </li>
                <li>
                  Renseigner un CRA pré-rempli avec les informations liées à un
                  rendez-vous
                </li>
              </ol>
            </div>

            <div className="fr-mt-12v">
              <Button
                linkProps={{
                  href: '/coop/mes-outils/rdv-service-public/se-connecter',
                }}
              >
                Activer l’intégration
              </Button>
              <Button
                priority="tertiary no outline"
                className="fr-ml-4v"
                linkProps={{
                  href: 'https://docs.numerique.gouv.fr/docs/49af7c6f-94c8-4160-b154-91b05ba2295a',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                }}
              >
                En savoir plus
              </Button>
            </div>
          </div>
          <div className="fr-p-16v fr-background-contrast--blue-france fr-flex fr-index-n1">
            <img
              src="/images/fonctionnalites/rdv-illustration.svg"
              alt=""
              className="fr-m-auto fr-width-full"
            />
          </div>
        </div>
      </RdvModalInstance.Component>
    </>
  )
}

export default RdvDecouvrirButton
