import DataTable from '@app/web/libs/data-table/DataTable'
import type { DataTableConfiguration } from '@app/web/libs/data-table/DataTableConfiguration'
import PaginationNavWithPageSizeSelect from '@app/web/libs/data-table/PaginationNavWithPageSizeSelect'
import { generatePageSizeSelectOptions } from '@app/web/libs/data-table/pageSizeSelectOptions'
import { Spinner } from '@app/web/ui/Spinner'
import { Suspense } from 'react'
import { LIGNES_PAR_PAGE } from '../../../../domain'
import type { LigneDuTableau } from '../mes-activites.presenter'
import { OuvrirLeDetailDeLaLigne } from './OuvrirLeDetailDeLaLigne'

export type ContenuDuTableau = {
  readonly decompte: string
  readonly lignes: readonly LigneDuTableau[]
  readonly pages: number
}

const optionsDeLignes = generatePageSizeSelectOptions([...LIGNES_PAR_PAGE])

const colonnes = {
  rowKey: ({ id }: LigneDuTableau) => id,
  columns: [
    {
      name: 'activite',
      header: 'Activité',
      cell: ({ type, personnes }: LigneDuTableau) => (
        <>
          <p className="fr-text-mention--grey fr-text--xs fr-mb-0-5v">{type}</p>
          <p className="fr-text--sm fr-mb-0">{personnes}</p>
        </>
      ),
      cellClassName: 'tableau-des-activites__type',
    },
    {
      name: 'date',
      header: 'Date',
      cell: ({ jour }: LigneDuTableau) => jour,
      defaultSortable: true,
      defaultSortableDirection: 'desc' as const,
    },
    {
      name: 'duree',
      header: 'Durée',
      cell: ({ duree }: LigneDuTableau) => duree,
    },
    {
      name: 'lieu_d_activite',
      header: 'Lieu d’activité',
      cell: ({ lieu }: LigneDuTableau) => lieu,
      cellClassName: 'tableau-des-activites__lieu',
    },
    {
      name: 'creation',
      header: 'Enregistrée le',
      cell: ({ enregistreeLe }: LigneDuTableau) => enregistreeLe,
    },
  ],
} satisfies DataTableConfiguration<LigneDuTableau>

const Contenu = async ({
  contenu,
  parametres,
}: {
  contenu: Promise<ContenuDuTableau>
  parametres: Record<string, string>
}) => {
  const { decompte, lignes, pages } = await contenu
  return (
    <>
      <p className="fr-text--bold fr-text--lg fr-my-6v">{decompte}</p>
      <DataTable
        className="fr-table--nowrap fr-width-full fr-mb-8v"
        rows={[...lignes]}
        configuration={colonnes}
        searchParams={parametres}
        baseHref="/coop/mes-activites/tableau"
        rowButtonComponent={OuvrirLeDetailDeLaLigne}
      />
      <PaginationNavWithPageSizeSelect
        defaultPageSize={50}
        pageSizeOptions={optionsDeLignes}
        totalPages={pages}
        searchParams={parametres}
        baseHref="/coop/mes-activites/tableau"
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
