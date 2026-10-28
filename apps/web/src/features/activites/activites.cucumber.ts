import { prismaClient } from '@app/web/prismaClient'
import { After, setDefaultTimeout } from '@cucumber/cucumber'
import { v4 } from 'uuid'

setDefaultTimeout(60_000)

/**
 * Support Cucumber de la feature activités.
 *
 * L'effacement des notes porte sur tous les comptes rendus d'une personne : il
 * lui faut un compte jetable, isolé des scénarios qui partagent les fixtures.
 */
type ComptesRendusSemes = {
  readonly userId: string
  readonly mediateurId: string
  readonly coordinateurId: string
}

let comptesRendus: ComptesRendusSemes | undefined

export const comptesRendusSemes = (): ComptesRendusSemes => {
  if (!comptesRendus) throw new Error('Aucun compte rendu semé')
  return comptesRendus
}

export const semerComptesRendus = async (): Promise<ComptesRendusSemes> => {
  const userId = v4()

  await prismaClient.user.create({
    data: { id: userId, email: `notes-${userId}@example.com` },
  })

  const mediateur = await prismaClient.mediateur.create({
    data: { userId },
    select: { id: true },
  })
  const coordinateur = await prismaClient.coordinateur.create({
    data: { userId },
    select: { id: true },
  })

  await prismaClient.activite.createMany({
    data: [1, 2].map((rang) => ({
      mediateurId: mediateur.id,
      type: 'Individuel' as const,
      typeLieu: 'Autre' as const,
      date: new Date(`2026-06-0${rang}`),
      duree: 60,
      accompagnementsCount: 0,
      notes: `Compte rendu ${rang} avec des éléments personnels`,
    })),
  })

  await prismaClient.activiteCoordination.create({
    data: {
      coordinateurId: coordinateur.id,
      type: 'Animation',
      date: new Date('2026-06-03'),
      notes: 'Note de coordination avec des éléments personnels',
    },
  })

  comptesRendus = {
    userId,
    mediateurId: mediateur.id,
    coordinateurId: coordinateur.id,
  }

  return comptesRendus
}

After(async () => {
  const semé = comptesRendus
  comptesRendus = undefined
  if (!semé) return

  await prismaClient.activite.deleteMany({
    where: { mediateurId: semé.mediateurId },
  })
  await prismaClient.activiteCoordination.deleteMany({
    where: { coordinateurId: semé.coordinateurId },
  })
  await prismaClient.coordinateur.deleteMany({
    where: { id: semé.coordinateurId },
  })
  await prismaClient.mediateur.deleteMany({ where: { id: semé.mediateurId } })
  await prismaClient.user.deleteMany({ where: { id: semé.userId } })
})

const crasV1Semes = new Set<string>()

export const semerUnCraV1 = async (
  createdAt: Date,
): Promise<{ readonly id: string; readonly createdAt: Date }> => {
  const id = v4()

  await prismaClient.craConseillerNumeriqueV1.create({
    data: {
      id,
      importedAt: new Date(),
      v1ConseillerNumeriqueId: v4(),
      canal: 'rattachement',
      activite: 'individuel',
      duree: '0-30',
      dureeMinutes: 30,
      codePostal: '69007',
      nomCommune: 'Lyon',
      dateAccompagnement: new Date(),
      codeCommune: '69387',
      createdAt,
    },
  })
  crasV1Semes.add(id)

  return { id, createdAt }
}

After(async () => {
  const semes = [...crasV1Semes]
  crasV1Semes.clear()
  if (semes.length === 0) return

  await prismaClient.craConseillerNumeriqueV1.deleteMany({
    where: { id: { in: semes } },
  })
})

const accompagnementsSemes = new Set<{
  readonly userId: string
  readonly mediateurId: string
}>()

export const semerUnAccompagnementDansLaCommune = async ({
  codeInsee,
  date,
}: {
  codeInsee: string
  date: Date
}): Promise<void> => {
  const userId = v4()

  await prismaClient.user.create({
    data: { id: userId, email: `accompagnement-${userId}@example.com` },
  })
  const mediateur = await prismaClient.mediateur.create({
    data: { userId },
    select: { id: true },
  })
  const beneficiaire = await prismaClient.beneficiaire.create({
    data: { mediateurId: mediateur.id },
    select: { id: true },
  })
  await prismaClient.activite.create({
    data: {
      mediateurId: mediateur.id,
      type: 'Individuel',
      typeLieu: 'Domicile',
      lieuCodeInsee: codeInsee,
      date,
      duree: 60,
      accompagnementsCount: 1,
      accompagnements: { create: { beneficiaireId: beneficiaire.id } },
    },
  })

  accompagnementsSemes.add({ userId, mediateurId: mediateur.id })
}

