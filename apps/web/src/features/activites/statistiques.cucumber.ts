import assert from 'node:assert'
import { conseillerNumeriqueSql } from '@app/web/features/employeuse/server'
import { rendezVousAuxStatutsSql } from '@app/web/features/rdvsp/abilities/lister-les-rdvs-des-activites'
import {
  Genre,
  Materiel,
  StatutSocial,
  Thematique,
  TrancheAge,
  TypeLieu,
} from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import { After, type DataTable, Given } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import type { DemandeDeStatistiques } from './db/statistiques.sql'
import {
  CoordinateurId,
  criteresDesStatistiques,
  MediateurId,
  type PerimetreDesStatistiques,
} from './domain'

type Personne = {
  readonly userId: string
  readonly mediateurId: string | null
  readonly coordinateurId: string | null
}

let personnes: Readonly<Record<string, Personne>> = {}
let membres: Readonly<Record<string, readonly string[]>> = {}
let lieux: Readonly<Record<string, string>> = {}
let rendezVous: readonly { id: number; compte: number }[] = []

const PREMIER_IDENTIFIANT_DE_TEST = 970_000_000

const STATUTS_DE_PRESENCE = [
  'unknown',
  'seen',
  'excused',
  'revoked',
  'noshow',
] as const

const semerUnRendezVous = async (
  userId: string,
  cellule: string,
): Promise<number> => {
  const statut = STATUTS_DE_PRESENCE.find((valeur) => valeur === cellule)
  assert.ok(statut, `Statut de rendez-vous inconnu : ${cellule}`)
  const id = PREMIER_IDENTIFIANT_DE_TEST + Math.floor(Math.random() * 1_000_000)
  const compte = await prismaClient.rdvAccount.upsert({
    where: { userId },
    create: { id, userId, accessToken: 'jeton-acces' },
    update: {},
    select: { id: true },
  })
  await prismaClient.rdvOrganisation.create({
    data: { id, name: `Organisation ${id}` },
  })
  const debut = new Date('2026-03-01T09:00:00.000Z')
  await prismaClient.rdv.create({
    data: {
      id,
      uuid: v4(),
      rdvAccountId: compte.id,
      organisationId: id,
      address: '12 rue de la Paix, 75002 Paris',
      startsAt: debut,
      endsAt: new Date(debut.getTime() + 3_600_000),
      durationInMin: 60,
      status: statut,
      collectif: false,
      usersCount: 0,
      urlForAgents: `https://rdv.anct.gouv.fr/admin/rdvs/${id}`,
      rawData: {},
    },
  })
  rendezVous = [...rendezVous, { id, compte: compte.id }]
  return id
}

const personne = (nom: string): Personne => {
  const trouvee = personnes[nom]
  assert.ok(trouvee, `Personne inconnue : ${nom}`)
  return trouvee
}

const mediateurDe = (nom: string): string => {
  const { mediateurId } = personne(nom)
  assert.ok(mediateurId, `${nom} n'est pas médiateur`)
  return mediateurId
}

const semerUnePersonne = async (
  nom: string,
  { mediateur, coordinateur }: { mediateur: boolean; coordinateur: boolean },
): Promise<Personne> => {
  const userId = v4()
  const [firstName, lastName] = nom.split(' ')
  await prismaClient.user.create({
    data: {
      id: userId,
      email: `statistiques-${userId}@example.com`,
      firstName,
      lastName,
    },
  })
  const mediateurId = mediateur
    ? (
        await prismaClient.mediateur.create({
          data: { userId },
          select: { id: true },
        })
      ).id
    : null
  const coordinateurId = coordinateur
    ? (
        await prismaClient.coordinateur.create({
          data: { userId },
          select: { id: true },
        })
      ).id
    : null
  const semee = { userId, mediateurId, coordinateurId }
  personnes = { ...personnes, [nom]: semee }
  return semee
}

const lieuNomme = async (nom: string): Promise<string> => {
  const existant = lieux[nom]
  if (existant) return existant
  const { id } = await prismaClient.lieuInclusion.create({
    data: {
      nom,
      adresse: '1 rue du Test',
      commune: 'Lyon',
      codePostal: '69001',
      codeInsee: '69381',
    },
    select: { id: true },
  })
  lieux = { ...lieux, [nom]: id }
  return id
}

