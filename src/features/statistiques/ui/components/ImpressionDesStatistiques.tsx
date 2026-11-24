import Tag from '@codegouvfr/react-dsfr/Tag'
import type { ReactNode } from 'react'

export const ImpressionDesStatistiques = ({
  libelles,
  generale,
  activites,
  beneficiaires,
}: {
  libelles: readonly string[]
  generale: ReactNode
  activites: ReactNode
  beneficiaires: ReactNode
}) => {
  return (
    <div className="fr-print" aria-hidden>
      <h1 className="fr-text-title--blue-france fr-my-2w">Mes statistiques</h1>
      {libelles.length > 0 && (
        <section>
          <h2 className="fr-h3">Filtres activés</h2>
          <ul className="fr-tags-group">
            {libelles.map((libelle) => (
              <li className="fr-line-height-1" key={libelle}>
                <Tag small>{libelle}</Tag>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="fr-pt-6v">{generale}</section>
      <section className="fr-pt-6v">{activites}</section>
      <section className="fr-pt-6v">{beneficiaires}</section>
    </div>
  )
}
