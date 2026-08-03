import { adresseEmployeuseLigne } from '../../../domain/adresse-employeuse'
import { referentAffichage } from '../../../domain/contact-referent'
import type { EmployeuseActuelle } from '../../../domain/employeuse-actuelle'
import { debutEmploi, finEmploi } from '../../../domain/periode-emploi'

/**
 * Mise à plat de l'employeuse courante pour les affichages.
 *
 * Les nullités exposées ici sont celles du domaine, pas des artefacts : un nom
 * absent (14 employeuses de production), une adresse absente (`adresse_id` nul)
 * et une période inconnue (aucun contrat) se lisent tels quels. La lecture
 * précédente les aplatissait en chaînes vides, ce qui obligeait chaque appelant
 * à deviner s'il regardait une donnée manquante ou une donnée vide.
 */
export type EmployeuseActuelleAffichage = {
  id: number
  nom: string | null
  adresse: string | null
  commune: string | null
  codePostal: string | null
  codeInsee: string | null
  siret: string | null
  rna: string | null
  nomReferent: string | null
  courrielReferent: string | null
  telephoneReferent: string | null
  debut: Date | null
  fin: Date | null
  source: string
}

export const employeuseActuelleAffichage = ({
  employeuse,
  source,
  periode,
}: EmployeuseActuelle): EmployeuseActuelleAffichage => ({
  id: employeuse.id,
  nom: employeuse.denomination,
  adresse: employeuse.adresse
    ? adresseEmployeuseLigne(employeuse.adresse)
    : null,
  commune: employeuse.adresse?.commune ?? null,
  codePostal: employeuse.adresse?.codePostal ?? null,
  codeInsee: employeuse.adresse?.codeInsee ?? null,
  siret: employeuse.siret,
  rna: employeuse.rna,
  ...referentAffichage(employeuse.contactReferent),
  debut: debutEmploi(periode),
  fin: finEmploi(periode),
  source,
})

/**
 * Forme `emplois` du `SessionUser` : 0 ou 1 élément, l'employeuse courante.
 * Conservée telle quelle parce que ses consommateurs (menu d'en-tête, récap
 * d'inscription, dérivation du département, accès carto) lisent
 * `emplois.at(0)?.structure` et `emplois.length`.
 *
 * L'`id` porte désormais l'identifiant `main` : le `structure_coop_id` qu'il
 * exposait n'est lu nulle part, et il disparaît à l'échange final.
 */
export const employeuseSessionEmplois = (
  employeuseActuelle: EmployeuseActuelle | null,
): {
  id: string
  structure: { nom: string | null; codeInsee: string | null }
}[] =>
  employeuseActuelle
    ? [
        {
          id: String(employeuseActuelle.employeuse.id),
          structure: {
            nom: employeuseActuelle.employeuse.denomination,
            codeInsee: employeuseActuelle.employeuse.adresse?.codeInsee ?? null,
          },
        },
      ]
    : []
