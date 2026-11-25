import type { SelectOption } from '@/libraries/ui'
import type { CommuneDesEmployeuses } from '../../domain/commune-des-employeuses'

const optionDeLaCommune = ({
  codeInsee,
  nom,
  codePostal,
}: CommuneDesEmployeuses): SelectOption => ({
  value: codeInsee,
  label: `${nom} · ${codePostal}`,
})

export const optionsDesCommunes = (
  communes: readonly CommuneDesEmployeuses[],
): readonly SelectOption[] => communes.map(optionDeLaCommune)
