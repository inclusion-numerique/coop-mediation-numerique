import { formOptions } from '@tanstack/react-form'
import type { z } from 'zod'
import type { InformationsPratiquesSaisie } from '../../action/modifier-la-fiche-du-lieu.validation'

export type InformationsPratiquesFormData = z.input<
  typeof InformationsPratiquesSaisie
>

export const informationsPratiquesFormOptions = formOptions({
  defaultValues: {} as InformationsPratiquesFormData,
})
