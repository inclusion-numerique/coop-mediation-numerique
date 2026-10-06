import { labelsToOptions } from '@app/ui/components/Form/utils/options'
import type { ApiClientScope } from '@app/web/generated/prisma/client'

export const apiClientScopeLabels: { [key in ApiClientScope]: string } = {
  Activites: 'Activités',
  Statistiques: 'Statistiques',
  Structures: 'Structures',
  LieuxActivite: 'LieuxActivite',
  Utilisateurs: 'Utilisateurs',
}

export const apiClientScopeOptions = labelsToOptions(apiClientScopeLabels)

export const apiClientScopeValues = Object.keys(apiClientScopeLabels) as [
  ApiClientScope,
  ...ApiClientScope[],
]
