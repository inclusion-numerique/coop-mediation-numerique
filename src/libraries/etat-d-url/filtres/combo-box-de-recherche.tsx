import type { ComboBoxData } from '@/libraries/formulaire/fields-components'
import type { ServerActionResult } from '@/libraries/nextjs'
import { contientSansAccent } from '@/libraries/texte'
import type { SelectOption } from '@/libraries/ui'
import type { OptionsData } from '@/libraries/ui/primitives'

export type Rechercher = (input: {
  recherche: string
}) => Promise<ServerActionResult<readonly SelectOption[], string>>

export type EtatDeLaRecherche = 'TropCourte' | 'SansResultat' | 'Indisponible'

export type SuiviDeLaRecherche = { etat?: EtatDeLaRecherche }

const cleDe = ({ value }: SelectOption): string => value

const sansSuggestion = (etat: EtatDeLaRecherche) => ({ items: [], etat })

const chargerLesSuggestions =
  (
    rechercher: Rechercher,
    dejaChoisies: () => readonly SelectOption[],
    longueurMinimale: number,
    suggestions: readonly SelectOption[],
  ) =>
  async (
    recherche: string,
  ): Promise<{ items: SelectOption[] } & SuiviDeLaRecherche> => {
    const choisies = new Set(dejaChoisies().map(cleDe))
    const proposees = suggestions.filter(
      (option) => !choisies.has(cleDe(option)),
    )

    if (recherche.trim() === '' && proposees.length > 0)
      return { items: proposees }

    if (recherche.trim().length < longueurMinimale)
      return sansSuggestion('TropCourte')

    const resultat = await rechercher({ recherche })
    if (!resultat.success) return sansSuggestion('Indisponible')

    const items = resultat.data.filter((option) => !choisies.has(cleDe(option)))

    return items.length === 0 ? sansSuggestion('SansResultat') : { items }
  }

export const comboBoxDeRecherche = (
  rechercher: Rechercher,
  dejaChoisies: () => readonly SelectOption[],
  longueurMinimale: number,
  suggestions: readonly SelectOption[] = [],
): ComboBoxData<SelectOption, SuiviDeLaRecherche> => ({
  itemToString: (option) => option?.label ?? '',
  itemToKey: cleDe,
  loadSuggestions: chargerLesSuggestions(
    rechercher,
    dejaChoisies,
    longueurMinimale,
    suggestions,
  ),
})

export const rechercherParmi =
  (options: readonly SelectOption[]): Rechercher =>
  async ({ recherche }) => ({
    success: true,
    data: options.filter(({ label }) => contientSansAccent(label, recherche)),
  })

export const messageDeLaRecherche = (
  etat: EtatDeLaRecherche,
  longueurMinimale: number,
): string =>
  ({
    TropCourte: `Saisissez au moins ${longueurMinimale} caractère${longueurMinimale > 1 ? 's' : ''}`,
    SansResultat: 'Aucun résultat',
    Indisponible: 'La recherche est indisponible, réessayez',
  })[etat]

export const OptionsDeRecherche: OptionsData<SelectOption> = {
  itemToKey: cleDe,
  renderItem: ({ item }) => <span>{item.label}</span>,
}
