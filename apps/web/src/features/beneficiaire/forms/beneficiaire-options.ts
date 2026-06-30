import { labelsToOptions } from '@app/ui/components/Form/utils/options'
import { genreLabels } from '@app/web/features/beneficiaire/domain/genre'
import { statutSocialLabels } from '@app/web/features/beneficiaire/domain/statut-social'
import { trancheAgeLabels } from '@app/web/features/beneficiaire/domain/tranche-age'

/**
 * Options de formulaire (select/radio) dérivées des libellés du domaine. Vit
 * dans la couche `forms` (et non `domain`) car `labelsToOptions` est un utilitaire
 * UI : le domaine reste pur.
 */
export const genreOptions = labelsToOptions(genreLabels)
export const statutSocialOptions = labelsToOptions(statutSocialLabels)
export const trancheAgeOptions = labelsToOptions(trancheAgeLabels)
