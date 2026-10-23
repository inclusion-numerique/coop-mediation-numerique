import { prismaClient } from '@app/web/prismaClient'
import { After, setDefaultTimeout } from '@cucumber/cucumber'
import { v4 } from 'uuid'

setDefaultTimeout(60_000)

export const CODE_INSEE_DU_CANTAL = '15014'

type Semis = {
  readonly userIds: string[]
  readonly lieuIds: string[]
}

const semis: Semis = { userIds: [], lieuIds: [] }

export type ActeurSeme = {
  readonly userId: string
  readonly mediateurId: string | null
  readonly coordinateurId: string | null
}

export type ActeurASemer = {
  readonly nom?: string
  readonly prenom?: string
  readonly mediateur?: boolean
  readonly coordinateur?: boolean
  readonly inscrit?: boolean
  readonly supprime?: boolean
}

export const semerUnLieu = async (
  codeInsee: string = CODE_INSEE_DU_CANTAL,
): Promise<string> => {
  const { id } = await prismaClient.lieuInclusion.create({
    data: {
      nom: `Lieu du réseau ${v4()}`,
      adresse: '1 place de l’Hôtel de Ville',
      commune: 'Aurillac',
      codePostal: '15000',
      codeInsee,
    },
    select: { id: true },
  })
  semis.lieuIds.push(id)
  return id
}

export const semerUnActeur = async ({
  nom = 'Acteur',
  prenom = 'Camille',
  mediateur = true,
  coordinateur = false,
  inscrit = true,
  supprime = false,
}: ActeurASemer = {}): Promise<ActeurSeme> => {
  const userId = v4()

  await prismaClient.user.create({
    data: {
      id: userId,
      email: `reseau-${userId}@example.com`,
      firstName: prenom,
      lastName: nom,
      inscriptionValidee: inscrit ? new Date('2026-01-01') : null,
      deleted: supprime ? new Date('2026-06-01') : null,
    },
  })
  semis.userIds.push(userId)

  const [mediateurCree, coordinateurCree] = await Promise.all([
    mediateur
      ? prismaClient.mediateur.create({
          data: { userId },
          select: { id: true },
        })
      : null,
    coordinateur
      ? prismaClient.coordinateur.create({
          data: { userId },
          select: { id: true },
        })
      : null,
  ])

  return {
    userId,
    mediateurId: mediateurCree?.id ?? null,
    coordinateurId: coordinateurCree?.id ?? null,
  }
}

export const exercerDansLeLieu = async ({
  mediateurId,
  lieuId,
  termine = false,
}: {
  mediateurId: string
  lieuId: string
  termine?: boolean
}): Promise<void> => {
  await prismaClient.mediateurEnActivite.create({
    data: {
      mediateurId,
      structureId: lieuId,
      debut: new Date('2026-01-01'),
      fin: termine ? new Date('2026-03-01') : null,
    },
  })
}

After(async () => {
  const userIds = semis.userIds.splice(0)
  const lieuIds = semis.lieuIds.splice(0)

  await prismaClient.mediateurEnActivite.deleteMany({
    where: {
      OR: [
        { mediateur: { userId: { in: userIds } } },
        { structureId: { in: lieuIds } },
      ],
    },
  })
  await prismaClient.mediateurCoordonne.deleteMany({
    where: {
      OR: [
        { mediateur: { userId: { in: userIds } } },
        { coordinateur: { userId: { in: userIds } } },
      ],
    },
  })
  await prismaClient.invitationEquipe.deleteMany({
    where: { coordinateur: { userId: { in: userIds } } },
  })
  await prismaClient.mediateur.deleteMany({
    where: { userId: { in: userIds } },
  })
  await prismaClient.coordinateur.deleteMany({
    where: { userId: { in: userIds } },
  })
  await prismaClient.user.deleteMany({ where: { id: { in: userIds } } })
  await prismaClient.lieuInclusionRegistreMain.deleteMany({
    where: { structureCoopId: { in: lieuIds } },
  })
  await prismaClient.lieuInclusion.deleteMany({
    where: { id: { in: lieuIds } },
  })
})
