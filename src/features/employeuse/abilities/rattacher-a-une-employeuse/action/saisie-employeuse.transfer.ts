import { IdentiteEmployeuse } from '../../../domain/identite-employeuse'
import type { EmployeuseChoisie } from './renseigner-structure-employeuse.validation'

export const identiteSaisie = ({
  siret,
  nom,
  adresse,
  commune,
  codePostal,
  codeInsee,
}: EmployeuseChoisie): IdentiteEmployeuse | null =>
  IdentiteEmployeuse.safe({
    siret,
    denomination: nom,
    adresse: {
      voie: adresse,
      commune,
      codePostal: codePostal || null,
      codeInsee: codeInsee || null,
    },
  })
