'use client'

import Badge from '@codegouvfr/react-dsfr/Badge'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'

const ConsolidationStatistiquesDecouvrirModalInstance = createModal({
  id: 'consolidation-statistiques-decouvrir',
  isOpenedByDefault: false,
})

const ConsolidationStatistiquesDecouvrirButton = () => {
  return (
    <>
      <Button
        type="button"
        priority="secondary"
        size="small"
        {...ConsolidationStatistiquesDecouvrirModalInstance.buttonProps}
      >
        Découvrir
      </Button>
      <ConsolidationStatistiquesDecouvrirModalInstance.Component
        title=""
        className="twoPanesModal"
      >
        <div className="fr-flex fr-direction-column fr-direction-xl-row">
          <div className="fr-flex fr-flex-1 fr-direction-column fr-justify-content-space-between fr-p-12v">
            <div>
              <Badge
                small
                className="fr-badge--new fr-mb-0 fr-py-1v fr-text--uppercase"
              >
                <span
                  className="ri-chat-poll-fill ri-lg fr-mr-1w"
                  aria-hidden
                />
                Nouveauté : Consolidation des statistiques
              </Badge>
              <h4 className="fr-mt-8v fr-mb-4v fr-pr-32v">
                Vos statistiques et vos exports évoluent pour être plus faciles
                à&nbsp;utiliser
              </h4>
              <p className="fr-text--bold fr-text--uppercase fr-text--xs fr-mb-2v">
                Découvrez les différentes évolutions
              </p>
              <ol className="fr-text--sm">
                <li className="">
                  Des statistiques consolidés avec la mise en commun des données
                  des CRA de l’Espace Coop (V1) et de La Coop (V2).
                </li>
                <li className="">
                  Les statistiques calculés en fonction du nombre
                  d’accompagnements au lieu du nombre d’activités.
                </li>
                <li className="">
                  Des exports au format tableur consolidés pour être plus
                  faciles à traiter, filtrer, analyser...
                </li>
              </ol>
            </div>

            <div className="fr-mt-12v">
              <Button
                linkProps={{
                  href: 'https://docs.numerique.gouv.fr/docs/e2e794bb-30b3-41ea-a24f-4ef5c8ec074c',
                  target: '_blank',
                }}
              >
                En savoir plus
              </Button>
              <Button
                type="button"
                priority="tertiary no outline"
                className="fr-ml-4v"
                onClick={() =>
                  ConsolidationStatistiquesDecouvrirModalInstance.close()
                }
              >
                J’ai compris
              </Button>
            </div>
          </div>
          <div className="fr-p-14v fr-background-contrast--blue-france fr-flex fr-index-n1">
            <img
              src="/images/fonctionnalites/consolidation-statistiques-illustration.svg"
              alt=""
              className="fr-m-auto fr-width-full"
            />
          </div>
        </div>
      </ConsolidationStatistiquesDecouvrirModalInstance.Component>
    </>
  )
}

export default ConsolidationStatistiquesDecouvrirButton
