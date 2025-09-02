import { OptionsData } from '@app/ui/components/Primitives/Options'
import { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'
import { vanillaTrpc } from '@app/web/trpc'

export type DepartementActivite = {
  label: string
  value: string
}

const loadSuggestions = (selectedDepartements: DepartementActivite[]) => {
  let timer: NodeJS.Timeout | null = null
  let lastInput: string | null = null

  return (input: string): Promise<{ items: DepartementActivite[] }> =>
    new Promise((resolve) => {
      if (timer) clearTimeout(timer)
      lastInput = input

      timer = setTimeout(async () => {
        if (!lastInput) return resolve({ items: [] })

        const data = await vanillaTrpc.lieuActivite.searchDepartements.query({
          query: lastInput,
          excludeCodeInsee: selectedDepartements.map(itemToKey),
        })

        resolve({ items: data })
      }, 300)
    })
}

const itemToString = (item: DepartementActivite | null): string =>
  item == null ? '' : item.label

const itemToKey = (item: DepartementActivite): string => item.value

const renderItem = ({ item }: { item: DepartementActivite }) =>
  itemToString(item)

export const DepartementActiviteComboBox = (
  departements: DepartementActivite[] = [],
): ComboBoxData<DepartementActivite> => ({
  itemToString,
  loadSuggestions: loadSuggestions(departements),
  itemToKey,
})

export const DepartementActiviteOptions: OptionsData<DepartementActivite> = {
  itemToKey,
  renderItem,
}
