import { Prisma } from '@/generated/prisma/client'
import {
  AdresseCourriel,
  type CompteASupprimer,
  CoordinateurId,
  dispositifDe,
  estEnPoste,
  etatDuCompte,
  type IdentiteAnonyme,
  MediateurId,
  rattachements,
  UtilisateurId,
} from '../../domain'
import { enPosteSelect } from './conseiller-numerique-en-poste.where'
import { roleLu } from './role.transfer'

export const compteASupprimerSelect = {
  id: true,
  email: true,
  role: true,
  deleted: true,
  mediateur: { select: { id: true } },
  coordinateur: { select: { id: true } },
  personneMain: { select: enPosteSelect },
} satisfies Prisma.UserSelect

export type CompteASupprimerRow = Prisma.UserGetPayload<{
  select: typeof compteASupprimerSelect
}>

export const compteASupprimerToDomain = (
  row: CompteASupprimerRow,
): CompteASupprimer => ({
  id: UtilisateurId(row.id),
  courriel: AdresseCourriel(row.email),
  role: roleLu(row.role),
  etat: etatDuCompte(row.deleted),
  rattachements: rattachements(
    row.mediateur === null ? null : MediateurId(row.mediateur.id),
    row.coordinateur === null ? null : CoordinateurId(row.coordinateur.id),
  ),
  dispositif: dispositifDe(estEnPoste(row.personneMain)),
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
})
