import { formOptions } from '@tanstack/react-form'
import type { z } from 'zod'
import type { InformationsPratiquesSaisie } from '../../action/modifier-la-fiche-du-lieu.validation'

/**
 * La forme d'ENTRÉE du schéma, et non sa sortie : c'est elle que TanStack
 * confronte au validateur, et elle seule accepte les champs que Zod complète.
 */
export type InformationsPratiquesFormData = z.input<
  typeof InformationsPratiquesSaisie
>

export const informationsPratiquesFormOptions = formOptions({
  defaultValues: {} as InformationsPratiquesFormData,
})
