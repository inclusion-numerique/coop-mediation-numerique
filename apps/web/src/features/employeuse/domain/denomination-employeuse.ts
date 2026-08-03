import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * Nom affichable d'une employeuse. `main` en porte deux — celle de l'antenne
 * (locale) et celle de SIRENE — et l'antenne prime quand elle existe.
 *
 * 14 employeuses de production n'ont ni l'une ni l'autre (entreprises
 * individuelles, à qui SIRENE attribue un nom et un prénom plutôt qu'une
 * dénomination, plus un cas `[Non-Diffusible]`). Cette absence se modélise au
 * niveau du champ (`DenominationEmployeuse | null`) et non par une chaîne vide,
 * qui rendait « employeuse sans nom » indiscernable de « nom vide ».
 */
export const DenominationEmployeuse = defineModel(
  z.string().trim().min(1).brand('DenominationEmployeuse'),
)

export type DenominationEmployeuse = Model.TypeOf<typeof DenominationEmployeuse>
