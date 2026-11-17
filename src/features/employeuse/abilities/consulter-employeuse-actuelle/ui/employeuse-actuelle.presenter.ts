import type { EmployeuseActuelle } from '../../../domain/employeuse-actuelle'
import { debutEmploi, finEmploi } from '../../../domain/periode-emploi'
import {
  type EmployeuseAffichage,
  employeuseAffichage,
} from '../../../ui/employeuse.presenter'

/**
 * L'employeuse courante à plat : la structure elle-même, plus ce que cette
 * ability sait en propre — la source qui fait autorité, et la période d'emploi
 * quand un contrat la renseigne.
 */
export type EmployeuseActuelleAffichage = EmployeuseAffichage & {
  debut: Date | null
  fin: Date | null
  source: string
}

export const employeuseActuelleAffichage = ({
  employeuse,
  source,
  periode,
}: EmployeuseActuelle): EmployeuseActuelleAffichage => ({
  ...employeuseAffichage(employeuse),
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
