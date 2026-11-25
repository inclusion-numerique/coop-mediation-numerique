import { formOptions } from '@tanstack/react-form'
import { creerLieuActiviteDefaultValues } from './creer-lieu-activite.form-data'

export const creerLieuActiviteFormOptions = formOptions({
  defaultValues: creerLieuActiviteDefaultValues(),
})
