import { addresseFromParts } from '@/libraries/adresse'
import type { ComboBoxData } from '@/libraries/formulaire/fields-components'
import { inject } from '@/libraries/nextjs/injection'
import type { OptionsData } from '@/libraries/ui/primitives'
import {
  type EtablissementTrouve,
  RECHERCHER_UN_ETABLISSEMENT_KEY,
} from '../../action/rechercher-un-etablissement.key'

const itemToString = (item: EtablissementTrouve | null): string =>
  item ? `${item.nom} · ${item.siret}` : ''

const itemToKey = (item: EtablissementTrouve): string =>
  `${item.siret}-${item.adresse}`

const loadSuggestions = async (
  input: string,
): Promise<{ items: EtablissementTrouve[] }> => {
  if (input.length < 3) {
    return { items: [] }
  }

  const resultat = await inject(RECHERCHER_UN_ETABLISSEMENT_KEY)({
    query: input,
  })

  return resultat.success
    ? { items: [...resultat.data.structures] }
    : { items: [] }
}

const renderItem = ({ item }: { item: EtablissementTrouve }) => (
  <div className="fr-flex fr-direction-column">
    <span className="fr-text--bold">{item.nom}</span>
    <span className="fr-text--xs fr-text-mention--grey fr-mb-0">
      {[item.siret, addresseFromParts(item)].filter(Boolean).join(' · ')}
    </span>
  </div>
)

export const SiretSearchComboBox: ComboBoxData<EtablissementTrouve> = {
  itemToString,
  itemToKey,
  loadSuggestions,
}

export const SiretSearchOptions: OptionsData<EtablissementTrouve> = {
  itemToKey,
  renderItem,
}
