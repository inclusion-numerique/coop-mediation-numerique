import Tag from '@codegouvfr/react-dsfr/Tag'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { routeConstruite } from '@/libraries/nextjs'
import type { EtiquetteAffichee } from '../definition'

export const BarreDeFiltres = ({
  etiquettes,
  sansFiltres,
  actions,
  children,
}: {
  etiquettes: readonly EtiquetteAffichee[]
  sansFiltres: string
  actions?: ReactNode
  children: ReactNode
}) => (
  <>
    <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-flex-gap-4v fr-mb-6v">
      <div className="fr-flex fr-align-items-start fr-flex-wrap fr-flex-gap-2v">
        {children}
      </div>
      {actions}
    </div>
    {etiquettes.length > 0 && (
      <>
        <div className="fr-flex fr-justify-content-space-between fr-mb-2v">
          <ul className="fr-tags-group">
            {etiquettes.map(({ prefixe, libelle, href }) => (
              <li className="fr-line-height-1" key={href}>
                <Tag
                  className="fr-pr-3v"
                  small
                  linkProps={{ href: routeConstruite(href), scroll: false }}
                >
                  <span
                    className="fr-icon-close-line fr-icon--xs"
                    aria-hidden
                  />
                  &nbsp;{prefixe}
                  {libelle}
                </Tag>
              </li>
            ))}
          </ul>
          <Link
            className="fr-btn fr-btn--tertiary-no-outline fr-text--nowrap"
            href={routeConstruite(sansFiltres)}
            scroll={false}
          >
            <span className="ri-close-circle-line" aria-hidden />
            &nbsp;Effacer les filtres
          </Link>
        </div>
        <hr className="fr-mt-4v fr-pb-3v" />
      </>
    )}
  </>
)
