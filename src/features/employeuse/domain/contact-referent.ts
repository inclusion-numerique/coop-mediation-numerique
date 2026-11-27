import { z } from 'zod'
import { CourrielReferent } from './courriel-referent'

export type ContactReferent =
  | { readonly _tag: 'nonRenseigne' }
  | {
      readonly _tag: 'renseigne'
      readonly nom: string | null
      readonly courriel: CourrielReferent | null
      readonly telephone: string | null
    }

const lu = <T>(schema: z.ZodType<T>, valeur: unknown): T | undefined =>
  schema.safeParse(valeur).data

const champsDuContact = (contact: unknown): Record<string, unknown> =>
  lu(z.record(z.string(), z.unknown()), contact) ?? {}

const texte = (value: string | undefined): string | null =>
  value?.trim() ? value.trim() : null

const courrielReferent = (
  courriels: Record<string, string> | undefined,
): CourrielReferent | null =>
  [
    courriels?.['mail_gestionnaire'],
    courriels?.['referent_hierarchique'],
    ...Object.values(courriels ?? {}),
  ]
    .map((candidat) => CourrielReferent.safe(candidat ?? ''))
    .find((courriel) => courriel !== null) ?? null

export const ContactReferent = (contact: unknown): ContactReferent => {
  const champs = champsDuContact(contact)
  const nom = texte(
    [lu(z.string(), champs['prenom']), lu(z.string(), champs['nom'])]
      .filter(Boolean)
      .join(' '),
  )
  const courriel = courrielReferent(
    lu(z.record(z.string(), z.string()), champs['courriels']),
  )
  const telephone = texte(lu(z.string(), champs['telephone']))

  if (!nom && !courriel && !telephone) return { _tag: 'nonRenseigne' }
  return { _tag: 'renseigne', nom, courriel, telephone }
}

export const referentAffichage = (
  contact: ContactReferent,
): {
  aUnReferent: boolean
  nomReferent: string | null
  courrielReferent: string | null
  telephoneReferent: string | null
} =>
  contact._tag === 'renseigne'
    ? {
        aUnReferent: true,
        nomReferent: contact.nom,
        courrielReferent: contact.courriel,
        telephoneReferent: contact.telephone,
      }
    : {
        aUnReferent: false,
        nomReferent: null,
        courrielReferent: null,
        telephoneReferent: null,
      }
