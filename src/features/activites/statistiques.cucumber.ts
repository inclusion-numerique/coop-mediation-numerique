import assert from 'node:assert'
import { After, type DataTable, Given } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { criteresDesStatistiquesDepuisLURL } from '@/features/activites/fixtures/criteres-depuis-l-url'
import {
  Genre,
  Materiel,
  Prisma,
  StatutSocial,
  Thematique,
  TrancheAge,
  TypeLieu,
} from '@/generated/prisma/client'
import {
  CoordinateurId,
  MediateurId,
  type PerimetreDesStatistiques,
} from './domain'
import type { DemandeDeStatistiques } from './implementations/prisma/statistiques/statistiques.sql'

type Personne = {
  readonly userId: string
  readonly mediateurId: string | null
  readonly coordinateurId: string | null
}

const etat: {
  personnes: Readonly<Record<string, Personne>>
  membres: Readonly<Record<string, readonly string[]>>
  lieux: Readonly<Record<string, string>>
  rendezVous: readonly { id: number; compte: number; statut: string }[]
  tags: Readonly<Record<string, string>>
  employeuses: Readonly<Record<string, number>>
} = {
  personnes: {},
  membres: {},
  lieux: {},
  rendezVous: [],
  tags: {},
  employeuses: {},
}

const employeuseNommee = async (nom: string): Promise<number> => {
  const existante = etat.employeuses[nom]
  if (existante) return existante
  const { id } = await prismaClient.structureAdministrativeMain.create({
    data: { denominationAntenne: nom },
    select: { id: true },
  })
  etat.employeuses = { ...etat.employeuses, [nom]: id }
  return id
}

const tagNomme = async (nom: string, mediateurId: string): Promise<string> => {
  const existant = etat.tags[nom]
  if (existant) return existant
  const { id } = await prismaClient.tag.create({
    data: { nom, mediateurId },
    select: { id: true },
  })
  etat.tags = { ...etat.tags, [nom]: id }
  return id
}

export const tagSeme = (nom: string): string => {
  const id = etat.tags[nom]
  assert.ok(id, `Tag inconnu : ${nom}`)
  return id
}

export const lieuSeme = (nom: string): string => {
  const id = etat.lieux[nom]
  assert.ok(id, `Lieu inconnu : ${nom}`)
  return id
}

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
  etat.rendezVous = [...etat.rendezVous, { id, compte: compte.id, statut }]
  return id
}

const personne = (nom: string): Personne => {
  const trouvee = etat.personnes[nom]
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
      ...(firstName === undefined ? {} : { firstName }),
      ...(lastName === undefined ? {} : { lastName }),
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
  etat.personnes = { ...etat.personnes, [nom]: semee }
  return semee
}

