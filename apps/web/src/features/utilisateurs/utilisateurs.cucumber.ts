import type { OnboardingStatus } from '@app/web/generated/prisma/client'
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

  if (aNettoyer.length === 0) return

  const utilisateurs = aNettoyer.map(({ userId }) => userId)
  const parUtilisateur = { userId: { in: utilisateurs } }
  const mediateurs = { mediateur: parUtilisateur }
  const coordinateurs = { coordinateur: parUtilisateur }
  const deLUnOuLAutre = { OR: [mediateurs, coordinateurs] }

  await prismaClient.partageStatistiques.deleteMany({ where: deLUnOuLAutre })
  await prismaClient.mediateurEnActivite.deleteMany({ where: mediateurs })
  await prismaClient.activitesTags.deleteMany({
    where: { activite: mediateurs },
  })
  await prismaClient.tag.deleteMany({ where: deLUnOuLAutre })
  await prismaClient.activite.deleteMany({ where: mediateurs })
  await prismaClient.beneficiaire.deleteMany({ where: mediateurs })
  await prismaClient.invitationEquipe.deleteMany({
    where: { OR: [{ mediateurInvite: parUtilisateur }, coordinateurs] },
  })
  await prismaClient.mediateurCoordonne.deleteMany({ where: deLUnOuLAutre })
  await prismaClient.coordinateur.deleteMany({ where: parUtilisateur })
  await prismaClient.mediateur.deleteMany({ where: parUtilisateur })
  await prismaClient.lieuInclusion.deleteMany({
    where: { id: { in: aNettoyer.map(({ lieuId }) => lieuId) } },
  })
  await prismaClient.rdvAccount.deleteMany({ where: parUtilisateur })
  await prismaClient.session.deleteMany({ where: parUtilisateur })
  await prismaClient.account.deleteMany({ where: parUtilisateur })
  await prismaClient.mutation.deleteMany({ where: parUtilisateur })
  await prismaClient.personneAffectationEmploiMain.deleteMany({
    where: { personne: { coopId: { in: utilisateurs } } },
  })
  await prismaClient.personneMain.deleteMany({
    where: { coopId: { in: utilisateurs } },
  })
  await prismaClient.structureAdministrativeMain.deleteMany({
    where: {
      id: {
        in: aNettoyer.flatMap(({ employeuseId }) =>
          employeuseId === null ? [] : [employeuseId],
        ),
      },
    },
  })
  await prismaClient.user.deleteMany({ where: { id: { in: utilisateurs } } })
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

export type CompteDeListe = {
  readonly prenom: string
  readonly marqueur: string
  readonly role?: 'User' | 'Admin' | 'Support'
  readonly creeLe: Date
  readonly inscritLe: Date | null
  readonly supprimeLe?: Date | null
  readonly derniereVisite?: Date | null
  readonly mediateur?: {
    readonly derniereActivite: Date | null
    readonly dernierBeneficiaire: Date | null
  } | null
  readonly coordinateur?: {
    readonly aUneEquipe: boolean
    readonly aCoordonne: boolean
  } | null
  readonly employeuseId?: number | null
  readonly conseillerNumerique?: boolean
  readonly lieuId?: string | null
  readonly relance?: OnboardingStatus | null
  readonly avecUnBeneficiaire?: boolean
  readonly fixture?: boolean
}

const listes: {
  utilisateurs: readonly string[]
  employeuses: readonly number[]
  lieux: readonly string[]
} = { utilisateurs: [], employeuses: [], lieux: [] }

const suivre = (cle: 'utilisateurs', id: string) => {
  listes[cle] = [...listes[cle], id]
}

const semerUnUtilisateurBrut = async (
  data: Parameters<typeof prismaClient.user.create>[0]['data'],
): Promise<string> => {
  const { id } = await prismaClient.user.create({ data, select: { id: true } })
  suivre('utilisateurs', id)
  return id
}

const semerUnMediateurCoordonne = async (
  coordinateurId: string,
  marqueur: string,
): Promise<void> => {
  const userId = await semerUnUtilisateurBrut({
    email: `membre-${v4()}@example.com`,
    lastName: `Membre de ${marqueur.slice(0, 4)}`,
    inscriptionValidee: new Date(),
  })
  const mediateur = await prismaClient.mediateur.create({
    data: { userId },
    select: { id: true },
  })
  await prismaClient.mediateurCoordonne.create({
    data: { mediateurId: mediateur.id, coordinateurId },
  })
}

export const semerUneEmployeuse = async (nom: string): Promise<number> => {
  const { id } = await prismaClient.structureAdministrativeMain.create({
    data: { denominationAntenne: nom },
    select: { id: true },
  })
  listes.employeuses = [...listes.employeuses, id]
  return id
}

