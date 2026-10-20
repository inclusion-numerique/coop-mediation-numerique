import {
  CoordinateurId,
  MediateurId,
  type Rattachements,
} from '@app/web/features/mediateurs/domain'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, setDefaultTimeout } from '@cucumber/cucumber'
import { v4 } from 'uuid'

setDefaultTimeout(60_000)

type Role = 'mediateur' | 'coordinateur'

type CompteSeme = {
  readonly userId: string
  readonly mediateurId: string | null
  readonly coordinateurId: string | null
  readonly partages: Partial<Record<Role, string>>
}

const compte: { seme?: CompteSeme } = {}

export const compteSeme = (): CompteSeme => {
  if (!compte.seme) throw new Error('Aucun compte semé')
  return compte.seme
}

export const rattachementsSemes = (): Rattachements => {
  const { mediateurId, coordinateurId } = compteSeme()
  return {
    mediateurId: mediateurId === null ? null : MediateurId(mediateurId),
    coordinateurId:
      coordinateurId === null ? null : CoordinateurId(coordinateurId),
  }
}

const semerUnPartage = async (
  role: Role,
  proprietaireId: string,
): Promise<string> => {
  const partage = await prismaClient.partageStatistiques.create({
    data:
      role === 'mediateur'
        ? { mediateurId: proprietaireId }
        : { coordinateurId: proprietaireId },
    select: { id: true },
  })
  return partage.id
}

const semerUnCompte = async ({
  roles,
  partages,
}: {
  readonly roles: readonly Role[]
  readonly partages: readonly Role[]
}): Promise<CompteSeme> => {
  const userId = v4()

  await prismaClient.user.create({
    data: { id: userId, email: `partage-${userId}@example.com` },
  })

  const mediateur = roles.includes('mediateur')
    ? await prismaClient.mediateur.create({
        data: { userId },
        select: { id: true },
      })
    : null
  const coordinateur = roles.includes('coordinateur')
    ? await prismaClient.coordinateur.create({
        data: { userId },
        select: { id: true },
      })
    : null

  const partageMediateur =
    mediateur !== null && partages.includes('mediateur')
      ? await semerUnPartage('mediateur', mediateur.id)
      : undefined
  const partageCoordinateur =
    coordinateur !== null && partages.includes('coordinateur')
      ? await semerUnPartage('coordinateur', coordinateur.id)
      : undefined

  compte.seme = {
    userId,
    mediateurId: mediateur?.id ?? null,
    coordinateurId: coordinateur?.id ?? null,
    partages: {
      ...(partageMediateur === undefined
        ? {}
        : { mediateur: partageMediateur }),
      ...(partageCoordinateur === undefined
        ? {}
        : { coordinateur: partageCoordinateur }),
    },
  }

  return compte.seme
}

Given('un médiateur qui partage ses statistiques', async () => {
  await semerUnCompte({ roles: ['mediateur'], partages: ['mediateur'] })
})

Given('un coordinateur qui partage ses statistiques', async () => {
  await semerUnCompte({ roles: ['coordinateur'], partages: ['coordinateur'] })
})

Given('un médiateur qui ne partage pas ses statistiques', async () => {
  await semerUnCompte({ roles: ['mediateur'], partages: [] })
})

Given('un coordinateur qui ne partage pas ses statistiques', async () => {
  await semerUnCompte({ roles: ['coordinateur'], partages: [] })
})

Given(
  'un compte médiateur et coordinateur qui partage ses statistiques des deux côtés',
  async () => {
    await semerUnCompte({
      roles: ['mediateur', 'coordinateur'],
      partages: ['mediateur', 'coordinateur'],
    })
  },
)

Given(
  'un compte médiateur et coordinateur qui ne partage pas ses statistiques',
  async () => {
    await semerUnCompte({ roles: ['mediateur', 'coordinateur'], partages: [] })
  },
)

Given("un compte qui n'est ni médiateur ni coordinateur", async () => {
  await semerUnCompte({ roles: [], partages: [] })
})

Given('ce partage est désactivé', async () => {
  await prismaClient.partageStatistiques.updateMany({
    where: { id: { in: Object.values(compteSeme().partages) } },
    data: { deleted: new Date('2026-01-01T00:00:00.000Z') },
  })
})

Given('le compte de ce partage est supprimé', async () => {
  await prismaClient.user.update({
    where: { id: compteSeme().userId },
    data: { deleted: new Date('2026-01-01T00:00:00.000Z') },
  })
})

