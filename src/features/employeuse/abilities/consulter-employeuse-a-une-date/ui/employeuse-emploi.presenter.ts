import type { Employeuse } from '../../../domain/employeuse'
import {
  type EmployeuseAffichage,
  employeuseAffichage,
} from '../../../ui/employeuse.presenter'

/**
 * Employeuse rattachée à un emploi, telle que l'attendent les cartes
 * « ma structure employeuse » et « structure employeuse de l'acteur ».
 *
 * `complementAdresse` est toujours `null` ici : `main` ne le porte pas (ADR-002,
 * décision 6 révisée). Il reste dans la forme parce qu'il vit toujours côté
 * lieu, et que les storybooks de la carte l'exercent.
 */
export type EmploiEmployeuseAffichage = EmployeuseAffichage & {
  complementAdresse: string | null
  adresseComplete: string | null
}

/**
 * Adresse d'une seule pièce, prête à rendre.
 *
 * La voie est légitimement absente (`AdresseEmployeuse.voie` est nullable, et
 * 216 employeuses de production n'en ont pas côté Entrepôt). Composer à la
 * virgule fixe rendait alors « , 66300 Thuir », et un complément sans voie
 * rendait « null (…) ». On assemble donc les morceaux présents au lieu de
 * trouer un gabarit — et on le fait ici plutôt que dans le template, pour que
 * les deux cartes qui affichent une employeuse s'accordent sans le redire.
 */
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
