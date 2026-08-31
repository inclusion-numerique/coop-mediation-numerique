import { Prisma } from '@prisma/client'
import {
  type AccesFournisseur,
  AdresseCourriel,
  type CompteASupprimer,
  CoordinateurId,
  type EtatCompte,
  FournisseurIdentite,
  IdentifiantFournisseur,
  type IdentiteAnonyme,
  type LiaisonProConnect,
  MediateurId,
  type RattachementsDuCompte,
  RoleUtilisateur,
  UtilisateurId,
} from '../domain'

/**
 * Ce que l'effacement a besoin de lire d'un compte — et rien de plus.
 *
 * Ni nom, ni téléphone, ni avatar : ils ne sont jamais lus, seulement écrasés.
 * Ni la valeur des jetons : leur seul état utile est « y en a-t-il un vivant »,
 * dérivé ci-dessous. On ne ramène pas en mémoire ce qu'on vient effacer.
 */
export const compteASupprimerSelect = {
  id: true,
  email: true,
  role: true,
  deleted: true,
  mediateur: { select: { id: true } },
  coordinateur: { select: { id: true } },
  accounts: {
    select: {
      provider: true,
      providerAccountId: true,
      access_token: true,
      refresh_token: true,
      id_token: true,
      expires_at: true,
      session_state: true,
    },
  },
} satisfies Prisma.UserSelect

export type CompteASupprimerRow = Prisma.UserGetPayload<{
  select: typeof compteASupprimerSelect
}>

type LiaisonRow = CompteASupprimerRow['accounts'][number]

const accesToDomain = (row: LiaisonRow): AccesFournisseur =>
  row.access_token === null &&
  row.refresh_token === null &&
  row.id_token === null &&
  row.expires_at === null &&
  row.session_state === null
    ? { _tag: 'revoque' }
    : { _tag: 'actif' }

const liaisonToDomain = (row: LiaisonRow): LiaisonProConnect => ({
  fournisseur: FournisseurIdentite(row.provider),
  identifiantChezLeFournisseur: IdentifiantFournisseur(row.providerAccountId),
  acces: accesToDomain(row),
})

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
  liaisons: row.accounts.map(liaisonToDomain),
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

/**
 * La révocation d'une liaison.
 *
 * Le payload ne contient QUE les cinq colonnes de jetons : ni `provider`, ni
 * `providerAccountId`. L'invariant de résurrection — la ligne survit, sa clé
 * d'identification aussi — est tenu par la forme de ce type, pas par un
 * commentaire ou une revue. Et c'est un `update`, jamais un `delete`.
 */
export const liaisonRevoqueeFromDomain =
  (): Prisma.AccountUpdateManyMutationInput => ({
    access_token: null,
    refresh_token: null,
    id_token: null,
    expires_at: null,
    session_state: null,
  })
