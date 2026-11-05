import type { Prisma } from '@app/web/generated/prisma/client'
import { NomDuRegistre, PrenomDuRegistre } from './nom-du-registre'

const SIGNATURE_COOP = 'coop'

export type CompteCoop = {
  readonly email: string
  readonly firstName: string | null
  readonly lastName: string | null
  readonly phone: string | null
  readonly deleted: Date | null
  readonly mediateur: object | null
  readonly coordinateur: object | null
}

export type LigneDuRegistre = {
  readonly nom: string | null
  readonly prenom: string | null
  readonly contact: unknown
  readonly cnPgId: number | null
  readonly conseillerNumeriqueId: string | null
  readonly aidantConnectId: number | null
  readonly isMediateur: boolean | null
  readonly isCoordinateur: boolean | null
  readonly deletedAt: Date | null
  readonly deletedBy: readonly string[] | null
}

type ContactCoop = {
  readonly email: string
  readonly telephone?: string
}

export type ColonnesAlignees = {
  readonly nom?: string
  readonly prenom?: string
  readonly contact?: Prisma.InputJsonObject
  readonly isMediateur?: boolean
  readonly isCoordinateur?: boolean
  readonly deletedAt?: Date | null
  readonly deletedBy?: string[]
}

export type Alignement = ColonnesAlignees & {
  readonly editedBy: string
  readonly updatedAtCoop: Date
}

const estUnObjet = (valeur: unknown): valeur is Prisma.InputJsonObject =>
  typeof valeur === 'object' && valeur !== null && !Array.isArray(valeur)

const contactDe = (ligne: LigneDuRegistre): Prisma.InputJsonObject =>
  estUnObjet(ligne.contact) ? ligne.contact : {}

export const aUneAutreSource = (ligne: LigneDuRegistre): boolean =>
  ligne.cnPgId !== null ||
  ligne.conseillerNumeriqueId !== null ||
  ligne.aidantConnectId !== null ||
  'idposte' in contactDe(ligne)

const siDifferent = <C extends keyof ColonnesAlignees>(
  colonne: C,
  actuel: unknown,
  voulu: ColonnesAlignees[C] | undefined,
): Pick<ColonnesAlignees, C> | object =>
  voulu === undefined || actuel === voulu ? {} : { [colonne]: voulu }

const contactCoopVoulu = (compte: CompteCoop): ContactCoop => ({
  email: compte.email,
  ...(compte.phone === null ? {} : { telephone: compte.phone }),
})

const memeContactCoop = (actuel: unknown, voulu: ContactCoop): boolean =>
  estUnObjet(actuel) &&
  actuel.email === voulu.email &&
  actuel.telephone === voulu.telephone &&
  Object.keys(actuel).length === Object.keys(voulu).length

const alignementDuContact = (
  compte: CompteCoop,
  ligne: LigneDuRegistre,
): Pick<ColonnesAlignees, 'contact'> | object => {
  const contact = contactDe(ligne)
  const voulu = contactCoopVoulu(compte)

  return memeContactCoop(contact.coop, voulu)
    ? {}
    : { contact: { ...contact, coop: voulu } }
}

const alignementDeLIdentite = (
  compte: CompteCoop,
  ligne: LigneDuRegistre,
): Pick<ColonnesAlignees, 'nom' | 'prenom'> | object =>
  compte.deleted !== null && aUneAutreSource(ligne)
    ? {}
    : {
        ...siDifferent(
          'nom',
          ligne.nom,
          NomDuRegistre.safe(compte.lastName ?? '') ?? undefined,
        ),
        ...siDifferent(
          'prenom',
          ligne.prenom,
          PrenomDuRegistre.safe(compte.firstName ?? '') ?? undefined,
        ),
      }

const roleVoulu = (
  aLeRole: boolean,
  ligne: LigneDuRegistre,
): boolean | undefined => {
  if (aLeRole) return true
  return aUneAutreSource(ligne) ? undefined : false
}

const alignementDesRoles = (
  compte: CompteCoop,
  ligne: LigneDuRegistre,
): Pick<ColonnesAlignees, 'isMediateur' | 'isCoordinateur'> | object => {
  const estCoordinateur = compte.coordinateur !== null

  return {
    ...siDifferent(
      'isMediateur',
      ligne.isMediateur,
      roleVoulu(compte.mediateur !== null || estCoordinateur, ligne),
    ),
    ...siDifferent(
      'isCoordinateur',
      ligne.isCoordinateur,
      roleVoulu(estCoordinateur, ligne),
    ),
  }
}

const alignementDeLaSuppressionPosee = (
  supprimeLe: Date,
  ligne: LigneDuRegistre,
  supprimePar: readonly string[],
): Pick<ColonnesAlignees, 'deletedAt' | 'deletedBy'> | object => ({
  ...(ligne.deletedAt === null ||
  ligne.deletedAt.getTime() < supprimeLe.getTime()
    ? { deletedAt: supprimeLe }
    : {}),
  ...(supprimePar.includes(SIGNATURE_COOP)
    ? {}
    : { deletedBy: [...supprimePar, SIGNATURE_COOP] }),
})

const alignementDeLaSuppressionLevee = (
  supprimePar: readonly string[],
): Pick<ColonnesAlignees, 'deletedAt' | 'deletedBy'> | object => {
  if (!supprimePar.includes(SIGNATURE_COOP)) return {}

  const autres = supprimePar.filter((auteur) => auteur !== SIGNATURE_COOP)

  return {
    deletedBy: autres,
    ...(autres.length === 0 ? { deletedAt: null } : {}),
  }
}

const alignementDeLaSuppression = (
  compte: CompteCoop,
  ligne: LigneDuRegistre,
): Pick<ColonnesAlignees, 'deletedAt' | 'deletedBy'> | object =>
  compte.deleted === null
    ? alignementDeLaSuppressionLevee(ligne.deletedBy ?? [])
    : alignementDeLaSuppressionPosee(
        compte.deleted,
        ligne,
        ligne.deletedBy ?? [],
      )

export const alignementDe = ({
  compte,
  ligne,
  maintenant,
}: {
  readonly compte: CompteCoop
  readonly ligne: LigneDuRegistre
  readonly maintenant: Date
}): Alignement | null => {
  const colonnes: ColonnesAlignees = {
    ...alignementDeLIdentite(compte, ligne),
    ...alignementDuContact(compte, ligne),
    ...alignementDesRoles(compte, ligne),
    ...alignementDeLaSuppression(compte, ligne),
  }

  return Object.keys(colonnes).length === 0
    ? null
    : { ...colonnes, editedBy: SIGNATURE_COOP, updatedAtCoop: maintenant }
}
