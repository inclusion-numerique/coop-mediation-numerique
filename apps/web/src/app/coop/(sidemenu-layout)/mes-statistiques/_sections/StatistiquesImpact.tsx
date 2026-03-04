import Button from '@codegouvfr/react-dsfr/Button'
import Image from 'next/image'
import Link from 'next/link'

const buildDonneesTerritoralesUrl = (codeDepartement?: string) =>
  codeDepartement
    ? `https://inclusion-numerique.anct.gouv.fr/vitrine/donnees-territoriales/synthese-et-indicateurs/departement/${codeDepartement}`
    : 'https://inclusion-numerique.anct.gouv.fr/vitrine/donnees-territoriales/synthese-et-indicateurs/national'

export const StatistiquesImpact = ({
  codeDepartement,
}: {
  codeDepartement?: string
}) => (
  <>
    <h2 className="fr-h5 fr-text-mention--grey">
      <span className="fr-icon-france-line fr-mr-1w" aria-hidden />
      Les données publiques de l’inclusion numérique sur votre département
    </h2>
    <div className="fr-background-alt--brown-caramel fr-border-radius--16 fr-flex fr-direction-column fr-direction-lg-row fr-align-items-center fr-flex-gap-3v">
      <Image
        width={210}
        height={180}
        className="fr-flex-shrink-0"
        src="/images/illustrations/landing-page/impact/contribution.svg"
        alt=""
      />
      <div className="fr-pl-8v fr-pl-lg-0 fr-pr-8v fr-pb-8v fr-pt-lg-8v">
        <p>
          Vos statistiques d’activités contribuent à valoriser et comprendre
          l’impact de l’inclusion numérique sur votre territoire.
          <br />
          <Link
            className="fr-link fr-text--xs"
            href="https://www.notion.so/incubateurdesterritoires/En-savoir-plus-sur-l-utilisation-des-donn-es-sur-la-Coop-de-la-m-diation-num-rique-82af14ef964b41c1bfb5cb4a01d6e40b#6052168a99a84eca9b4c12c1b905d354"
            target="_blank"
            rel="noreferrer"
            title="Données de l'inclusion numérique en France - nouvel onglet"
          >
            En savoir plus sur l’utilisation de vos données
          </Link>
        </p>

        <Button
          priority="secondary"
          linkProps={{
            href: buildDonneesTerritoralesUrl(codeDepartement),
            target: '_blank',
            rel: 'noreferrer',
          }}
        >
          Voir les données de mon département
        </Button>
      </div>
    </div>
  </>
)
