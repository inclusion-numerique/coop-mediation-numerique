import type { ComboBoxData } from '@/libraries/formulaire/fields-components/ComboBox'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import type { SelectOption } from '@/libraries/ui/components/Form/utils/options'
import type { OptionsData } from '@/libraries/ui/components/Primitives/Options'

const LONGUEUR_MINIMALE = 3

export type Rechercher = (input: {
  recherche: string
}) => Promise<ServerActionResult<readonly SelectOption[], string>>

const cleDe = ({ value }: SelectOption): string => value

const chargerLesSuggestions =
  (rechercher: Rechercher, dejaChoisies: () => readonly SelectOption[]) =>
  async (recherche: string): Promise<{ items: SelectOption[] }> => {
    if (recherche.trim().length < LONGUEUR_MINIMALE) return { items: [] }

    const resultat = await rechercher({ recherche })

    const choisies = new Set(dejaChoisies().map(cleDe))

    return {
      items: resultat.success
        ? resultat.data.filter((option) => !choisies.has(cleDe(option)))
        : [],
    }
  }

export const comboBoxDeRecherche = (
  rechercher: Rechercher,
  dejaChoisies: () => readonly SelectOption[],
): ComboBoxData<SelectOption> => ({
  itemToString: (option) => option?.label ?? '',
  itemToKey: cleDe,
  loadSuggestions: chargerLesSuggestions(rechercher, dejaChoisies),
})

export const OptionsDeRecherche: OptionsData<SelectOption> = {
  itemToKey: cleDe,
  renderItem: ({ item }) => <span>{item.label}</span>,
}
