import type { EmployeuseId } from '../../../domain/employeuse-id'
import type { IdentiteEmployeuse } from '../../../domain/identite-employeuse'

/**
 * Rattacher une personne à son employeuse courante.
 *
 * C'est l'unique écriture d'employeuse de la coop, partagée par les trois
 * chemins qui l'affirment : le choix Sirene à l'inscription, l'import par SIRET
 * et les claims ProConnect. Ils ne diffèrent que par la provenance de
 * l'identité — d'où un seul cas d'usage, et trois appelants.
 *
 * Rattacher, c'est affirmer l'employeur **courant** : les autres affectations
 * `source='coop'` de la personne sont désactivées (décision ADR-002 —
 * `est_active` porte l'employeuse courante, la coop en maintient la sémantique).
 * Les affectations d'une autre source, notamment `idposte`, ne sont jamais
 * touchées : elles appartiennent à l'Entrepôt.
 */
export type RattachementEmployeuse =
  | { readonly _tag: 'rattachee'; readonly employeuseId: EmployeuseId }
  /**
   * L'employeuse n'a pas pu être garantie dans `main` (géocodage ou API
   * indisponible). Volontairement non bloquant : le chemin d'écriture appelant
   * ne doit pas échouer pour autant, et la dérive résiduelle est rattrapée par
   * le job de complétion.
   */
  | { readonly _tag: 'employeuseIndisponible' }
  /**
   * L'établissement existe mais ne fait pas une employeuse : fermé, ou sans
   * identité exploitable. Distinct de l'indisponibilité — ici, réessayer ne
   * changera rien.
   */
  | { readonly _tag: 'identiteInexploitable' }

export type RattacherAUneEmployeuse = (input: {
  userId: string
  identite: IdentiteEmployeuse
}) => Promise<RattachementEmployeuse>

/**
 * Même rattachement, à partir du seul SIRET : l'identité est résolue chez
 * SIRENE avant d'être confiée au cas d'usage.
 */
export type RattacherAUneEmployeuseDepuisSiret = (input: {
  userId: string
  siret: string
}) => Promise<RattachementEmployeuse>
