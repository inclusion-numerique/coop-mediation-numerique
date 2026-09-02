import RemoveMediateurFromLieuModal from '@app/web/features/mon-reseau/use-cases/acteurs/components/RemoveMediateurFromLieuModal/RemoveMediateurFromLieuModal'
import LieuCard from '@app/web/features/mon-reseau/use-cases/lieux/components/LieuCard'
import { pluriel } from '@app/web/libraries/pluriel'
import SortSelect from '@app/web/libs/data-table/SortSelect'
import Button from '@codegouvfr/react-dsfr/Button'
import type { ReactNode } from 'react'
import { libellesDeTri, type TriDesLieux } from '../../domain'
import type { MonLieuActivite } from '../../implementation'
import { AucunLieu } from '../components/AucunLieu'
import VisibiliteMediateur from '../components/VisibiliteMediateur'

/**
 * Les lieux où le médiateur exerce.
 *
 * La carte affichée est celle de l'annuaire : « mes lieux » et « les lieux du
 * département » montrent le même objet, et le dupliquer ferait diverger deux
 * représentations d'une même chose.
 */
export const MesLieuxActivitePage = ({
  lieux,
  mediateurId,
  mediateurEstVisible,
  entete,
}: {
  lieux: readonly MonLieuActivite[]
  mediateurId: string
  mediateurEstVisible: boolean
  entete?: ReactNode
}) => (
  <div className="fr-container fr-container--medium fr-mb-32v">
    {entete}
    <main className="fr-mb-32v">
      <span className="fr-flex fr-flex-wrap fr-direction-md-row fr-direction-column fr-align-items-md-center fr-flex-gap-4v fr-my-10v">
        <span className="fr-flex fr-direction-row fr-align-items-end fr-flex-gap-4v">
          <span
            className="ri-home-office-line ri-xl fr-line-height-1 fr-text-label--blue-france fr-background-alt--blue-france fr-p-2w fr-m-0 fr-border-radius--8"
            aria-hidden
          />
          <h1 className="fr-page-title fr-m-0">Mes lieux d’activités</h1>
        </span>
        <Button
          className="fr-ml-md-auto"
          priority="secondary"
          linkProps={{ href: '/coop/lieux-activite/ajouter' }}
          iconId="fr-icon-add-line"
        >
          Ajouter un lieu
        </Button>
      </span>
      <VisibiliteMediateur isVisible={mediateurEstVisible} />
      <div className="fr-flex fr-direction-column fr-pt-4v">
        {lieux.length === 0 ? (
          <AucunLieu />
        ) : (
          <>
            <div className="fr-mb-6v fr-flex fr-align-items-center fr-justify-content-space-between fr-flex-gap-2v">
              <span className="fr-text--bold fr-text--uppercase fr-text--xs fr-mb-0">
                {lieux.length} {pluriel(lieux.length, 'lieu', 'lieux')}
              </span>
              <span className="fr-mr-4v">
                <SortSelect baseHref="/coop/lieux-activite" options={tris} />
              </span>
            </div>
            <hr className="fr-separator-1px" />
            {lieux.map(({ id, lieuInclusion: lieu }) => (
              <LieuCard
                key={id}
                lieu={lieu}
                removeMediateurFromLieu={{ mediateurId }}
                showActionButtons
              />
            ))}
            <RemoveMediateurFromLieuModal />
          </>
        )}
      </div>
    </main>
  </div>
)

const tris = (Object.keys(libellesDeTri) as TriDesLieux[]).map((tri) => ({
  label: libellesDeTri[tri],
  value: tri,
}))
