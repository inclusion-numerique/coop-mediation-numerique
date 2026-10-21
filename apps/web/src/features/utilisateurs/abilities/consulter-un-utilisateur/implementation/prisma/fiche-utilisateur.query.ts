import {
  personneConseillerNumeriqueSelect,
  personneEstConseillerNumerique,
} from '@app/web/features/employeuse/server'
import { ProfilInscription } from '@app/web/features/inscription/domain'
import {
  AdresseCourriel,
  CoordinateurId,
  coordinateurEstVierge,
  cycleDeVie,
  dispositifDe,
  jalon,
  MediateurId,
  mediateurEstVierge,
  nomAffiche,
  Prenom,
  RoleUtilisateur,
  rattachements,
  statutDe,
  telephoneEnregistrable,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import type { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import type { FicheUtilisateur } from '../../domain'

const ficheSelect = {
  id: true,
  firstName: true,
  lastName: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  siret: true,
  created: true,
  inscriptionValidee: true,
  deleted: true,
  profilInscription: true,
  lastLogin: true,
  lastSeen: true,
  mediateur: {
    select: {
      id: true,
      creation: true,
      modification: true,
      isVisible: true,
      beneficiairesCount: true,
      activitesCount: true,
      derniereCreationActivite: true,
      derniereCreationBeneficiaire: true,
      _count: {
        select: { enActivite: true, activites: true, beneficiaires: true },
      },
      coordinations: {
        where: { suppression: null },
        select: {
          coordinateur: {
            select: { user: { select: { id: true, name: true } } },
          },
        },
      },
    },
  },
  coordinateur: {
    select: {
      id: true,
      creation: true,
      modification: true,
      derniereCreationActivite: true,
      _count: {
        select: {
          mediateursCoordonnes: { where: { suppression: null } },
          ActiviteCoordination: true,
          invitations: { where: { acceptee: null, refusee: null } },
        },
      },
    },
  },
  accounts: { select: { provider: true, providerAccountId: true } },
  sessions: { select: { expires: true }, orderBy: { expires: 'desc' } },
  mutations: {
    select: { nom: true, timestamp: true },
    orderBy: { timestamp: 'desc' },
  },
  uploads: {
    select: { name: true, created: true },
    orderBy: { created: 'desc' },
  },
  personneMain: { select: personneConseillerNumeriqueSelect },
} satisfies Prisma.UserSelect

type FicheRow = Prisma.UserGetPayload<{ select: typeof ficheSelect }>

const versFiche = (row: FicheRow, maintenant: Date): FicheUtilisateur => {
  const role = RoleUtilisateur(row.role)
  const derniereVisite = jalon(row.lastSeen)

  return {
    id: UtilisateurId(row.id),
    nomAffiche: nomAffiche({
      prenom: row.firstName,
      nom: row.lastName,
      nomComplet: row.name,
      courriel: row.email,
    }),
    prenom: Prenom.safe(row.firstName ?? ''),
    nom: row.lastName,
    courriel: AdresseCourriel(row.email),
    telephone: telephoneEnregistrable(row.phone),
    role,
    dispositif: dispositifDe(personneEstConseillerNumerique(row.personneMain)),
    siret: row.siret,
    creeLe: row.created,
    inscritLe: row.inscriptionValidee,
    supprimeLe: row.deleted,
    profilInscription:
      row.profilInscription === null
        ? null
        : ProfilInscription(row.profilInscription),
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
    rattachements: rattachements(
      row.mediateur === null
        ? null
        : {
            id: MediateurId(row.mediateur.id),
            creeLe: row.mediateur.creation,
            modifieLe: row.mediateur.modification,
            beneficiaires: row.mediateur.beneficiairesCount,
            activites: row.mediateur.activitesCount,
            lieuxActivite: row.mediateur._count.enActivite,
            visible: row.mediateur.isVisible,
            retirable: mediateurEstVierge({
              activites: row.mediateur._count.activites > 0,
              beneficiaires: row.mediateur._count.beneficiaires > 0,
            }),
            coordinations: row.mediateur.coordinations.map(
              ({ coordinateur }) => ({
                coordinateurUtilisateurId: UtilisateurId(coordinateur.user.id),
                nom: coordinateur.user.name,
              }),
            ),
          },
      row.coordinateur === null
        ? null
        : {
            id: CoordinateurId(row.coordinateur.id),
            creeLe: row.coordinateur.creation,
            modifieLe: row.coordinateur.modification,
            mediateursCoordonnes: row.coordinateur._count.mediateursCoordonnes,
            retirable: coordinateurEstVierge({
              equipe: row.coordinateur._count.mediateursCoordonnes > 0,
              activitesCoordination:
                row.coordinateur._count.ActiviteCoordination > 0,
              invitationsEnAttente: row.coordinateur._count.invitations > 0,
            }),
          },
    ),
    liaisons: row.accounts.map(({ provider, providerAccountId }) => ({
      fournisseur: provider,
      identifiant: providerAccountId,
    })),
    sessions: row.sessions.map(({ expires }) => ({
      libelle: 'Session',
      le: expires,
    })),
    mutations: row.mutations.map(({ nom, timestamp }) => ({
      libelle: nom,
      le: timestamp,
    })),
    fichiers: row.uploads.map(({ name, created }) => ({
      libelle: name,
      le: created,
    })),
  }
}

export const ficheUtilisateur = async ({
  utilisateurId,
  maintenant,
}: {
  readonly utilisateurId: string
  readonly maintenant: Date
}): Promise<FicheUtilisateur | null> => {
  const id = UtilisateurId.safe(utilisateurId)
  if (id === null) return null

  const row = await prismaClient.user.findUnique({
    where: { id },
    select: ficheSelect,
  })

  return row === null ? null : versFiche(row, maintenant)
}
