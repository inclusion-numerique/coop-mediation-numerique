import { typologieStructureLibelle } from '@/features/employeuse/domain/typologie-de-structure'
import { addresseFromParts } from '@/libraries/adresse'
import type { ComboBoxData } from '@/libraries/formulaire/fields-components'
import { inject } from '@/libraries/nextjs/injection'
import type { OptionsData } from '@/libraries/ui/primitives'
import { RECHERCHER_STRUCTURE_EMPLOYEUSE_ACTION_KEY } from '../../action/rechercher-structure-employeuse.key'
import type { StructureTrouvee } from '../../domain/employeuse-choisie'

/**
 * Le SIRET identifie le choix : c'est la clé que les deux sources — structures
 * enregistrées et annuaire des entreprises — ont en commun.
 */
const itemToKey = (item: StructureTrouvee): string => item.siret

const itemToString = (item: StructureTrouvee | null): string => item?.nom ?? ''

/**
 * L'annuaire des entreprises peut être indisponible : la recherche se rabat
 * alors sur les seules structures déjà enregistrées, et l'appelant en est
 * averti pour le dire à l'utilisateur.
 */
const loadSuggestions =
  (onApiUnavailable: (indisponible: boolean) => void) =>
  async (input: string): Promise<{ items: StructureTrouvee[] }> => {
    const result = await inject(RECHERCHER_STRUCTURE_EMPLOYEUSE_ACTION_KEY)({
      query: input,
    })

    if (!result.success) return { items: [] }

    onApiUnavailable(result.data.apiUnavailable)

    return { items: result.data.structures }
  }

const renderItem = ({ item }: { item: StructureTrouvee }) => (
  <>
    <span className="fr-display-block fr-text--sm fr-mb-0">{item.nom}</span>
    <span className="fr-display-block fr-text--xs fr-text-mention--grey fr-mb-0">
      {item.typologie
        ? `${typologieStructureLibelle(item.typologie)} · `
        : null}
      {addresseFromParts(item)}
    </span>
  </>
)

export const StructureEmployeuseComboBox = (
  onApiUnavailable: (indisponible: boolean) => void,
): ComboBoxData<StructureTrouvee> => ({
  itemToString,
  itemToKey,
  loadSuggestions: loadSuggestions(onApiUnavailable),
})

export const StructureEmployeuseOptions: OptionsData<StructureTrouvee> = {
  itemToKey,
  renderItem,
}
