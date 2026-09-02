import { prismaClient } from '@app/web/prismaClient'
import { After, setDefaultTimeout } from '@cucumber/cucumber'
import { v4 } from 'uuid'

setDefaultTimeout(60_000)

type LieuxSemes = {
  readonly userId: string
  readonly mediateurId: string
  readonly lieuIds: readonly string[]
}

let lieux: LieuxSemes | undefined

export const lieuxSemes = (): LieuxSemes => {
  if (!lieux) throw new Error('Aucun lieu semé')
  return lieux
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

  lieux = {
    userId,
    mediateurId: mediateur.id,
    lieuIds: crees.map(({ id }) => id),
  }

  return lieux
}

After(async () => {
  const semé = lieux
  lieux = undefined
  if (!semé) return

  await prismaClient.mediateurEnActivite.deleteMany({
    where: { mediateurId: semé.mediateurId },
  })
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

/**
 * Un holder plutôt qu'un `let` : l'état d'un scénario Cucumber doit bien vivre
 * quelque part entre les steps, mais rien n'oblige à rendre la liaison mutable.
 */
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
      siteWeb: 'https://www.exemple-reims.fr',
      telephone: '+33180059880',
      courriels: ['contact@exemple-reims.fr'],
      // Une modalité que le formulaire ne sait pas exprimer : elle vient d'un
      // import cartographique et doit survivre à une édition de la section.
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

After(async () => {
  const semé = semis.fiche
  semis.fiche = undefined
  if (!semé) return

  await prismaClient.mediateurEnActivite.deleteMany({
    where: { structureId: semé.lieuId },
  })
  await prismaClient.lieuInclusion.deleteMany({ where: { id: semé.lieuId } })
  await prismaClient.mediateur.deleteMany({
    where: { id: { in: [semé.mediateurRattacheId, semé.mediateurEtrangerId] } },
  })
  await prismaClient.user.deleteMany({
    where: { id: { in: [...semé.userIds] } },
  })
})
