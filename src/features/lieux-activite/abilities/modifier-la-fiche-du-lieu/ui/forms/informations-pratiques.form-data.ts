import { formOptions } from '@tanstack/react-form'
import type { z } from 'zod'
import { horairesVides } from '@/features/lieux-activite/domain/saisie/horaires-d-ouverture'
import type { InformationsPratiquesSaisie } from '../../action/modifier-la-fiche-du-lieu.validation'

export type InformationsPratiquesFormData = z.input<
  typeof InformationsPratiquesSaisie
>

const valeursInitiales: InformationsPratiquesFormData = {
  section: 'InformationsPratiques',
  siteWeb: null,
  ficheAccesLibre: null,
  priseRdv: null,
  openingHours: horairesVides,
  horairesComment: null,
}

export const informationsPratiquesFormOptions = formOptions({
  defaultValues: valeursInitiales,
})
