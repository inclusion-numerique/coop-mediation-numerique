import PaginationNavWithPageSizeSelect from '@app/web/libs/data-table/PaginationNavWithPageSizeSelect'
import { generatePageSizeSelectOptions } from '@app/web/libs/data-table/pageSizeSelectOptions'
import { Spinner } from '@app/web/ui/Spinner'
import { type ReactNode, Suspense } from 'react'
import { LIGNES_PAR_PAGE } from '../../../../domain'
import { CarteDActivite } from '../../../../ui/carte/CarteDActivite'
import { CarteDeRendezVous } from '../../../../ui/carte/CarteDeRendezVous'
import type { JourDeLaListe } from '../mes-activites.presenter'
import { AucuneActivite } from './AucuneActivite'

export type ContenuDeLaListe = {
  readonly decompte: string
  readonly jours: readonly JourDeLaListe[]
  readonly pages: number
  readonly aucuneActivite: boolean
}

const optionsDeLignes = generatePageSizeSelectOptions([...LIGNES_PAR_PAGE])

const Contenu = async ({
  contenu,
  basculeDesRendezVous,
  parametres,
}: {
  contenu: Promise<ContenuDeLaListe>
  basculeDesRendezVous: ReactNode
  parametres: Record<string, string>
}) => {
  const { decompte, jours, pages, aucuneActivite } = await contenu

  if (aucuneActivite && basculeDesRendezVous === null) return <AucuneActivite />

  return (
    <>
      <div className="fr-flex fr-align-items-center fr-justify-content-space-between fr-width-full fr-my-6v">
        <h2 className="fr-text--bold fr-text--lg fr-mb-0">{decompte}</h2>
        {basculeDesRendezVous}
      </div>
      {aucuneActivite ? (
        <AucuneActivite />
      ) : (
        <>
          {jours.map(({ cle, jour, cartes }) => (
            <div key={cle}>
              <h3 className="fr-text--xs fr-text-mention--grey fr-text--bold fr-text--uppercase fr-mt-6v fr-mb-4v">
                {jour}
              </h3>
              {cartes.map((carte) =>
                carte._tag === 'RendezVous' ? (
                  <CarteDeRendezVous key={carte.carte.id} carte={carte.carte} />
                ) : (
                  <CarteDActivite key={carte.carte.id} carte={carte.carte} />
                ),
              )}
            </div>
          ))}
          <PaginationNavWithPageSizeSelect
            className="fr-mt-12v"
            totalPages={pages}
            baseHref="/coop/mes-activites"
            searchParams={parametres}
            defaultPageSize={50}
            pageSizeOptions={optionsDeLignes}
          />
        </>
      )}
    </>
  )
}

export const ListeDeMesActivites = (props: {
  contenu: Promise<ContenuDeLaListe>
  basculeDesRendezVous: ReactNode
  parametres: Record<string, string>
}) => (
  <Suspense fallback={<Spinner className="fr-mt-6v" />}>
    <Contenu {...props} />
  </Suspense>
)
