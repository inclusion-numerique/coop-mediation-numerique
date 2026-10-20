import { Prisma } from '@app/web/generated/prisma/client'
import {
  AdresseCourriel,
  type CompteASupprimer,
  CoordinateurId,
  type EtatCompte,
  type IdentiteAnonyme,
  MediateurId,
  type RattachementsDuCompte,
  RoleUtilisateur,
  UtilisateurId,
} from '../domain'

/**
 * Ce que l'effacement a besoin de lire d'un compte — et rien de plus.
 *
 * Ni nom, ni téléphone, ni avatar : ils ne sont jamais lus, seulement écrasés.
 * On ne ramène pas en mémoire ce qu'on vient effacer.
 */
export const compteASupprimerSelect = {
  id: true,
  email: true,
  role: true,
  deleted: true,
  mediateur: { select: { id: true } },
  coordinateur: { select: { id: true } },
} satisfies Prisma.UserSelect

export type CompteASupprimerRow = Prisma.UserGetPayload<{
  select: typeof compteASupprimerSelect
}>

const etatToDomain = (deleted: Date | null): EtatCompte =>
  deleted === null ? { _tag: 'actif' } : { _tag: 'supprime', depuis: deleted }

const rattachementsToDomain = (
  mediateur: { id: string } | null,
  coordinateur: { id: string } | null,
): RattachementsDuCompte => {
  if (mediateur !== null && coordinateur !== null)
    return {
      _tag: 'mediateurEtCoordinateur',
      mediateurId: MediateurId(mediateur.id),
      coordinateurId: CoordinateurId(coordinateur.id),
    }

  if (mediateur !== null)
    return { _tag: 'mediateur', mediateurId: MediateurId(mediateur.id) }

  if (coordinateur !== null)
    return {
      _tag: 'coordinateur',
      coordinateurId: CoordinateurId(coordinateur.id),
    }

  return { _tag: 'aucun' }
}

export const compteASupprimerToDomain = (
  row: CompteASupprimerRow,
): CompteASupprimer => ({
  id: UtilisateurId(row.id),
  courriel: AdresseCourriel(row.email),
  role: RoleUtilisateur(row.role),
  etat: etatToDomain(row.deleted),
  rattachements: rattachementsToDomain(row.mediateur, row.coordinateur),
})

/**
 * L'écriture d'anonymisation sur `users`.
 *
 * Elle porte l'identité anonyme ET l'effacement des résidus qui n'en font pas
 * partie mais désignent tout autant la personne : téléphone, SIRET, avatar,
 * localisation, titre, description.
 */
export const identiteAnonymeFromDomain = (
  identite: IdentiteAnonyme,
  supprimeLe: Date,
): Prisma.UserUpdateInput => ({
  deleted: supprimeLe,
  email: identite.courriel,
  firstName: identite.prenom,
  lastName: identite.nom,
  name: identite.nomComplet,
  phone: null,
  siret: null,
  location: null,
  title: null,
  description: null,
  image: { disconnect: true },
})
