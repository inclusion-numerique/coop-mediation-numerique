import { Fragment, type ReactNode } from 'react'

export const SectionActivitesImprimee = ({
  types,
  thematiques,
  demarches,
  tags,
  materiels,
  canaux,
  durees,
  lieux,
}: {
  types: ReactNode
  thematiques: ReactNode
  demarches: ReactNode
  tags: ReactNode
  materiels: ReactNode
  canaux: ReactNode
  durees: ReactNode
  lieux: ReactNode
}) => {
  const accompagnementCategories = [
    {
      category: 'thematiques',
      title: 'Médiation numérique',
      contenu: thematiques,
    },
    {
      category: 'demarches',
      title: 'Démarches administratives',
      contenu: demarches,
    },
    { category: 'tags', title: 'Tags spécifiques', contenu: tags },
  ]

  return (
    <>
      <h2 className="fr-h3">Statistiques sur vos accompagnements</h2>
      <h3 className="fr-h5">Types d’activités</h3>
      {types}
      <h3 className="fr-h5 fr-mb-2v fr-mt-6v">
        Thématiques des accompagnements de médiation numérique
      </h3>
      <small role="note" className="fr-mb-6v fr-display-block">
        Thématiques et tags sélectionnées lors de l’enregistrement d’une
        activité. À noter : une activité peut avoir plusieurs thématiques.
      </small>
      {accompagnementCategories.map(({ category, title, contenu }) => (
        <Fragment key={category}>
          <h4 className="fr-h6 fr-mb-2v fr-mt-6v">{title}</h4>
          {contenu}
        </Fragment>
      ))}
      {materiels}
      {canaux}
      {durees}
      {lieux}
    </>
  )
}
