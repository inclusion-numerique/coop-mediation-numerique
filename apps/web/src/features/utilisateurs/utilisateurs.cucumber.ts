import { prismaClient } from '@app/web/prismaClient'
import { After, setDefaultTimeout } from '@cucumber/cucumber'
import { v4 } from 'uuid'

setDefaultTimeout(60_000)

export type CompteSeme = {
  readonly userId: string
  readonly mediateurId: string
  readonly coordinateurId: string | null
  readonly courriel: string
  readonly beneficiaireId: string
  readonly activiteId: string
  readonly tagId: string
  readonly lieuId: string
  readonly employeuseId: number | null
}

const semes: { comptes: readonly CompteSeme[] } = { comptes: [] }

export const semerCompte = async ({
  avecCoordinateur = false,
  conseillerNumerique = false,
  role = 'User',
}: {
  avecCoordinateur?: boolean
  conseillerNumerique?: boolean
  role?: 'User' | 'Admin' | 'Support'
} = {}): Promise<CompteSeme> => {
  const userId = v4()
  const courriel = `suppression-${userId}@example.com`

  await prismaClient.user.create({
    data: {
      id: userId,
      email: courriel,
      firstName: 'Jeanne',
      lastName: 'Martin',
      name: 'Jeanne Martin',
      phone: '+33600000000',
      siret: '12345678901234',
      role,
      inscriptionValidee: new Date(),
    },
  })

  await prismaClient.account.create({
    data: {
      userId,
      type: 'oauth',
      provider: 'proconnect',
      providerAccountId: `sub-${userId}`,
      access_token: 'jeton-acces',
      refresh_token: 'jeton-rafraichissement',
      id_token: 'jeton-identite',
      expires_at: 1_800_000_000,
      session_state: 'etat',
    },
  })

  await prismaClient.session.create({
    data: {
      sessionToken: `session-${userId}`,
      userId,
      expires: new Date(Date.now() + 86_400_000),
    },
  })

  const mediateur = await prismaClient.mediateur.create({
    data: { userId },
    select: { id: true },
  })

  const coordinateur = avecCoordinateur
    ? await prismaClient.coordinateur.create({
        data: { userId },
        select: { id: true },
      })
    : null

  const beneficiaire = await prismaClient.beneficiaire.create({
    data: {
      mediateurId: mediateur.id,
      prenom: 'Paul',
      nom: 'Durand',
      telephone: '+33611111111',
      email: 'paul.durand@example.com',
      notes: 'Note confidentielle sur le bénéficiaire',
      anneeNaissance: 1980,
      commune: 'Reims',
    },
    select: { id: true },
  })

  const activite = await prismaClient.activite.create({
    data: {
      mediateurId: mediateur.id,
      type: 'Individuel',
      date: new Date('2026-06-01'),
      duree: 60,
      typeLieu: 'Autre',
      accompagnementsCount: 0,
      notes: 'Compte rendu contenant des éléments personnels',
    },
    select: { id: true },
  })

  const tag = await prismaClient.tag.create({
    data: { nom: `Tag ${userId.slice(0, 8)}`, mediateurId: mediateur.id },
    select: { id: true },
  })

  const lieu = await prismaClient.lieuInclusion.create({
    data: {
      nom: 'Espace numérique de test',
      adresse: '1 rue de la Paix',
      commune: 'Reims',
      codePostal: '51100',
    },
    select: { id: true },
  })

  await prismaClient.mediateurEnActivite.create({
    data: {
      mediateurId: mediateur.id,
      structureId: lieu.id,
      debut: new Date('2026-01-01'),
    },
  })

  await prismaClient.partageStatistiques.create({
    data: { mediateurId: mediateur.id },
  })

  const employeuseId = conseillerNumerique
    ? await semerUneAffectationConseillerNumerique(userId)
    : null

  const seme: CompteSeme = {
    userId,
    mediateurId: mediateur.id,
    coordinateurId: coordinateur?.id ?? null,
    courriel,
    beneficiaireId: beneficiaire.id,
    activiteId: activite.id,
    tagId: tag.id,
    lieuId: lieu.id,
    employeuseId,
  }

  semes.comptes = [...semes.comptes, seme]

  return seme
}

const semerUneAffectationConseillerNumerique = async (
  userId: string,
): Promise<number> => {
  const employeuse = await prismaClient.structureAdministrativeMain.create({
    data: { denominationAntenne: 'Employeuse conseiller numérique' },
    select: { id: true },
  })
  const personne = await prismaClient.personneMain.create({
    data: { coopId: userId },
    select: { id: true },
  })
  await prismaClient.personneAffectationEmploiMain.create({
    data: {
      personneId: personne.id,
      structureAdministrativeId: employeuse.id,
      source: 'idposte',
      estActive: true,
    },
  })
  return employeuse.id
}

