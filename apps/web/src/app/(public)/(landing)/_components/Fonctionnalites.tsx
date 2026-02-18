import Image from 'next/image'
import Link from 'next/link'

export const Fonctionnalites = () => (
  <div className="fr-container">
    <div className="fr-text--center">
      <Image
        className="fr-border-radius--16"
        src="/images/illustrations/landing-page/fonctionnalites/deployer.svg"
        alt=""
        width={52}
        height={64}
      />
      <h2 className="fr-h1 fr-text-title--blue-france fr-px-md-16w fr-mb-0 fr-mt-3w">
        Des fonctionnalités adaptées aux besoins des médiateurs et médiatrices
        numériques
      </h2>
    </div>
    <div className="fr-grid-row fr-direction-column-reverse fr-direction-sm-row fr-align-items-center fr-grid-row-sm--gutters fr-mt-md-15w fr-mt-6w">
      <div className="fr-col-lg-5 fr-col-sm-6 fr-col-12 fr-flex fr-direction-column fr-flex-gap-4v fr-my-2w">
        <h3 className="fr-mb-0">Valorisez votre activité</h3>
        <p className="fr-mb-0">
          Des comptes rendus d'activités rapides à compléter et une
          visualisation claire de vos statistiques pour faciliter le suivi de
          votre activité et la communication auprès de vos différents
          partenaires.
        </p>
      </div>
      <div className="fr-col-sm-6 fr-col-offset-lg-1 fr-col-12">
        <Image
          className="fr-responsive-img"
          src="/images/illustrations/landing-page/fonctionnalites/mes-activités.svg"
          alt=""
          width={558}
          height={420}
        />
      </div>
    </div>
    <div className="fr-grid-row fr-direction-column-reverse fr-direction-sm-row-reverse fr-align-items-center fr-grid-row-sm--gutters fr-mt-md-15w fr-mt-6w">
      <div className="fr-col-lg-5 fr-col-sm-6 fr-col-offset-lg-1 fr-col-12 fr-flex fr-direction-column fr-flex-gap-4v fr-my-2w">
        <h3 className="fr-mb-0">Suivez l'évolution de vos bénéficiaires</h3>
        <p className="fr-mb-0">
          Accédez aux informations essentielles sur vos bénéficiaires ainsi qu’à
          leurs historiques d’accompagnements pour suivre leurs parcours
          complets vers l’autonomie.
        </p>
        <span>
          <Link
            href="https://docs.numerique.gouv.fr/docs/b8b9de2c-6ac4-4119-b6c4-0cb0b3b738d0/"
            target="_blank"
            className="fr-link"
            rel="noreferrer"
          >
            En savoir plus
          </Link>
        </span>
      </div>
      <div className="fr-col-sm-6  fr-col-12">
        <Image
          className="fr-responsive-img"
          src="/images/illustrations/landing-page/fonctionnalites/mes-bénéficiaire.svg"
          alt=""
          width={558}
          height={420}
        />
      </div>
    </div>
    <div className="fr-grid-row fr-direction-column-reverse fr-direction-sm-row fr-align-items-center fr-grid-row-sm--gutters fr-mt-md-15w fr-mt-6w">
      <div className="fr-col-lg-5 fr-col-sm-6 fr-col-12 fr-flex fr-direction-column fr-flex-gap-4v fr-my-2w">
        <h3 className="fr-mb-0">Bénéficiez d'outils adaptés à vos pratiques</h3>
        <p className="fr-mb-0">
          De nombreux outils adaptés aux différents types d’accompagnements sont
          à disposition des médiateurs et médiatrices numériques. Leur
          inter-connexion permet une meilleure fluidité dans l’organisation du
          travail.
        </p>
        <span>
          <Link href="#outils" className="fr-link">
            Voir la liste des outils
          </Link>
        </span>
      </div>
      <div className="fr-col-sm-6 fr-col-offset-lg-1 fr-col-12">
        <Image
          className="fr-responsive-img"
          src="/images/illustrations/landing-page/fonctionnalites/mes-outils.svg"
          alt=""
          width={558}
          height={420}
        />
      </div>
    </div>
    <div className="fr-background-alt--yellow-tournesol fr-p-6v fr-p-md-12v fr-border-radius--16 fr-flex fr-direction-column fr-direction-md-row fr-align-items-center fr-flex-gap-6v fr-flex-gap-md-10v fr-mt-md-32v fr-mt-12v">
      <span
        className="fr-icon-flashlight-fill fr-icon--lg fr-text-label--yellow-tournesol fr-background-action-low--yellow-tournesol fr-border-radius--8 fr-p-5v fr-flex-shrink-0"
        aria-hidden
      />
      <div className="fr-text--center fr-text-md--left">
        <h3 className="fr-mb-4v fr-text-label--blue-france">
          Découvrez les évolutions à venir&nbsp;!
        </h3>
        <p className="fr-mb-0 fr-text--lg">
          Cette plateforme évolue en fonction des besoins de ses utilisateurs,
          et vous êtes tenu au courant des prochaines fonctionnalités à venir.
        </p>
      </div>
      <Link
        className="fr-btn fr-btn--secondary fr-text--nowrap fr-flex-shrink-0"
        href="https://projets.suite.anct.gouv.fr/boards/1572441353164424613"
        target="_blank"
        rel="noreferrer"
      >
        Voir la roadmap
      </Link>
    </div>
  </div>
)