const TYPE_EN_BASE: Readonly<Record<string, 'Individuel' | 'Collectif'>> = {
  individuel: 'Individuel',
  collectif: 'Collectif',
}

const valeurDe =
  <T extends string>(enumeration: Readonly<Record<string, T>>) =>
  (cellule: string | undefined): T | null =>
    Object.values(enumeration).find((valeur) => valeur === cellule) ?? null

const listeDe =
  <T extends string>(enumeration: Readonly<Record<string, T>>) =>
  (cellule: string | undefined): T[] =>
    (cellule ?? '')
      .split(',')
      .map((valeur) => valeur.trim())
      .flatMap((valeur) => {
        const lue = valeurDe(enumeration)(valeur)
        return lue === null ? [] : [lue]
      })

const nombre = (cellule: string | undefined, defaut: number): number =>
  cellule === undefined || cellule === '' ? defaut : Number(cellule)

const semerUneActivite = async (
  { userId, mediateurId }: { userId: string; mediateurId: string },
  ligne: Readonly<Record<string, string>>,
) => {
  const anonymes = nombre(ligne.anonymes, ligne.suivis ? 0 : 1)
  const suivis = nombre(ligne.suivis, 0)
  const participants = [
    ...Array.from({ length: anonymes }, () => true),
    ...Array.from({ length: suivis }, () => false),
  ]
  const typeLieu = ligne.lieu
    ? TypeLieu.LieuActivite
    : (valeurDe(TypeLieu)(ligne.typeLieu) ?? TypeLieu.ADistance)
  await prismaClient.activite.create({
    data: {
      mediateurId,
      type: TYPE_EN_BASE[ligne.type ?? 'individuel'] ?? 'Individuel',
      typeLieu,
      structureId: ligne.lieu ? await lieuNomme(ligne.lieu) : null,
      date: new Date(`${ligne.date}T00:00:00.000Z`),
      duree: nombre(ligne.duree, 60),
      thematiques: listeDe(Thematique)(ligne.thematiques ?? 'Email'),
      materiel: listeDe(Materiel)(ligne.materiel),
      accompagnementsCount: participants.length,
      suppression: ligne.supprimee === 'oui' ? new Date() : null,
      v1CraId: ligne.v1 === 'oui' ? v4() : null,
      rdvId: ligne.rendezVous
        ? await semerUnRendezVous(userId, ligne.rendezVous)
        : null,
      accompagnements: {
        create: participants.map((anonyme) => ({
          premierAccompagnement: ligne.nouveaux !== 'non',
          beneficiaire: {
            create: {
              mediateurId,
              anonyme,
              prenom: anonyme ? null : 'Suivi',
              nom: anonyme ? null : 'Statistiques',
              genre: valeurDe(Genre)(ligne.genre),
              trancheAge: valeurDe(TrancheAge)(ligne.trancheAge),
              statutSocial: valeurDe(StatutSocial)(ligne.statutSocial),
              commune: ligne.residence || null,
              communeCodePostal: ligne.residence ? ligne.codePostal : null,
              communeCodeInsee: ligne.residence ? ligne.codeInsee : null,
            },
          },
        })),
      },
    },
  })
}

Given('la médiatrice {string}', async (nom: string) => {
  await semerUnePersonne(nom, { mediateur: true, coordinateur: false })
})

Given('le coordinateur {string}', async (nom: string) => {
  await semerUnePersonne(nom, { mediateur: false, coordinateur: true })
})

Given(
  '{string} est membre de l’équipe de {string}',
  async (membre: string, coordinateur: string) => {
    await prismaClient.mediateurCoordonne.create({
      data: {
        coordinateurId: personne(coordinateur).coordinateurId ?? '',
        mediateurId: mediateurDe(membre),
      },
    })
    membres = {
      ...membres,
      [coordinateur]: [...(membres[coordinateur] ?? []), mediateurDe(membre)],
    }
  },
)

