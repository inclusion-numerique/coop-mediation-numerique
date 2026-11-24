import { genreLabels } from '@/features/beneficiaire/domain/genre'
import { statutSocialLabels } from '@/features/beneficiaire/domain/statut-social'
import { trancheAgeLabels } from '@/features/beneficiaire/domain/tranche-age'
import { labelsToOptions } from '@/libraries/ui/components/form/utils/options'

/**
 * Options de formulaire (select/radio) dérivées des libellés du domaine. Vit
 * dans la couche `forms` (et non `domain`) car `labelsToOptions` est un utilitaire
 * UI : le domaine reste pur.
 */
export const genreOptions = labelsToOptions(genreLabels)
export const statutSocialOptions = labelsToOptions(statutSocialLabels)
export const trancheAgeOptions = labelsToOptions(trancheAgeLabels)
