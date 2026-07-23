import type { Prisma } from '@prisma/client'

// Parsing du jsonb `main.structure_administrative.contact` (ADR-002 étape 6) : forme
// `{ nom, prenom, telephone, courriels: { referent_hierarchique, mail_gestionnaire, … } }`,
// renseignée par les producteurs Dataspace. Partagé entre les lectures d'affichage employeuse
// (getActeurEmploiForDate) et la matérialisation du lieu depuis l'employeuse (inscription).
export type MainContact = {
  nom?: string
  prenom?: string
  telephone?: string
  courriels?: Record<string, string>
}

export const parseMainContact = (
  contact: Prisma.JsonValue | null | undefined,
): MainContact =>
  contact && typeof contact === 'object' && !Array.isArray(contact)
    ? (contact as MainContact)
    : {}

// Courriel référent : referent_hierarchique, sinon mail_gestionnaire, sinon le premier disponible.
const referentCourriel = (contact: MainContact): string | null => {
  const { courriels } = contact
  if (!courriels) return null
  return (
    courriels.referent_hierarchique ??
    courriels.mail_gestionnaire ??
    Object.values(courriels)[0] ??
    null
  )
}

export type ReferentContact = {
  nomReferent: string | null
  courrielReferent: string | null
  telephoneReferent: string | null
}

// Référents normalisés depuis le `contact` main, forme historique attendue par les lieux/affichages.
export const referentFromMainContact = (
  contact: Prisma.JsonValue | null | undefined,
): ReferentContact => {
  const parsed = parseMainContact(contact)
  return {
    nomReferent: [parsed.nom, parsed.prenom].filter(Boolean).join(' ') || null,
    courrielReferent: referentCourriel(parsed),
    telephoneReferent: parsed.telephone ?? null,
  }
}
