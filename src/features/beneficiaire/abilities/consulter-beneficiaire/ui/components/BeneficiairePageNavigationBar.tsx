import Link from 'next/link'

const BeneficiairePageNavigationBar = ({
  accompagnementsCount,
  current,
  beneficiaireId,
}: {
  beneficiaireId: string
  accompagnementsCount: number
  current: 'informations' | 'accompagnements'
}) => (
  <div className="fr-flex fr-border--bottom fr-mb-8v fr-mb-md-12v fr-nav-tabs">
    <nav className="fr-nav">
      <ul className="fr-nav__list">
        <li className="fr-nav__item">
          <Link
            className="fr-nav__link fr-link--md"
            href={`/coop/mes-beneficiaires/${beneficiaireId}`}
            aria-current={current === 'informations' ? 'page' : undefined}
          >
            Informations
          </Link>
        </li>
        <li className="fr-nav__item">
          <Link
            className="fr-nav__link fr-link--md"
            href={`/coop/mes-beneficiaires/${beneficiaireId}/accompagnements`}
            aria-current={current === 'accompagnements' ? 'page' : undefined}
          >
            Historique des activités&nbsp;·&nbsp;
            <span className="fr-text--bold">{accompagnementsCount}</span>
          </Link>
        </li>
      </ul>
    </nav>
  </div>
)

export default BeneficiairePageNavigationBar
