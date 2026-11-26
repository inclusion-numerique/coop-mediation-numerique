import type { Employeuse } from '../../domain/employeuse'
import {
  type EmployeuseAffichage,
  employeuseAffichage,
} from './employeuse.presenter'

export type EmploiEmployeuseAffichage = EmployeuseAffichage & {
  complementAdresse: string | null
  adresseComplete: string | null
}

export const adresseCompleteAffichage = ({
  adresse,
  complementAdresse,
  codePostal,
  commune,
}: Pick<
  EmploiEmployeuseAffichage,
  'adresse' | 'complementAdresse' | 'codePostal' | 'commune'
>): string | null =>
  [
    [adresse, complementAdresse && `(${complementAdresse})`]
      .filter(Boolean)
      .join(' '),
    [codePostal, commune].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(', ') || null

export const emploiEmployeuseAffichage = (
  employeuse: Employeuse,
): EmploiEmployeuseAffichage => {
  const affichage = {
    ...employeuseAffichage(employeuse),
    complementAdresse: null,
  }
  return { ...affichage, adresseComplete: adresseCompleteAffichage(affichage) }
}
