import type { OptionsData } from '@app/ui/components/Primitives/Options'
import type { AdresseBanData } from '@app/web/external-apis/ban/AdresseBanValidation'
import type { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'
import { vanillaTrpc } from '@app/web/trpc'

/**
 * Structure employeuse choisie dans le ComboBox : la forme produite ici EST
 * celle attendue par le formulaire (`structureEmployeuse`), validée à la
 * soumission.
 */
export type StructureEmployeuseItem = {
  readonly id?: string | null
  readonly nom: string
  readonly siret: string
  readonly adresseBan: AdresseBanData
  readonly typologies?: string[] | null
}

type StructureSuggestion = {
  readonly id?: string | null
  readonly nom: string
  readonly adresse: string
  readonly commune: string
  readonly codePostal: string
  readonly codeInsee: string
  readonly siret: string
  readonly typologies?: string[] | null
}

const toItem = (structure: StructureSuggestion): StructureEmployeuseItem => ({
  id: structure.id ?? null,
  nom: structure.nom,
  siret: structure.siret,
  adresseBan: {
    id: `${structure.codeInsee}-${structure.adresse}`,
    nom: structure.adresse,
    commune: structure.commune,
    codePostal: structure.codePostal,
    codeInsee: structure.codeInsee,
    contexte: structure.commune,
    latitude: 0,
    longitude: 0,
  },
  typologies: structure.typologies ?? null,
})

const itemToString = (item: StructureEmployeuseItem | null): string =>
  item == null ? '' : item.nom

const itemToKey = (item: StructureEmployeuseItem): string => item.siret

const renderItem = ({ item }: { item: StructureEmployeuseItem }) => (
  <span className="fr-flex fr-direction-column">
    <span className="fr-text--sm fr-mb-0">{item.nom}</span>
    <span className="fr-text--xs fr-text-mention--grey fr-mb-0">
      {(item.typologies?.length ?? 0) > 0
        ? `${item.typologies?.join(', ')} · `
        : ''}
      {item.adresseBan.nom}, {item.adresseBan.codePostal}{' '}
      {item.adresseBan.commune}
    </span>
  </span>
)

/**
 * Recherche combinée (base + annuaire des entreprises), réutilisée telle quelle
 * via le client tRPC vanilla. `onApiUnavailable` remonte l'indisponibilité de
 * l'annuaire pour l'affichage d'une alerte.
 */
export const structureEmployeuseComboBox = (
  onApiUnavailable: (unavailable: boolean) => void,
): ComboBoxData<StructureEmployeuseItem> => ({
  itemToString,
  itemToKey,
  loadSuggestions: async (input: string) => {
    if (input.length < 3) return { items: [] }
    const { structures, apiUnavailable } =
      await vanillaTrpc.structures.searchCombined.query({ query: input })
    onApiUnavailable(apiUnavailable)
    return { items: structures.map(toItem) }
  },
})

export const structureEmployeuseOptions: OptionsData<StructureEmployeuseItem> =
  {
    itemToKey,
    renderItem,
  }
