import type { ComboBoxData } from '@/libraries/formulaire/fields-components/ComboBox'
import { inject } from '@/libraries/nextjs/injection/client'
import type { SelectOption } from '@/libraries/ui/components/Form/utils/options'
import type { OptionsData } from '@/libraries/ui/components/Primitives/Options'
import { RECHERCHER_DES_EMPLOYEUSES_ACTION_KEY } from '../../action/rechercher-des-employeuses.key'

const LONGUEUR_MINIMALE = 3

const cleDe = ({ value }: SelectOption): string => value

const chargerLesEmployeuses =
  (dejaChoisies: () => readonly SelectOption[]) =>
  async (recherche: string): Promise<{ items: SelectOption[] }> => {
    if (recherche.trim().length < LONGUEUR_MINIMALE) return { items: [] }

    const resultat = await inject(RECHERCHER_DES_EMPLOYEUSES_ACTION_KEY)({
      recherche,
    })

    const choisies = new Set(dejaChoisies().map(cleDe))

    return {
      items: resultat.success
        ? resultat.data.filter((option) => !choisies.has(cleDe(option)))
        : [],
    }
  }

export const employeuseComboBox = (
  dejaChoisies: () => readonly SelectOption[],
): ComboBoxData<SelectOption> => ({
  itemToString: (option) => option?.label ?? '',
  itemToKey: cleDe,
  loadSuggestions: chargerLesEmployeuses(dejaChoisies),
})

export const EmployeuseOptions: OptionsData<SelectOption> = {
  itemToKey: cleDe,
  renderItem: ({ item }) => <span>{item.label}</span>,
}
