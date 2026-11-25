import type { Prisma } from '@/generated/prisma/client'
import { CodeInsee } from '@/libraries/insee'
import {
  type CoordinateurDeLaLigne,
  cycleDeVie,
  dispositifDe,
  type EmployeuseDeLaLigne,
  estEnPoste,
  jalon,
  type LigneUtilisateur,
  type MediateurDeLaLigne,
  NomEmployeuse,
  nomAffiche,
  rattachements,
  statutDe,
  UtilisateurId,
} from '../../domain'
import { enPosteSelect } from './conseiller-numerique-en-poste.where'
import { identiteToDomain } from './identite.transfer'
import { roleLu } from './role.transfer'

export const ligneUtilisateurSelect = {
  id: true,
  name: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  created: true,
  deleted: true,
  inscriptionValidee: true,
  lastLogin: true,
  lastSeen: true,
  mediateur: {
    select: {
      derniereCreationActivite: true,
      derniereCreationBeneficiaire: true,
      accompagnementsCount: true,
      beneficiairesCount: true,
      _count: { select: { enActivite: true } },
    },
  },
  coordinateur: {
    select: {
      derniereCreationActivite: true,
      _count: {
        select: { mediateursCoordonnes: { where: { suppression: null } } },
      },
    },
  },
  personneMain: {
    select: {
      employeuseActuelle: { select: { nom: true, codeInsee: true } },
      ...enPosteSelect,
    },
  },
} satisfies Prisma.UserSelect

export type LigneUtilisateurRow = Prisma.UserGetPayload<{
  select: typeof ligneUtilisateurSelect
}>

const mediateurToDomain = (
  mediateur: NonNullable<LigneUtilisateurRow['mediateur']>,
): MediateurDeLaLigne => ({
  derniereActivite: jalon(mediateur.derniereCreationActivite),
  dernierBeneficiaire: jalon(mediateur.derniereCreationBeneficiaire),
  accompagnements: mediateur.accompagnementsCount,
  beneficiaires: mediateur.beneficiairesCount,
  lieuxActivite: mediateur._count.enActivite,
})

const coordinateurToDomain = (
  coordinateur: NonNullable<LigneUtilisateurRow['coordinateur']>,
): CoordinateurDeLaLigne => ({
  aCoordonne: coordinateur.derniereCreationActivite !== null,
  mediateursCoordonnes: coordinateur._count.mediateursCoordonnes,
})

const employeuseToDomain = (
  personne: LigneUtilisateurRow['personneMain'],
): EmployeuseDeLaLigne | null => {
  const actuelle = personne?.employeuseActuelle

  return actuelle == null
    ? null
    : {
        nom: NomEmployeuse.safe(actuelle.nom ?? ''),
        codeInsee: CodeInsee.safe(actuelle.codeInsee ?? ''),
      }
}

export const ligneUtilisateurToDomain = (
  row: LigneUtilisateurRow,
  maintenant: Date,
): LigneUtilisateur => {
  const rattache = rattachements(
    row.mediateur === null ? null : mediateurToDomain(row.mediateur),
    row.coordinateur === null ? null : coordinateurToDomain(row.coordinateur),
  )
  const role = roleLu(row.role)
  const derniereVisite = jalon(row.lastSeen)
  const identite = identiteToDomain(row)

  return {
    id: UtilisateurId(row.id),
    nomAffiche: nomAffiche(identite),
    prenom: identite.prenom,
    nom: identite.nom,
    courriel: identite.courriel,
    role,
    creeLe: row.created,
    derniereConnexion: jalon(row.lastLogin),
    derniereVisite,
    statut: statutDe(
      {
        role,
        cycle: cycleDeVie({
          creeLe: row.created,
          inscritLe: row.inscriptionValidee,
          supprimeLe: row.deleted,
        }),
        activite: {
          rattachements: rattachements(
            row.mediateur === null
              ? null
              : {
                  derniereActivite: jalon(
                    row.mediateur.derniereCreationActivite,
                  ),
                  dernierBeneficiaire: jalon(
                    row.mediateur.derniereCreationBeneficiaire,
                  ),
                },
            row.coordinateur === null
              ? null
              : {
                  aUneEquipe: row.coordinateur._count.mediateursCoordonnes > 0,
                  aCoordonne:
                    row.coordinateur.derniereCreationActivite !== null,
                },
          ),
          derniereVisite,
        },
      },
      maintenant,
    ),
    rattachements: rattache,
    dispositif: dispositifDe(estEnPoste(row.personneMain)),
    employeuse: employeuseToDomain(row.personneMain),
  }
}
