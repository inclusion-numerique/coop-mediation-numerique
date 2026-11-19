import {
  type TypologieStructure,
  typologieStructureLibelle,
} from '@/features/employeuse/domain/typologieStructure'
import type { AdresseBanData } from '@/libraries/adresse/AdresseBanValidation'
import { addresseFromParts } from '@/libraries/adresse/addresseFromParts'
import type { ComboBoxData } from '@/libraries/formulaire/fields-components/ComboBox'
import { inject } from '@/libraries/nextjs/injection/client'
import type { OptionsData } from '@/libraries/ui/components/Primitives/Options'
import {
  RECHERCHER_UNE_STRUCTURE_EMPLOYEUSE_KEY,
  type StructureEmployeuseTrouvee,
} from '../rechercher-une-structure-employeuse.key'

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
  readonly typologie?: TypologieStructure | null
}

/**
 * Les deux sources de la recherche rendent une adresse à plat ; le formulaire,
 * lui, parle `AdresseBanData`. La projection reste ici, au point de choix — ni
 * la recherche ni la validation n'ont à connaître l'autre forme.
 */
const toItem = (
  structure: StructureEmployeuseTrouvee,
): StructureEmployeuseItem => ({
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
  typologie: structure.typologie ?? null,
})

/**
 * Le SIRET identifie le choix : c'est la clé que les deux sources — structures
 * enregistrées et annuaire des entreprises — ont en commun.
 */
const itemToKey = (item: StructureEmployeuseItem): string => item.siret

const itemToString = (item: StructureEmployeuseItem | null): string =>
  item?.nom ?? ''

/**
 * L'annuaire des entreprises peut être indisponible : la recherche se rabat
 * alors sur les seules structures déjà enregistrées, et l'appelant en est
 * averti pour le dire à l'utilisateur.
 */
const loadSuggestions =
  (onApiUnavailable: (indisponible: boolean) => void) =>
  async (input: string): Promise<{ items: StructureEmployeuseItem[] }> => {
    const result = await inject(RECHERCHER_UNE_STRUCTURE_EMPLOYEUSE_KEY)({
      query: input,
    })

    if (!result.success) return { items: [] }

    onApiUnavailable(result.data.apiUnavailable)

    return { items: result.data.structures.map(toItem) }
  }

const renderItem = ({ item }: { item: StructureEmployeuseItem }) => (
  <span className="fr-flex fr-direction-column">
    <span className="fr-text--sm fr-mb-0">{item.nom}</span>
    <span className="fr-text--xs fr-text-mention--grey fr-mb-0">
      {item.typologie ? `${typologieStructureLibelle(item.typologie)} · ` : ''}
      {addresseFromParts({
        adresse: item.adresseBan.nom,
        codePostal: item.adresseBan.codePostal,
        commune: item.adresseBan.commune,
      })}
    </span>
  </span>
)

export const structureEmployeuseComboBox = (
  onApiUnavailable: (indisponible: boolean) => void,
): ComboBoxData<StructureEmployeuseItem> => ({
  itemToString,
  itemToKey,
  loadSuggestions: loadSuggestions(onApiUnavailable),
})

export const structureEmployeuseOptions: OptionsData<StructureEmployeuseItem> =
  {
    itemToKey,
    renderItem,
  }
