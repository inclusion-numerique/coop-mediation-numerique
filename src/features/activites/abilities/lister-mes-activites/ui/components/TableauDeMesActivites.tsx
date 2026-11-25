import { Suspense } from 'react'
import { DataTable } from '@/libraries/data-table/table'
import { Spinner } from '@/libraries/ui/components'
import { PaginationDesActivites } from '../../../../ui/components/PaginationDesActivites'
import type { LigneDuTableau } from '../presenters/mes-activites.presenter'
import { EnTeteDuTableauDeMesActivites } from './EnTeteDuTableauDeMesActivites'
import { LigneDuTableauDeMesActivites } from './LigneDuTableauDeMesActivites'

export type ContenuDuTableau = {
  readonly decompte: string
  readonly lignes: readonly LigneDuTableau[]
  readonly total: number
  readonly lignesParPage: number
}

const ADRESSE = '/coop/mes-activites/tableau'

const NOMBRE_DE_COLONNES = 6

const Contenu = async ({
  contenu,
  parametres,
}: {
  contenu: Promise<ContenuDuTableau>
  parametres: Record<string, string>
}) => {
  const { decompte, lignes, total, lignesParPage } = await contenu
  return (
    <>
      <p className="fr-text--bold fr-text--lg fr-my-6v">{decompte}</p>
      <DataTable className="fr-table--nowrap fr-width-full fr-mb-8v">
        <EnTeteDuTableauDeMesActivites
          adresse={ADRESSE}
          parametres={parametres}
        />
        <tbody>
          {lignes.map((ligne) => (
            <LigneDuTableauDeMesActivites key={ligne.id} ligne={ligne} />
          ))}
          {lignes.length === 0 && (
            <tr>
              <td colSpan={NOMBRE_DE_COLONNES}>Aucun résultat</td>
            </tr>
          )}
        </tbody>
      </DataTable>
      <PaginationDesActivites
        adresse={ADRESSE}
        parametres={parametres}
        total={total}
        lignesParPage={lignesParPage}
      />
    </>
  )
}

export const TableauDeMesActivites = (props: {
  contenu: Promise<ContenuDuTableau>
  parametres: Record<string, string>
}) => (
  <Suspense fallback={<Spinner />}>
    <Contenu {...props} />
  </Suspense>
)
