import { OptionsData } from '@app/ui/components/Primitives/Options'
import { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'
import { vanillaTrpc } from '@app/web/trpc'

export type CommuneActivite = {
  label: string
  value: string
}

const loadSuggestions = (selectedCommunes: CommuneActivite[]) => {
  let timer: NodeJS.Timeout | null = null
  let lastInput: string = ''

  return (input: string): Promise<{ items: CommuneActivite[] }> =>
    new Promise((resolve) => {
      if (timer) clearTimeout(timer)
      lastInput = input

      timer = setTimeout(async () => {
        if (!lastInput) return resolve({ items: [] })

        const data = await vanillaTrpc.lieuActivite.searchCommunes.query({
          query: lastInput,
          excludeCodeInsee: selectedCommunes.map(itemToKey),
        })

        resolve({ items: data })
      }, 300)
    })
}

const itemToString = (item: CommuneActivite | null): string =>
  item == null ? '' : item.label

const itemToKey = (item: CommuneActivite): string => item.value

const renderItem = ({ item }: { item: CommuneActivite }) => itemToString(item)

export const CommuneActiviteComboBox = (
  communes: CommuneActivite[] = [],
): ComboBoxData<CommuneActivite> => ({
  itemToString,
  loadSuggestions: loadSuggestions(communes),
  itemToKey,
})

export const CommuneActiviteOptions: OptionsData<CommuneActivite> = {
  itemToKey,
  renderItem,
}
