import { formOptions } from '@tanstack/react-form'
import type { ActiviteSource } from '../source'
import type { StructureEmployeuse } from './StructureEmployeuseComboBox'

export type ValeursDePlusDeFiltres = {
  conseiller_numerique: '' | '0' | '1'
  structuresEmployeuses: StructureEmployeuse[]
  types: string[]
  thematiqueNonAdministratives: string[]
  thematiqueAdministratives: string[]
  tags: string | string[] | undefined
  source: ActiviteSource | undefined
}

const aucunFiltre: ValeursDePlusDeFiltres = {
  conseiller_numerique: '',
  structuresEmployeuses: [],
  types: [],
  thematiqueNonAdministratives: [],
  thematiqueAdministratives: [],
  tags: undefined,
  source: undefined,
}

export const plusDeFiltresFormOptions = formOptions({
  defaultValues: aucunFiltre,
})
