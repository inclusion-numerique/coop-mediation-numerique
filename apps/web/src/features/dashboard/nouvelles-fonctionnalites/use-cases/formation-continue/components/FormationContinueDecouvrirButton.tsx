'use client'

import Badge from '@codegouvfr/react-dsfr/Badge'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'

const FormationContinueModalInstance = createModal({
  id: 'formation-continue-decouvrir',
  isOpenedByDefault: false,
})

const FormationContinueDecouvrirButton = () => {
  return (
    <>
      <Button
        type="button"
        priority="secondary"
        size="small"
        {...FormationContinueModalInstance.buttonProps}
      >
        Découvrir
      </Button>
      <FormationContinueModalInstance.Component
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
                <span className="ri-leaf-fill ri-lg fr-mr-1w" aria-hidden />
                Formation continue
              </Badge>
              <h4 className="fr-mt-8v fr-mb-4v">
                Les inscriptions aux formations continues sont ouvertes&nbsp;!
              </h4>
              <p className="fr-mb-8v">
                En tant que Conseiller numérique, tout au long de votre
                parcours, vous bénéficiez d’une formation initiale puis
                continue, obligatoire et intégralement financée par l’Etat, pour
                vous donner les moyens de répondre aux besoins de vos usagers.
              </p>
              <p>
                <strong>
                  Ces formations sont également ouvertes aux médiateurs hors
                  dispositif Conseiller numérique
                </strong>
                , rapprochez vous de votre structure employeuse pour le
                financement.
              </p>
            </div>

            <div className="fr-mt-12v">
              <Button
                linkProps={{
                  href: 'https://lamednum.coop/formation',
                  target: '_blank',
                }}
              >
                Découvrir
              </Button>
              <Button
                type="button"
                priority="tertiary no outline"
                className="fr-ml-4v"
                onClick={() => FormationContinueModalInstance.close()}
              >
                J’ai compris
              </Button>
            </div>
          </div>
          <div className="fr-p-16v fr-background-contrast--blue-france fr-flex fr-index-n1">
            <img
              src="/images/fonctionnalites/formation-continue-illustration.svg"
              alt=""
              className="fr-m-auto fr-width-full"
            />
          </div>
        </div>
      </FormationContinueModalInstance.Component>
    </>
  )
}

export default FormationContinueDecouvrirButton
