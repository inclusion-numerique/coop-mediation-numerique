import { type ReactNode, Suspense } from 'react'
import { Spinner } from '@/libraries/ui/components'
import { CarteDActivite } from '../../../../ui/components/carte/CarteDActivite'
import { PaginationDesActivites } from '../../../../ui/components/PaginationDesActivites'
import type { JourDeLaListe } from '../presenters/mes-activites.presenter'
import { AucuneActivite } from './AucuneActivite'
import { CarteDeRendezVous, type RenseignerLeStatut } from './CarteDeRendezVous'

export type ContenuDeLaListe = {
  readonly decompte: string
  readonly jours: readonly JourDeLaListe[]
  readonly total: number
  readonly lignesParPage: number
  readonly aucuneActivite: boolean
}

const Contenu = async ({
  contenu,
  basculeDesRendezVous,
  parametres,
  renseignerLeStatut,
}: {
  contenu: Promise<ContenuDeLaListe>
  basculeDesRendezVous: ReactNode
  parametres: Record<string, string>
  renseignerLeStatut: RenseignerLeStatut
}) => {
  const { decompte, jours, total, lignesParPage, aucuneActivite } =
    await contenu

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
                  <CarteDeRendezVous
                    key={carte.carte.id}
                    carte={carte.carte}
                    renseignerLeStatut={renseignerLeStatut}
                  />
                ) : (
                  <CarteDActivite key={carte.carte.id} carte={carte.carte} />
                ),
              )}
            </div>
          ))}
          <PaginationDesActivites
            className="fr-mt-12v"
            adresse="/coop/mes-activites"
            parametres={parametres}
            total={total}
            lignesParPage={lignesParPage}
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
  renseignerLeStatut: RenseignerLeStatut
}) => (
  <Suspense fallback={<Spinner className="fr-mt-6v" />}>
    <Contenu {...props} />
  </Suspense>
)
