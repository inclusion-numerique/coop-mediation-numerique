import type { SourceDansLURL } from '@app/web/features/activites/ui/libelles/source-de-l-activite'
import { formOptions } from '@tanstack/react-form'
import type { StructureEmployeuse } from './StructureEmployeuseComboBox'

export type ValeursDePlusDeFiltres = {
  readonly structuresEmployeuses: StructureEmployeuse[]
  readonly thematiqueNonAdministratives: string[]
  readonly thematiqueAdministratives: string[]
  readonly tags: string | string[] | undefined
  readonly source: SourceDansLURL | undefined
}

const aucunFiltre: ValeursDePlusDeFiltres = {
  structuresEmployeuses: [],
  thematiqueNonAdministratives: [],
  thematiqueAdministratives: [],
  tags: undefined,
  source: undefined,
}

export const plusDeFiltresFormOptions = formOptions({
  defaultValues: aucunFiltre,
})