After(async () => {
  const aNettoyer = semes.comptes
  semes.comptes = []

  await aNettoyer.reduce<Promise<void>>(async (precedent, compte) => {
    await precedent

    await prismaClient.partageStatistiques.deleteMany({
      where: { mediateurId: compte.mediateurId },
    })
    await prismaClient.mediateurEnActivite.deleteMany({
      where: { mediateurId: compte.mediateurId },
    })
    await prismaClient.activitesTags.deleteMany({
      where: { activiteId: compte.activiteId },
    })
    await prismaClient.tag.deleteMany({
      where: {
        OR: [
          { mediateurId: compte.mediateurId },
          ...(compte.coordinateurId
            ? [{ coordinateurId: compte.coordinateurId }]
            : []),
        ],
      },
    })
    await prismaClient.activite.deleteMany({
      where: { mediateurId: compte.mediateurId },
    })
    await prismaClient.beneficiaire.deleteMany({
      where: { mediateurId: compte.mediateurId },
    })
    await prismaClient.invitationEquipe.deleteMany({
      where: compte.coordinateurId
        ? { coordinateurId: compte.coordinateurId }
        : { mediateurId: compte.mediateurId },
    })
    await prismaClient.mediateurCoordonne.deleteMany({
      where: { mediateurId: compte.mediateurId },
    })
    if (compte.coordinateurId)
      await prismaClient.coordinateur.deleteMany({
        where: { id: compte.coordinateurId },
      })
    await prismaClient.mediateur.deleteMany({
      where: { id: compte.mediateurId },
    })
    await prismaClient.lieuInclusion.deleteMany({
      where: { id: compte.lieuId },
    })
    await prismaClient.session.deleteMany({ where: { userId: compte.userId } })
    await prismaClient.account.deleteMany({ where: { userId: compte.userId } })
    await prismaClient.mutation.deleteMany({ where: { userId: compte.userId } })
    await prismaClient.personneAffectationEmploiMain.deleteMany({
      where: { personne: { coopId: compte.userId } },
    })
    await prismaClient.personneMain.deleteMany({
      where: { coopId: compte.userId },
    })
    if (compte.employeuseId !== null)
      await prismaClient.structureAdministrativeMain.deleteMany({
        where: { id: compte.employeuseId },
      })
    await prismaClient.user.deleteMany({ where: { id: compte.userId } })
  }, Promise.resolve())
})

export type CompteInactifSeme = {
  readonly userId: string
  readonly courriel: string
}

const inactifs: { comptes: readonly CompteInactifSeme[] } = { comptes: [] }

export const semerUnCompteInactif = async ({
  role,
  inscriptionValidee,
  dernierCompteRendu = null,
  derniereConnexion = null,
  derniereVisite = null,
  avertiLe = null,
}: {
  role: 'mediateur' | 'coordinateur'
  inscriptionValidee: Date
  dernierCompteRendu?: Date | null
  derniereConnexion?: Date | null
  derniereVisite?: Date | null
  avertiLe?: Date | null
}): Promise<CompteInactifSeme> => {
  const userId = v4()
  const courriel = `inactif-${userId}@example.com`

  await prismaClient.user.create({
    data: {
      id: userId,
      email: courriel,
      firstName: 'Jeanne',
      inscriptionValidee,
      lastLogin: derniereConnexion,
      lastSeen: derniereVisite,
      avertissementInactiviteLe: avertiLe,
    },
  })

  if (role === 'mediateur') {
    await prismaClient.mediateur.create({
      data: { userId, derniereCreationActivite: dernierCompteRendu },
    })
  }

  if (role === 'coordinateur') {
    await prismaClient.coordinateur.create({ data: { userId } })
  }

  const seme = { userId, courriel }
  inactifs.comptes = [...inactifs.comptes, seme]

  return seme
}

After(async () => {
  const userIds = inactifs.comptes.map(({ userId }) => userId)
  inactifs.comptes = []

  if (userIds.length === 0) return

  await prismaClient.mediateur.deleteMany({
    where: { userId: { in: userIds } },
  })
  await prismaClient.coordinateur.deleteMany({
    where: { userId: { in: userIds } },
  })
  await prismaClient.user.deleteMany({ where: { id: { in: userIds } } })
})