After(async () => {
  const seme = compte.seme
  compte.seme = undefined
  if (!seme) return

  await prismaClient.mutation.deleteMany({ where: { userId: seme.userId } })
  await prismaClient.partageStatistiques.deleteMany({
    where: {
      OR: [
        ...(seme.mediateurId === null
          ? []
          : [{ mediateurId: seme.mediateurId }]),
        ...(seme.coordinateurId === null
          ? []
          : [{ coordinateurId: seme.coordinateurId }]),
      ],
    },
  })
  await prismaClient.coordinateur.deleteMany({
    where: { userId: seme.userId },
  })
  await prismaClient.mediateur.deleteMany({ where: { userId: seme.userId } })
  await prismaClient.user.deleteMany({ where: { id: seme.userId } })
})

type VisibiliteSemee = {
  readonly mediateurUserId: string
  readonly mediateurId: string
  readonly administrateurUserId: string
  readonly semeLe: Date
}

const visibilite: { semee?: VisibiliteSemee } = {}

export const visibiliteSemee = (): VisibiliteSemee => {
  if (!visibilite.semee) throw new Error('Aucun médiateur semé')
  return visibilite.semee
}

export const semerUnMediateurVisible = async (): Promise<VisibiliteSemee> => {
  const mediateurUserId = v4()
  const administrateurUserId = v4()
  const semeLe = new Date('2026-01-01T00:00:00.000Z')

  await prismaClient.user.create({
    data: {
      id: mediateurUserId,
      email: `visibilite-${mediateurUserId}@example.com`,
      updated: semeLe,
    },
  })
  await prismaClient.user.create({
    data: {
      id: administrateurUserId,
      email: `visibilite-admin-${administrateurUserId}@example.com`,
      role: 'Admin',
    },
  })

  const mediateur = await prismaClient.mediateur.create({
    data: {
      userId: mediateurUserId,
      isVisible: true,
      modification: semeLe,
    },
    select: { id: true },
  })

  visibilite.semee = {
    mediateurUserId,
    mediateurId: mediateur.id,
    administrateurUserId,
    semeLe,
  }

  return visibilite.semee
}

After(async () => {
  const semee = visibilite.semee
  visibilite.semee = undefined
  if (!semee) return

  const userIds = [semee.mediateurUserId, semee.administrateurUserId]

  await prismaClient.mutation.deleteMany({ where: { userId: { in: userIds } } })
  await prismaClient.mediateur.deleteMany({ where: { id: semee.mediateurId } })
  await prismaClient.user.deleteMany({ where: { id: { in: userIds } } })
})

type ExConseillerSeme = {
  readonly userId: string
  readonly mediateurId: string
  readonly personneId: number
}

const exConseiller: { seme?: ExConseillerSeme } = {}

export const exConseillerSeme = (): ExConseillerSeme => {
  if (!exConseiller.seme) throw new Error('Aucun ex-conseiller semé')
  return exConseiller.seme
}

export const semerUnExConseiller = async ({
  visible,
  reglageLe,
}: {
  visible: boolean
  reglageLe: Date
}): Promise<ExConseillerSeme> => {
  const userId = v4()

  await prismaClient.user.create({
    data: { id: userId, email: `rupture-${userId}@example.com` },
  })

  const mediateur = await prismaClient.mediateur.create({
    data: { userId, isVisible: visible, modification: reglageLe },
    select: { id: true },
  })

  const personne = await prismaClient.personneMain.create({
    data: { coopId: userId },
    select: { id: true },
  })

  exConseiller.seme = {
    userId,
    mediateurId: mediateur.id,
    personneId: personne.id,
  }

  return exConseiller.seme
}

export const semerUnContratDeLExConseiller = async ({
  debut,
  rupture,
}: {
  debut: Date
  rupture: Date | null
}): Promise<void> => {
  await prismaClient.contratMain.create({
    data: {
      personneId: exConseillerSeme().personneId,
      dateDebut: debut,
      dateRupture: rupture,
    },
  })
}

After(async () => {
  const seme = exConseiller.seme
  exConseiller.seme = undefined
  if (!seme) return

  await prismaClient.contratMain.deleteMany({
    where: { personneId: seme.personneId },
  })
  await prismaClient.personneMain.deleteMany({ where: { id: seme.personneId } })
  await prismaClient.mutation.deleteMany({ where: { userId: seme.userId } })
  await prismaClient.mediateur.deleteMany({ where: { id: seme.mediateurId } })
  await prismaClient.user.deleteMany({ where: { id: seme.userId } })
})
