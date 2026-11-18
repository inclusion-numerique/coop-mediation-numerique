import Image from 'next/image'
import Link from 'next/link'

export const Impact = () => (
  <div className="fr-container">
    <div className="fr-background-alt--brown-caramel fr-p-md-12v fr-px-6v fr-py-8v fr-border-radius--16">
      <div className="fr-grid-row fr-grid-row--gutters fr-direction-column-reverse fr-direction-lg-row fr-align-items-center">
        <div className="fr-col-12 fr-col-lg-6">
          <h3 className="fr-text-title--blue-france fr-h2">
            Contribuez à rendre visible l'impact de l'inclusion numérique sur
            votre territoire.
          </h3>
          <p>
            Les statistiques d'activités anonymisés, récoltés sur La Coop de la
            médiation numérique, contribuent à valoriser l'impact de la
            médiation numérique sur votre territoire. Ces données publiques
            permettent de suivre et de mesurer les besoins de la population et
            d'ajuster les stratégies locales d'inclusion numérique.
          </p>
          <Link
            className="fr-link"
            href="https://inclusion-numerique.anct.gouv.fr/vitrine/donnees-territoriales/synthese-et-indicateurs/national"
            target="_blank"
            rel="noreferrer"
            title="Données de l'inclusion numérique en France - nouvel onglet"
          >
            Découvrir
          </Link>
        </div>
        <div className="fr-col-12 fr-col-sm-6  fr-mb-4v fr-flex fr-justify-content-center">
          <Image
            width={588}
            className="fr-width-full fr-height-full"
            height={420}
            src="/images/illustrations/landing-page/impact/contribution.svg"
            alt=""
          />
        </div>
      </div>
    </div>
  </div>
)
