import {
  personneConseillerNumeriqueSelect,
  personneEstConseillerNumerique,
} from '@app/web/features/employeuse/server'
import { Prisma } from '@app/web/generated/prisma/client'
import {
  AdresseCourriel,
  type CompteASupprimer,
  CoordinateurId,
  dispositifDe,
  etatDuCompte,
  type IdentiteAnonyme,
  MediateurId,
  RoleUtilisateur,
  rattachements,
  UtilisateurId,
} from '../domain'

export const compteASupprimerSelect = {
  id: true,
  email: true,
  role: true,
  deleted: true,
  mediateur: { select: { id: true } },
  coordinateur: { select: { id: true } },
  personneMain: { select: personneConseillerNumeriqueSelect },
} satisfies Prisma.UserSelect

export type CompteASupprimerRow = Prisma.UserGetPayload<{
  select: typeof compteASupprimerSelect
}>

export const compteASupprimerToDomain = (
  row: CompteASupprimerRow,
): CompteASupprimer => ({
  id: UtilisateurId(row.id),
  courriel: AdresseCourriel(row.email),
  role: RoleUtilisateur(row.role),
  etat: etatDuCompte(row.deleted),
  rattachements: rattachements(
    row.mediateur === null ? null : MediateurId(row.mediateur.id),
    row.coordinateur === null ? null : CoordinateurId(row.coordinateur.id),
  ),
  dispositif: dispositifDe(personneEstConseillerNumerique(row.personneMain)),
})

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
})
