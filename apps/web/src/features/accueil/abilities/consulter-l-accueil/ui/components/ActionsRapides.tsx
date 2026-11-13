import Link from 'next/link'
import type { ReactNode } from 'react'

export const ActionsRapides = ({
  enregistrerUneActivite,
}: {
  enregistrerUneActivite: ReactNode
}) => (
  <>
    <h2 className="fr-h6 fr-text-mention--grey">
      <span
        className="ri-apps-line ri-lg fr-text--regular fr-mr-2v"
        aria-hidden
      />
      Mes actions rapides
    </h2>
    <div className="fr-grid-row fr-grid-row--gutters">
      <div className="fr-col-lg-6 fr-col-md-12 fr-col-sm-6 fr-col-12">
        {enregistrerUneActivite}
      </div>
      <div className="fr-col-lg-6 fr-col-md-12 fr-col-sm-6 fr-col-12">
        <Link
          className="fr-quick-action"
          href="/coop/mes-beneficiaires/nouveau"
        >
          <span
            className="ri-user-add-line ri-2x fr-mr-3w fr-text--regular"
            aria-hidden
          />
          Créer un·e bénéficiaire
        </Link>
      </div>
    </div>
  </>
)
