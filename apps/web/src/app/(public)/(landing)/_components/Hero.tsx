import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup'
import Image from 'next/image'

export const Hero = () => (
  <div className="fr-container">
    <div className="fr-grid-row fr-grid-row--gutters fr-align-items-center">
      <div className="fr-col-xl-6 col-12 fr-mx-auto">
        <h1 className="fr-text-title--blue-france fr-mb-2w">
          La Coop de la médiation numérique
        </h1>
        <p className="fr-text--xl fr-pr-6w">
          Vos outils du quotidien pour accompagner les personnes éloignées du
          numérique.
        </p>
        <ButtonsGroup
          inlineLayoutWhen="md and up"
          buttonsSize="large"
          buttons={[
            {
              children: 'Se créer un compte',
              linkProps: { href: '/connexion' },
            },
            {
              children: 'Se connecter',
              linkProps: { href: '/connexion' },
              priority: 'secondary',
            },
          ]}
        />
      </div>
      <div className="fr-col-xl-6 fr-col-12">
        <div
          className="fr-mx-auto fr-display-grid fr-grid-cols-2 fr-flex-gap-4v"
          style={{ maxWidth: 580 }}
        >
          <div className="fr-display-grid fr-grid-rows-2 fr-flex-gap-4v">
            <img
              className="fr-border-radius--16 fr-width-full fr-height-full"
              src="/images/illustrations/landing-page/hero/besoin.webp"
              alt=""
            />
            <img
              className="fr-border-radius--16 fr-width-full fr-height-full"
              src="/images/illustrations/landing-page/hero/complexité.webp"
              alt=""
            />
          </div>
          <img
            className="fr-border-radius--16 fr-width-full fr-height-full"
            src="/images/illustrations/landing-page/hero/solution.webp"
            alt=""
          />
        </div>
      </div>
    </div>
  </div>
)
