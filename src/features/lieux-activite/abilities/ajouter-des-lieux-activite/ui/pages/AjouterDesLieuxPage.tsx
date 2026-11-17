import IconInSquare from '@app/web/components/IconInSquare'
import type { ReactNode } from 'react'
import { AjouterDesLieuxActivitePage } from '../AjouterDesLieuxActivitePage'

export const AjouterDesLieuxPage = ({
  entete,
  retourHref,
}: {
  entete: ReactNode
  retourHref: string
}) => (
  <div className="fr-container fr-container--narrow">
    {entete}
    <div className="fr-mb-32v fr-p-12v fr-width-full fr-border-radius--8 fr-background-default--grey">
      <span className="fr-flex fr-direction-row fr-align-items-center fr-flex-gap-6v fr-mb-5w">
        <IconInSquare iconId="ri-home-office-line" />
        <h1 className="fr-h3 fr-page-title fr-m-0">
          Ajouter des lieux d’activités
        </h1>
      </span>
      <p className="fr-mb-6w">
        Recherchez dans les lieux déjà référencés. Si vous ne trouvez pas vos
        lieux d’activité, vous pouvez les créer afin d’être référencé.
      </p>
      <AjouterDesLieuxActivitePage retourHref={retourHref} />
    </div>
  </div>
)
