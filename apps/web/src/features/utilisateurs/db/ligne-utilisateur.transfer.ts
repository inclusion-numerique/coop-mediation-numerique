import {
  personneEmployeuseSelect,
  personneEstConseillerNumerique,
  personneToEmployeuseActuelle,
} from '@app/web/features/employeuse/server'
import type { Prisma } from '@app/web/generated/prisma/client'
import {
  AdresseCourriel,
  type CoordinateurDeLaLigne,
  cycleDeVie,
  dispositifDe,
  type EmployeuseDeLaLigne,
  jalon,
  type LigneUtilisateur,
  type MediateurDeLaLigne,
  RoleUtilisateur,
  rattachements,
  statutDe,
  UtilisateurId,
} from '../domain'

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
  personneMain: { select: personneEmployeuseSelect },
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
  maintenant: Date,
): EmployeuseDeLaLigne | null => {
  const actuelle = personneToEmployeuseActuelle(personne, maintenant)

  return actuelle === null
    ? null
    : {
        nom: actuelle.employeuse.denomination,
        codeInsee: actuelle.employeuse.adresse?.codeInsee ?? null,
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
  const role = RoleUtilisateur(row.role)
  const derniereVisite = jalon(row.lastSeen)

  return {
    id: UtilisateurId(row.id),
    nomComplet: row.name,
    prenom: row.firstName,
    nom: row.lastName,
    courriel: AdresseCourriel(row.email),
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
    dispositif: dispositifDe(personneEstConseillerNumerique(row.personneMain)),
    employeuse: employeuseToDomain(row.personneMain, maintenant),
  }
}
