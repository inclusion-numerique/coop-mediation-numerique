import { telephoneDisplayString } from '@app/web/libraries/telephone'
import { referentAffichage } from '../domain/contact-referent'
import type { Employeuse } from '../domain/employeuse'

/**
 * Mise à plat d'une employeuse pour les affichages.
 *
 * Vit au niveau de la feature parce que deux abilities la partagent —
 * l'employeuse courante et l'employeuse à une date rendent la même structure,
 * seule la façon de la trouver diffère.
 *
 * Les nullités exposées sont celles du domaine, pas des artefacts : un nom
 * absent (14 employeuses de production) et une adresse absente (`adresse_id`
 * nul) se lisent tels quels. Les lectures précédentes les aplatissaient en
 * chaînes vides, ce qui obligeait chaque appelant à deviner s'il regardait une
 * donnée manquante ou une donnée vide.
 */
export type EmployeuseAffichage = {
  id: number
  nom: string | null
  adresse: string | null
  commune: string | null
  codePostal: string | null
  codeInsee: string | null
  siret: string | null
  rna: string | null
  aUnReferent: boolean
  nomReferent: string | null
  courrielReferent: string | null
  telephoneReferent: string | null
}

/**
 * Le contact est stocké en E.164 (`+33468532187`) : c'est la forme canonique,
 * pas une forme lisible. La mise au format national se fait ici et non dans les
 * cartes, pour que tous les affichages d'employeuse rendent le même numéro.
 */
const telephoneReferentFormate = <
  T extends { telephoneReferent: string | null },
>(
  referent: T,
): T => ({
  ...referent,
  telephoneReferent: referent.telephoneReferent
    ? telephoneDisplayString(referent.telephoneReferent)
    : null,
})

export const employeuseAffichage = (
  employeuse: Employeuse,
): EmployeuseAffichage => ({
  id: employeuse.id,
  nom: employeuse.denomination,
  // La voie seule : les cartes d'affichage composent elles-mêmes
  // « adresse, code postal commune ».
  adresse: employeuse.adresse?.voie ?? null,
  commune: employeuse.adresse?.commune ?? null,
  codePostal: employeuse.adresse?.codePostal ?? null,
  codeInsee: employeuse.adresse?.codeInsee ?? null,
  siret: employeuse.siret,
  rna: employeuse.rna,
  ...telephoneReferentFormate(referentAffichage(employeuse.contactReferent)),
})