Given(
  '{string} a quitté l’équipe de {string} le {string}',
  async (membre: string, coordinateur: string, jour: string) => {
    await prismaClient.mediateurCoordonne.create({
      data: {
        coordinateurId: personne(coordinateur).coordinateurId ?? '',
        mediateurId: mediateurDe(membre),
        suppression: new Date(`${jour}T00:00:00.000Z`),
      },
    })
    membres = {
      ...membres,
      [coordinateur]: [...(membres[coordinateur] ?? []), mediateurDe(membre)],
    }
  },
)

Given(
  'les activités de {string} :',
  async (nom: string, activites: DataTable) => {
    const semee = {
      userId: personne(nom).userId,
      mediateurId: mediateurDe(nom),
    }
    await activites
      .hashes()
      .reduce(
        (precedente: Promise<void>, ligne) =>
          precedente.then(() => semerUneActivite(semee, ligne)),
        Promise.resolve(),
      )
  },
)

export const perimetreDe = (nom: string): PerimetreDesStatistiques => {
  const { mediateurId, coordinateurId } = personne(nom)
  return coordinateurId === null
    ? { type: 'Mediateur', mediateur: MediateurId(mediateurDe(nom)) }
    : {
        type: 'Equipe',
        coordinateur: CoordinateurId(coordinateurId),
        membres: [
          ...(mediateurId === null ? [] : [mediateurId]),
          ...(membres[nom] ?? []),
        ].map((id) => MediateurId(id)),
      }
}

export const demandeDeStatistiques = (
  nom: string,
  parametres: Readonly<Record<string, string>> = {},
): DemandeDeStatistiques => ({
  perimetre: perimetreDe(nom),
  criteres: criteresDesStatistiques(parametres),
  conseillersNumeriques: conseillerNumeriqueSql,
  rendezVousAuxStatuts: rendezVousAuxStatutsSql,
})

export const parametresDuTableau = (
  criteres: DataTable,
): Readonly<Record<string, string>> =>
  Object.fromEntries(
    Object.entries(criteres.rowsHash()).map(([cle, valeur]) => [
      cle,
      valeur
        .split(',')
        .map((element) => element.trim())
        .map((element) =>
          personnes[element]?.mediateurId
            ? personnes[element].mediateurId
            : element,
        )
        .join(','),
    ]),
  )

After(async () => {
  const semees = Object.values(personnes)
  const lieuxSemes = Object.values(lieux)
  const rendezVousSemes = rendezVous
  rendezVous = []
  personnes = {}
  membres = {}
  lieux = {}
  if (semees.length === 0) return
  const mediateurIds = semees.flatMap(({ mediateurId }) =>
    mediateurId === null ? [] : [mediateurId],
  )
  const coordinateurIds = semees.flatMap(({ coordinateurId }) =>
    coordinateurId === null ? [] : [coordinateurId],
  )
  await prismaClient.mediateurCoordonne.deleteMany({
    where: { coordinateurId: { in: coordinateurIds } },
  })
  await prismaClient.accompagnement.deleteMany({
    where: { activite: { mediateurId: { in: mediateurIds } } },
  })
  await prismaClient.activite.deleteMany({
    where: { mediateurId: { in: mediateurIds } },
  })
  await prismaClient.beneficiaire.deleteMany({
    where: { mediateurId: { in: mediateurIds } },
  })
  await prismaClient.rdv.deleteMany({
    where: { id: { in: rendezVousSemes.map(({ id }) => id) } },
  })
  await prismaClient.rdvOrganisation.deleteMany({
    where: { id: { in: rendezVousSemes.map(({ id }) => id) } },
  })
  await prismaClient.rdvAccount.deleteMany({
    where: { id: { in: rendezVousSemes.map(({ compte }) => compte) } },
  })
  await prismaClient.lieuInclusion.deleteMany({
    where: { id: { in: lieuxSemes } },
  })
  await prismaClient.mediateur.deleteMany({
    where: { id: { in: mediateurIds } },
  })
  await prismaClient.coordinateur.deleteMany({
    where: { id: { in: coordinateurIds } },
  })
  await prismaClient.user.deleteMany({
    where: { id: { in: semees.map(({ userId }) => userId) } },
  })
})