After(async () => {
  const semes = [...accompagnementsSemes]
  accompagnementsSemes.clear()
  if (semes.length === 0) return

  const mediateurIds = semes.map(({ mediateurId }) => mediateurId)

  await prismaClient.accompagnement.deleteMany({
    where: { activite: { mediateurId: { in: mediateurIds } } },
  })
  await prismaClient.activite.deleteMany({
    where: { mediateurId: { in: mediateurIds } },
  })
  await prismaClient.beneficiaire.deleteMany({
    where: { mediateurId: { in: mediateurIds } },
  })
  await prismaClient.mediateur.deleteMany({
    where: { id: { in: mediateurIds } },
  })
  await prismaClient.user.deleteMany({
    where: { id: { in: semes.map(({ userId }) => userId) } },
  })
})

type CoordinationsSemees = {
  readonly userIds: readonly string[]
  readonly coordinateurId: string
  readonly autreCoordinateurId: string
  readonly tags: { readonly reseau: string; readonly elus: string }
}

let coordinations: CoordinationsSemees | undefined

export const coordinationsSemees = (): CoordinationsSemees => {
  if (!coordinations) throw new Error('Aucune coordination semée')
  return coordinations
}

const semerUnCoordinateur = async (userId: string) => {
  await prismaClient.user.create({
    data: { id: userId, email: `coordinations-${userId}@example.com` },
  })
  return (
    await prismaClient.coordinateur.create({
      data: { userId },
      select: { id: true },
    })
  ).id
}

export const semerDesCoordinations = async (): Promise<CoordinationsSemees> => {
  const userIds = [v4(), v4()]
  const coordinateurId = await semerUnCoordinateur(userIds[0])
  const autreCoordinateurId = await semerUnCoordinateur(userIds[1])
  const [reseau, elus] = await Promise.all(
    ['Réseau', 'Élus'].map((nom) =>
      prismaClient.tag.create({
        data: { nom: `${nom} ${v4()}`, coordinateurId },
        select: { id: true },
      }),
    ),
  )

  await prismaClient.activiteCoordination.create({
    data: {
      coordinateurId,
      type: 'Animation',
      date: new Date('2026-02-10'),
      mediateurs: 3,
      tags: { create: { tagId: reseau.id } },
    },
  })
  await prismaClient.activiteCoordination.create({
    data: {
      coordinateurId,
      type: 'Evenement',
      date: new Date('2026-05-04'),
      nom: 'Forum',
      participants: 40,
    },
  })
  await prismaClient.activiteCoordination.create({
    data: {
      coordinateurId,
      type: 'Partenariat',
      date: new Date('2026-06-30'),
      nom: 'Convention',
      naturePartenariat: ['RDVElu'],
      structuresPartenaires: [{ nom: 'Mairie', type: 'Commune' }],
      tags: { create: { tagId: elus.id } },
    },
  })
  await prismaClient.activiteCoordination.createMany({
    data: [
      {
        coordinateurId,
        type: 'Animation',
        date: new Date('2026-06-15'),
        suppression: new Date('2026-06-16'),
      },
      {
        coordinateurId: autreCoordinateurId,
        type: 'Animation',
        date: new Date('2026-06-15'),
      },
    ],
  })

  coordinations = {
    userIds,
    coordinateurId,
    autreCoordinateurId,
    tags: { reseau: reseau.id, elus: elus.id },
  }
  return coordinations
}

After(async () => {
  const semees = coordinations
  coordinations = undefined
  if (!semees) return

  const coordinateurIds = [semees.coordinateurId, semees.autreCoordinateurId]
  await prismaClient.activitesCoordinationTags.deleteMany({
    where: {
      activiteCoordination: { coordinateurId: { in: coordinateurIds } },
    },
  })
  await prismaClient.activiteCoordination.deleteMany({
    where: { coordinateurId: { in: coordinateurIds } },
  })
  await prismaClient.tag.deleteMany({
    where: { id: { in: [semees.tags.reseau, semees.tags.elus] } },
  })
  await prismaClient.coordinateur.deleteMany({
    where: { id: { in: coordinateurIds } },
  })
  await prismaClient.user.deleteMany({
    where: { id: { in: [...semees.userIds] } },
  })
})
