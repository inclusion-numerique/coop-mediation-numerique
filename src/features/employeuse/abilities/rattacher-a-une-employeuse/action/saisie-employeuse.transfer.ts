import type { SaisieEmployeuse } from '../domain/source-du-rattachement'
import type { EmployeuseChoisie } from './renseigner-structure-employeuse.validation'

export const saisieEmployeuse = ({
  siret,
  nom,
  adresse,
  commune,
  codePostal,
  codeInsee,
}: EmployeuseChoisie): SaisieEmployeuse => ({
  siret,
  denomination: nom,
  adresse: {
    voie: adresse,
    commune,
    codePostal: codePostal || null,
    codeInsee: codeInsee || null,
  },
})
