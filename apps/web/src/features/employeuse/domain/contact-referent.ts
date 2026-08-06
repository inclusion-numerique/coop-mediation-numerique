import { z } from 'zod'
import { CourrielReferent } from './courriel-referent'

/**
 * Contact du référent d'une employeuse, extrait du `contact` jsonb de
 * `main.structure_administrative`.
 *
 * Les trois champs (nom, courriel, téléphone) encodaient un seul état réparti
 * en trois `string | null`, que chaque appelant recomposait à sa façon. Ils
 * deviennent une union : il y a un référent, ou il n'y en a pas.
 *
 * Le nom et le téléphone ne sont pas brandés (DM-1bis) : ce sont des chaînes
 * d'affichage sur lesquelles nous n'avons aucun invariant honnête à faire
 * respecter — elles viennent d'un producteur externe et ne servent qu'à être
 * montrées. Le courriel, lui, est validé : il peut être recopié.
 */
export type ContactReferent =
  | { readonly _tag: 'nonRenseigne' }
  | {
      readonly _tag: 'renseigne'
      readonly nom: string | null
      readonly courriel: CourrielReferent | null
      readonly telephone: string | null
    }

/**
 * Forme attendue du jsonb. Chaque champ est tolérant (`.catch`) : un producteur
 * qui enverrait un `courriels` malformé ne doit pas emporter le nom avec lui.
 * C'est ce que masquait le `contact as MainContact` précédent, qui promettait
 * une forme sans jamais la vérifier.
 */
const contactSchema = z
  .object({
    nom: z.string().optional().catch(undefined),
    prenom: z.string().optional().catch(undefined),
    telephone: z.string().optional().catch(undefined),
    courriels: z.record(z.string(), z.string()).optional().catch(undefined),
  })
  .catch({})

const texte = (value: string | undefined): string | null =>
  value?.trim() ? value.trim() : null

/**
 * Premier courriel VALIDE, dans l'ordre : gestionnaire, référent hiérarchique,
 * puis le premier venu. On retient la validité et non la simple présence : un
 * gestionnaire malformé ne doit pas priver l'affichage d'un référent qui, lui,
 * est exploitable.
 *
 * Le jsonb porte DEUX courriels (`mail_gestionnaire`, `referent_hierarchique`)
 * mais UN SEUL couple nom/prénom, et ce nom est celui du gestionnaire : sur les
 * 678 structures de production où les deux adresses diffèrent, quand le nom
 * correspond à l'une d'elles c'est celle du gestionnaire environ deux fois sur
 * trois (nom : 167 vs 82 ; prénom : 91 vs 59). Servir le référent hiérarchique
 * en premier affichait donc un nom et une adresse qui ne désignaient pas la
 * même personne, pour 746 des 3 351 utilisateurs actifs. C'est aussi ce que
 * lisait le code précédent (`syncFromDataspaceCore`, `mail_gestionnaire`).
 */
const courrielReferent = (
  courriels: Record<string, string> | undefined,
): CourrielReferent | null =>
  [
    courriels?.mail_gestionnaire,
    courriels?.referent_hierarchique,
    ...Object.values(courriels ?? {}),
  ]
    .map((candidat) => CourrielReferent.safe(candidat ?? ''))
    .find((courriel) => courriel !== null) ?? null

export const ContactReferent = (contact: unknown): ContactReferent => {
  const parsed = contactSchema.parse(contact ?? {})
  const nom = texte([parsed.nom, parsed.prenom].filter(Boolean).join(' '))
  const courriel = courrielReferent(parsed.courriels)
  const telephone = texte(parsed.telephone)

  if (!nom && !courriel && !telephone) return { _tag: 'nonRenseigne' }
  return { _tag: 'renseigne', nom, courriel, telephone }
}

/**
 * Mise à plat du référent, pour les affichages qui portent encore les trois
 * champs séparés. Unique source de cette dérivation : les appelants ne
 * réinterprètent pas l'union chacun de leur côté.
 */
export const referentAffichage = (
  contact: ContactReferent,
): {
  nomReferent: string | null
  courrielReferent: string | null
  telephoneReferent: string | null
} =>
  contact._tag === 'renseigne'
    ? {
        nomReferent: contact.nom,
        courrielReferent: contact.courriel,
        telephoneReferent: contact.telephone,
      }
    : { nomReferent: null, courrielReferent: null, telephoneReferent: null }
