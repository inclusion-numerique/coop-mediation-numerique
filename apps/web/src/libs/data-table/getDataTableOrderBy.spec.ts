import type { DataTableConfiguration } from './DataTableConfiguration'
import {
  getDataTableOrderBy,
  type SortReferential,
} from './getDataTableOrderBy'

type Ligne = { readonly nom: string }

/**
 * Une table qui ne dit que ce qu'elle affiche : quelles colonnes elle offre au
 * tri, jamais sur quoi elles se trient.
 */
const configuration = {
  rowKey: ({ nom }: Ligne) => nom,
  columns: [
    {
      name: 'nom',
      header: 'Nom',
      defaultSortable: true,
      defaultSortableDirection: 'desc' as const,
      sortable: true,
    },
    { name: 'creation', header: 'Création', sortable: true },
    { name: 'employes', header: 'Employés' },
  ],
} satisfies DataTableConfiguration<Ligne>

const referentiel: SortReferential<
  'nom' | 'creation',
  Record<string, unknown>
> = {
  nom: (direction) => [{ nom: direction }],
  creation: (direction) => [{ creation: direction }],
}

describe('tri résolu depuis un référentiel', () => {
  it('trie sur la colonne demandée', () => {
    expect(
      getDataTableOrderBy(
        { tri: 'creation', ordre: 'asc' },
        configuration,
        referentiel,
      ),
    ).toEqual([{ creation: 'asc' }])
  })

  it('retombe sur la colonne triée par défaut, dans son sens à elle', () => {
    expect(getDataTableOrderBy({}, configuration, referentiel)).toEqual([
      { nom: 'desc' },
    ])
  })

  /**
   * Une colonne que le référentiel ignore rend un lien de tri qui ne trie rien.
   * Le type l'interdit ; si la garde sautait, la requête resterait cohérente.
   */
  it('ne trie sur rien quand la colonne n’a pas de règle', () => {
    expect(
      getDataTableOrderBy({ tri: 'employes' }, configuration, referentiel),
    ).toEqual([])
  })

  it('laisse les colonnes porter leur tri quand aucun référentiel n’est donné', () => {
    const ancienneForme = {
      rowKey: ({ nom }: Ligne) => nom,
      columns: [
        {
          name: 'nom',
          header: 'Nom',
          defaultSortable: true,
          orderBy: (direction: 'asc' | 'desc') => [{ nom: direction }],
        },
      ],
    } satisfies DataTableConfiguration<Ligne>

    expect(getDataTableOrderBy({ ordre: 'asc' }, ancienneForme)).toEqual([
      { nom: 'asc' },
    ])
  })
})
