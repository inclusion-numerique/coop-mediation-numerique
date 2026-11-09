import { prismaClient } from '@app/web/prismaClient'
import { After, Given, setDefaultTimeout } from '@cucumber/cucumber'
import { v4 } from 'uuid'

setDefaultTimeout(60_000)

const effacerDuRegistre = async (lieuIds: readonly string[]): Promise<void> => {
  await prismaClient.lieuInclusionRegistreMain.deleteMany({
    where: { structureCoopId: { in: [...lieuIds] } },
  })
}

type LieuxSemes = {
  readonly userId: string
  readonly mediateurId: string
  readonly lieuIds: readonly string[]
}

const semisDeLieux: { lieux?: LieuxSemes } = {}

export const lieuxSemes = (): LieuxSemes => {
  if (!semisDeLieux.lieux) throw new Error('Aucun lieu semé')
  return semisDeLieux.lieux
}

export const semerLieuxDActivite = async (): Promise<LieuxSemes> => {
  const userId = v4()

  await prismaClient.user.create({
    data: { id: userId, email: `lieux-${userId}@example.com` },
  })

  const mediateur = await prismaClient.mediateur.create({
    data: { userId },
    select: { id: true },
  })

  const crees = await Promise.all(
    [1, 2].map((rang) =>
      prismaClient.lieuInclusion.create({
        data: {
          nom: `Espace numérique ${rang}`,
          adresse: `${rang} rue de la Paix`,
          commune: 'Reims',
          codePostal: '51100',
        },
        select: { id: true },
      }),
    ),
  )

  await prismaClient.mediateurEnActivite.createMany({
    data: crees.map(({ id }) => ({
      mediateurId: mediateur.id,
      structureId: id,
      debut: new Date('2026-01-01'),
    })),
  })

  semisDeLieux.lieux = {
    userId,
    mediateurId: mediateur.id,
    lieuIds: crees.map(({ id }) => id),
  }

  return semisDeLieux.lieux
}

After(async () => {
  const semé = semisDeLieux.lieux
  semisDeLieux.lieux = undefined
  if (!semé) return

  await prismaClient.mediateurEnActivite.deleteMany({
    where: { mediateurId: semé.mediateurId },
  })
  await effacerDuRegistre([...semé.lieuIds])
  await prismaClient.lieuInclusion.deleteMany({
    where: { id: { in: [...semé.lieuIds] } },
  })
  await prismaClient.mediateur.deleteMany({ where: { id: semé.mediateurId } })
  await prismaClient.user.deleteMany({ where: { id: semé.userId } })
})

type FicheSemee = {
  readonly lieuId: string
  readonly userIds: readonly string[]
  readonly mediateurRattacheId: string
  readonly mediateurEtrangerId: string
}

const semis: { fiche?: FicheSemee } = {}

export const ficheSemee = (): FicheSemee => {
  if (!semis.fiche) throw new Error('Aucune fiche semée')
  return semis.fiche
}

export const semerUneFicheDeLieu = async (): Promise<FicheSemee> => {
  const userId = v4()

  await prismaClient.user.create({
    data: { id: userId, email: `fiche-${userId}@example.com` },
  })

  const userEtrangerId = v4()

  await prismaClient.user.create({
    data: {
      id: userEtrangerId,
      email: `etranger-${userEtrangerId}@example.com`,
    },
  })

  const [rattache, etranger] = await Promise.all([
    prismaClient.mediateur.create({ data: { userId }, select: { id: true } }),
    prismaClient.mediateur.create({
      data: { userId: userEtrangerId },
      select: { id: true },
    }),
  ])

  const lieu = await prismaClient.lieuInclusion.create({
    data: {
      nom: 'Maison France Services de Reims',
      adresse: '12 rue de la Paix',
      commune: 'Reims',
      codePostal: '51100',
      codeInsee: '51454',
      banId: '51454_7160_00012',
      siteWeb: ['https://www.exemple-reims.fr'],
      telephone: '+33180059880',
      courriels: ['contact@exemple-reims.fr'],
      modalitesAcces: ['SePresenter', 'PrendreRdvEnLigne'],
      services: ['AideAuxDemarchesAdministratives'],
    },
    select: { id: true },
  })

  await prismaClient.mediateurEnActivite.create({
    data: {
      mediateurId: rattache.id,
      structureId: lieu.id,
      debut: new Date('2026-01-01'),
    },
  })

  semis.fiche = {
    lieuId: lieu.id,
    userIds: [userId, userEtrangerId],
    mediateurRattacheId: rattache.id,
    mediateurEtrangerId: etranger.id,
  }

  return semis.fiche
}

Given("ce lieu n'a pas d'adresse reconnue par la BAN", async () => {
  await prismaClient.lieuInclusion.update({
    where: { id: ficheSemee().lieuId },
    data: { banId: null },
  })
})

After(async () => {
  const semé = semis.fiche
  semis.fiche = undefined
  if (!semé) return

  await prismaClient.mediateurEnActivite.deleteMany({
    where: { structureId: semé.lieuId },
  })
  await prismaClient.activite.deleteMany({
    where: { structureId: semé.lieuId },
  })
  await effacerDuRegistre([semé.lieuId])
  await prismaClient.lieuInclusion.deleteMany({ where: { id: semé.lieuId } })
  await prismaClient.mediateur.deleteMany({
    where: { id: { in: [semé.mediateurRattacheId, semé.mediateurEtrangerId] } },
  })
  await prismaClient.user.deleteMany({
    where: { id: { in: [...semé.userIds] } },
  })
})

type LieuxASiretSemes = {
  readonly premierId: string
  readonly secondId: string
}

export const SIRET_PREMIER = '00000000000017'
export const SIRET_SECOND = '00000000000025'

const semisSiret: { lieuxASiret?: LieuxASiretSemes } = {}

export const lieuxASiretSemes = (): LieuxASiretSemes => {
  if (!semisSiret.lieuxASiret) throw new Error('Aucun lieu à SIRET semé')
  return semisSiret.lieuxASiret
}

export const semerDesLieuxASiret = async (): Promise<LieuxASiretSemes> => {
  const [premier, second] = await Promise.all([
    prismaClient.lieuInclusion.create({
      data: {
        nom: 'Maison France Services de Reims',
        adresse: '12 rue de la Paix',
        commune: 'Reims',
        codePostal: '51100',
        siret: SIRET_PREMIER,
      },
      select: { id: true },
    }),
    prismaClient.lieuInclusion.create({
      data: {
        nom: 'Espace numérique de Tinqueux',
        adresse: '4 avenue Jean Jaurès',
        commune: 'Tinqueux',
        codePostal: '51430',
        siret: SIRET_SECOND,
      },
      select: { id: true },
    }),
  ])

  semisSiret.lieuxASiret = { premierId: premier.id, secondId: second.id }

  return semisSiret.lieuxASiret
}

After(async () => {
  const semé = semisSiret.lieuxASiret
  semisSiret.lieuxASiret = undefined
  if (!semé) return

  await effacerDuRegistre([semé.premierId, semé.secondId])
  await prismaClient.lieuInclusion.deleteMany({
    where: { id: { in: [semé.premierId, semé.secondId] } },
  })
})