const lieuNomme = async (nom: string): Promise<string> => {
  const existant = etat.lieux[nom]
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
  etat.lieux = { ...etat.lieux, [nom]: id }
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

const communeDuLieu = (cellule: string | undefined) => {
  const [lieuCommune, lieuCodePostal, lieuCodeInsee] = (cellule ?? '').split(
    ' ',
  )
  return lieuCommune
    ? {
        lieuCommune,
        ...(lieuCodePostal === undefined ? {} : { lieuCodePostal }),
        ...(lieuCodeInsee === undefined ? {} : { lieuCodeInsee }),
      }
    : {}
}

const semerUneActivite = async (
  { userId, mediateurId }: { userId: string; mediateurId: string },
  ligne: Readonly<Record<string, string>>,
) => {
  const {
    anonymes,
    suivis,
    lieu,
    typeLieu,
    tags,
    type,
    date,
    duree,
    thematiques,
    materiel,
    supprimee,
    v1,
    employeuse,
    communeDuLieu: communeEtCodes,
    rendezVous,
    nouveaux,
    genre,
    anneeNaissance,
    trancheAge,
    statutSocial,
    residence,
    codePostal,
    codeInsee,
  } = ligne
  const nombreDAnonymes = nombre(anonymes, suivis ? 0 : 1)
  const nombreDeSuivis = nombre(suivis, 0)
  const participants = [
    ...Array.from({ length: nombreDAnonymes }, () => true),
    ...Array.from({ length: nombreDeSuivis }, () => false),
  ]
  const typeDeLieu = lieu
    ? TypeLieu.LieuActivite
    : (valeurDe(TypeLieu)(typeLieu) ?? TypeLieu.ADistance)
  const tagIds = await Promise.all(
    (tags ?? '')
      .split(',')
      .map((nom) => nom.trim())
      .filter((nom) => nom !== '')
      .map((nom) => tagNomme(nom, mediateurId)),
  )
  await prismaClient.activite.create({
    data: {
      mediateurId,
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
      type: TYPE_EN_BASE[type ?? 'individuel'] ?? 'Individuel',
      typeLieu: typeDeLieu,
      structureId: lieu ? await lieuNomme(lieu) : null,
      date: new Date(`${date}T00:00:00.000Z`),
      duree: nombre(duree, 60),
      thematiques: listeDe(Thematique)(thematiques ?? 'Email'),
      materiel: listeDe(Materiel)(materiel),
      suppression: supprimee === 'oui' ? new Date() : null,
      v1CraId: v1 === 'oui' ? v4() : null,
      structureEmployeuseMainId: employeuse
        ? await employeuseNommee(employeuse)
        : null,
      ...communeDuLieu(communeEtCodes),
      rdvId: rendezVous ? await semerUnRendezVous(userId, rendezVous) : null,
      accompagnements: {
        create: participants.map((anonyme) => ({
          premierAccompagnement: nouveaux !== 'non',
          beneficiaire: {
            create: {
              mediateurId,
              anonyme,
              prenom: anonyme ? null : 'Suivi',
              nom: anonyme ? null : 'Statistiques',
              genre: valeurDe(Genre)(genre),
              anneeNaissance: anneeNaissance ? Number(anneeNaissance) : null,
              trancheAge: valeurDe(TrancheAge)(trancheAge),
              statutSocial: valeurDe(StatutSocial)(statutSocial),
              commune: residence || null,
              communeCodePostal: residence ? (codePostal ?? null) : null,
              communeCodeInsee: residence ? (codeInsee ?? null) : null,
            },
          },
        })),
      },
    },
  })
}

Given('le tag {string} est supprimé', async (nom: string) => {
  await prismaClient.tag.update({
    where: { id: tagSeme(nom) },
    data: { suppression: new Date() },
  })
})

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
    etat.membres = {
      ...etat.membres,
      [coordinateur]: [
        ...(etat.membres[coordinateur] ?? []),
        mediateurDe(membre),
      ],
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
    etat.membres = {
      ...etat.membres,
      [coordinateur]: [
        ...(etat.membres[coordinateur] ?? []),
        mediateurDe(membre),
      ],
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
          ...(etat.membres[nom] ?? []),
        ].map((id) => MediateurId(id)),
      }
}

const rendezVousSemesAuxStatuts = (statuts: readonly string[]) => {
  const ids = etat.rendezVous
    .filter(({ statut }) => statuts.includes(statut))
    .map(({ id }) => id)
  return Prisma.sql`SELECT unnest(${ids}::int[])`
}

export const demandeDeStatistiques = (
  nom: string,
  parametres: Readonly<Record<string, string>> = {},
): DemandeDeStatistiques => ({
  perimetre: perimetreDe(nom),
  criteres: criteresDesStatistiquesDepuisLURL(parametres),
  rendezVousAuxStatuts: rendezVousSemesAuxStatuts,
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
          etat.personnes[element]?.mediateurId
            ? etat.personnes[element].mediateurId
            : element,
        )
        .join(','),
    ]),
  )

After(async () => {
  const semees = Object.values(etat.personnes)
  const lieuxSemes = Object.values(etat.lieux)
  const rendezVousSemes = etat.rendezVous
  etat.rendezVous = []
  const tagsSemes = Object.values(etat.tags)
  etat.tags = {}
  const employeusesSemees = Object.values(etat.employeuses)
  etat.employeuses = {}
  etat.personnes = {}
  etat.membres = {}
  etat.lieux = {}
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
  await prismaClient.activitesTags.deleteMany({
    where: { activite: { mediateurId: { in: mediateurIds } } },
  })
  await prismaClient.activite.deleteMany({
    where: { mediateurId: { in: mediateurIds } },
  })
  await prismaClient.beneficiaire.deleteMany({
    where: { mediateurId: { in: mediateurIds } },
  })
  await prismaClient.tag.deleteMany({ where: { id: { in: tagsSemes } } })
  await prismaClient.structureAdministrativeMain.deleteMany({
    where: { id: { in: employeusesSemees } },
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