export const semerUnLieu = async (nom: string): Promise<string> => {
  const { id } = await prismaClient.lieuInclusion.create({
    data: {
      nom,
      adresse: '1 rue de la Paix',
      commune: 'Reims',
      codePostal: '51100',
    },
    select: { id: true },
  })
  listes.lieux = [...listes.lieux, id]
  return id
}

export const semerUnCompteDeListe = async (
  compte: CompteDeListe,
): Promise<string> => {
  const userId = await semerUnUtilisateurBrut({
    email: `liste-${v4()}@example.com`,
    firstName: compte.prenom,
    lastName: compte.marqueur,
    name: `${compte.prenom} ${compte.marqueur}`,
    role: compte.role ?? 'User',
    created: compte.creeLe,
    inscriptionValidee: compte.inscritLe,
    deleted: compte.supprimeLe ?? null,
    lastSeen: compte.derniereVisite ?? null,
    onboardingStatus: compte.relance ?? null,
    isFixture: compte.fixture ?? false,
  })

  const mediateur = compte.mediateur
    ? await prismaClient.mediateur.create({
        data: {
          userId,
          derniereCreationActivite: compte.mediateur.derniereActivite,
          derniereCreationBeneficiaire: compte.mediateur.dernierBeneficiaire,
        },
        select: { id: true },
      })
    : null

  if (compte.coordinateur) {
    const coordinateur = await prismaClient.coordinateur.create({
      data: {
        userId,
        derniereCreationActivite: compte.coordinateur.aCoordonne
          ? new Date()
          : null,
      },
      select: { id: true },
    })
    if (compte.coordinateur.aUneEquipe)
      await semerUnMediateurCoordonne(coordinateur.id, compte.marqueur)
  }

  if (compte.employeuseId != null || compte.conseillerNumerique) {
    const employeuseId =
      compte.employeuseId ?? (await semerUneEmployeuse('Employeuse CN'))
    const personne = await prismaClient.personneMain.create({
      data: { coopId: userId },
      select: { id: true },
    })
    await prismaClient.personneAffectationEmploiMain.create({
      data: {
        personneId: personne.id,
        structureAdministrativeId: employeuseId,
        source: compte.conseillerNumerique ? 'idposte' : 'coop',
        estActive: true,
      },
    })
  }

  if (compte.avecUnBeneficiaire && mediateur)
    await prismaClient.beneficiaire.create({
      data: { mediateurId: mediateur.id, prenom: 'Paul', nom: 'Durand' },
    })

  if (compte.lieuId && mediateur)
    await prismaClient.mediateurEnActivite.create({
      data: {
        mediateurId: mediateur.id,
        structureId: compte.lieuId,
        debut: new Date('2026-01-01'),
      },
    })

  return userId
}

After(async () => {
  const { utilisateurs, employeuses, lieux } = listes
  listes.utilisateurs = []
  listes.employeuses = []
  listes.lieux = []

  if (utilisateurs.length === 0) return

  const parUtilisateur = { userId: { in: [...utilisateurs] } }

  await prismaClient.mediateurCoordonne.deleteMany({
    where: {
      OR: [{ mediateur: parUtilisateur }, { coordinateur: parUtilisateur }],
    },
  })
  await prismaClient.mediateurEnActivite.deleteMany({
    where: { mediateur: parUtilisateur },
  })
  await prismaClient.personneAffectationEmploiMain.deleteMany({
    where: { personne: { coopId: { in: [...utilisateurs] } } },
  })
  await prismaClient.personneMain.deleteMany({
    where: { coopId: { in: [...utilisateurs] } },
  })
  await prismaClient.structureAdministrativeMain.deleteMany({
    where: { id: { in: [...employeuses] } },
  })
  await prismaClient.lieuInclusion.deleteMany({
    where: { id: { in: [...lieux] } },
  })
  await prismaClient.mutation.deleteMany({ where: parUtilisateur })
  await prismaClient.tag.deleteMany({
    where: {
      OR: [{ mediateur: parUtilisateur }, { coordinateur: parUtilisateur }],
    },
  })
  await prismaClient.activite.deleteMany({
    where: { mediateur: parUtilisateur },
  })
  await prismaClient.beneficiaire.deleteMany({
    where: { mediateur: parUtilisateur },
  })
  await prismaClient.activiteCoordination.deleteMany({
    where: { coordinateur: parUtilisateur },
  })
  await prismaClient.partageStatistiques.deleteMany({
    where: {
      OR: [{ mediateur: parUtilisateur }, { coordinateur: parUtilisateur }],
    },
  })
  await prismaClient.coordinateur.deleteMany({ where: parUtilisateur })
  await prismaClient.mediateur.deleteMany({ where: parUtilisateur })
  await prismaClient.user.deleteMany({
    where: { id: { in: [...utilisateurs] } },
  })
})
