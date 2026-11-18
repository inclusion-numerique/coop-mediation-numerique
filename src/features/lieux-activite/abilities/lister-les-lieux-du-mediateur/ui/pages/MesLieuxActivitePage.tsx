import Button from '@codegouvfr/react-dsfr/Button'
import type { ReactNode } from 'react'
import {
  libellesDeTri,
  trisDesLieux,
} from '@/features/lieux-activite/domain/tri-des-lieux'
import { pluriel } from '@/libraries/pluriel'
import SortSelect from '@/libs/data-table/SortSelect'
import type { LieuDuMediateurEnListe } from '../../domain'
import { AucunLieu } from '../components/AucunLieu'

export const MesLieuxActivitePage = ({
  lieux,
  carte,
  visibilite,
  modaleDeRetrait,
  entete,
}: {
  lieux: readonly LieuDuMediateurEnListe[]
  carte: (lieu: LieuDuMediateurEnListe) => ReactNode
  visibilite: ReactNode
  modaleDeRetrait: ReactNode
  entete?: ReactNode
}) => (
  <div className="fr-container fr-container--800 fr-mb-32v">
    {entete}
    <main className="fr-mb-32v">
      <div className="fr-flex fr-flex-wrap fr-direction-row fr-align-items-center fr-flex-gap-4v fr-my-12v">
        <span
          className="ri-home-office-line fr-line-height-1 fr-text-label--blue-france fr-background-alt--blue-france fr-p-2w fr-m-0 fr-border-radius--8"
          aria-hidden
        />
        <h1 className="fr-page-title fr-m-0">Mes lieux d’activités</h1>
        <Button
          className="fr-ml-auto"
          priority="secondary"
          linkProps={{ href: '/coop/lieux-activite/ajouter' }}
          iconId="fr-icon-add-line"
        >
          Ajouter un lieu
        </Button>
      </div>
      {visibilite}
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
            {lieux.map(carte)}
            {modaleDeRetrait}
          </>
        )}
      </div>
    </main>
  </div>
)

const tris = trisDesLieux.map((tri) => ({
  label: libellesDeTri[tri],
  value: tri,
}))
