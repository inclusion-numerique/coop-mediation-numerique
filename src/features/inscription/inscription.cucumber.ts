import { After, Before, setDefaultTimeout } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import type { ProfilInscription } from '@/features/inscription/domain'
import { UtilisateurId } from '@/features/inscription/domain'
import type { Typologie } from '@/generated/prisma/client'

setDefaultTimeout(60_000)

const contexte: {
  inscriptionUserId: string
} = {
  inscriptionUserId: '',
}

const trackedMediateurCoordonneUserIds = new Set<string>()
const trackedLieuActiviteIds = new Set<string>()
const trackedEmployeuseMainIds = new Set<number>()
const trackedAdresseMainIds = new Set<number>()
const trackedEmployeuseMainNoms = new Set<string>()

const adresseDeTest = {
  adresse: '1 rue de la Paix',
  commune: 'Paris',
  codePostal: '75001',
  codeInsee: '75101',
}

export const utilisateurDeLInscriptionEnCours = (): UtilisateurId =>
  UtilisateurId(contexte.inscriptionUserId)

export const seedProfilChoisi = async (
  profil: ProfilInscription,
): Promise<void> => {
  await prismaClient.user.update({
    where: { id: contexte.inscriptionUserId },
    data: { profilInscription: profil, acceptationCgu: new Date() },
  })
}

export const seedInscriptionValidee = async (
  profil: ProfilInscription,
): Promise<void> => {
  await prismaClient.user.update({
    where: { id: contexte.inscriptionUserId },
    data: {
      profilInscription: profil,
      acceptationCgu: new Date(),
      inscriptionValidee: new Date(),
    },
  })
}

export const seedLieuActivite = async (
  data: {
    nom?: string
    siret?: string | null
    siretNonVerifie?: string | null
    visiblePourCartographieNationale?: boolean
    structureCartographieNationaleId?: string | null
    supprime?: boolean
    typologies?: Typologie[]
    adresse?: {
      adresse: string
      commune: string
      codePostal: string
      codeInsee: string | null
    }
    position?: { latitude: number; longitude: number }
    banId?: string | null
  } = {},
): Promise<string> => {
  const id = v4()
  const now = new Date()
  await prismaClient.lieuInclusion.create({
    data: {
      id,
      nom: data.nom ?? 'Lieu d’activité de test',
      siret: data.siret ?? data.siretNonVerifie ?? null,
      synchronisationSiret: data.siret == null ? null : now,
      visiblePourCartographieNationale:
        data.visiblePourCartographieNationale ?? false,
      suppression: data.supprime ? now : null,
      typologies: data.typologies ?? ['ASSO'],
      ...(data.adresse ?? adresseDeTest),
      ...(data.position ?? {}),
      banId: data.banId === undefined ? '75101_0001_00001' : data.banId,
    },
  })

  if (data.structureCartographieNationaleId != null) {
    await prismaClient.lieuInclusionRegistreMain.create({
      data: {
        nom: data.nom ?? 'Lieu d’activité de test',
        structureCoopId: id,
        structureCartographieNationaleId: data.structureCartographieNationaleId,
        source: 'carto',
        editedBy: 'carto',
        updatedAtCarto: now,
      },
      select: { id: true },
    })
  }
  trackedLieuActiviteIds.add(id)
  return id
}

export const seedEmployeuseMain = async (
  data: { nom?: string } = {},
): Promise<number> => {
  const nom = data.nom ?? 'Employeuse main de test'

  const adresse = await prismaClient.adresseMain.create({
    data: {
      numeroVoie: 1,
      nomVoie: 'rue de la Paix',
      nomCommune: adresseDeTest.commune,
      codePostal: adresseDeTest.codePostal,
      codeInsee: '75101',
    },
    select: { id: true },
  })

  const structure = await prismaClient.structureAdministrativeMain.create({
    data: { denominationAntenne: nom, adresseId: adresse.id },
    select: { id: true },
  })

  trackedAdresseMainIds.add(adresse.id)
  trackedEmployeuseMainIds.add(structure.id)
  trackedEmployeuseMainNoms.add(nom)

  return structure.id
}

export const seedMediateurCoordonne = async ({
  coordinateurId,
  suppression,
}: {
  coordinateurId: string
  suppression: Date | null
}): Promise<void> => {
  const userId = v4()
  trackedMediateurCoordonneUserIds.add(userId)
  await prismaClient.user.create({
    data: { id: userId, email: `coordonne-${userId}@test.local` },
  })
  const mediateur = await prismaClient.mediateur.create({
    data: { id: v4(), userId },
    select: { id: true },
  })
  await prismaClient.mediateurCoordonne.create({
    data: { mediateurId: mediateur.id, coordinateurId, suppression },
  })
}

Before(async () => {
  contexte.inscriptionUserId = v4()
  trackedMediateurCoordonneUserIds.clear()
  trackedLieuActiviteIds.clear()
  trackedEmployeuseMainIds.clear()
  trackedAdresseMainIds.clear()
  trackedEmployeuseMainNoms.clear()
  await prismaClient.user.create({
    data: {
      id: contexte.inscriptionUserId,
      email: `inscription-${contexte.inscriptionUserId}@test.local`,
    },
  })
})

After(async () => {
  const userIds = [
    contexte.inscriptionUserId,
    ...trackedMediateurCoordonneUserIds,
  ]
  await prismaClient.mediateurCoordonne.deleteMany({
    where: { coordinateur: { userId: { in: userIds } } },
  })
  await prismaClient.mediateurEnActivite.deleteMany({
    where: { mediateur: { userId: { in: userIds } } },
  })
  await prismaClient.mediateur.deleteMany({
    where: { userId: { in: userIds } },
  })
  await prismaClient.coordinateur.deleteMany({
    where: { userId: { in: userIds } },
  })
  await prismaClient.personneAffectationEmploiMain.deleteMany({
    where: { personne: { coopId: { in: userIds } } },
  })
  await prismaClient.personneMain.deleteMany({
    where: { coopId: { in: userIds } },
  })
  await prismaClient.user.deleteMany({ where: { id: { in: userIds } } })
  const lieuxDuScenario = {
    OR: [
      {
        id: {
          in: [...trackedLieuActiviteIds],
        },
      },
      { nom: { in: [...trackedEmployeuseMainNoms] } },
    ],
  }

  const lieux = await prismaClient.lieuInclusion.findMany({
    where: lieuxDuScenario,
    select: { id: true },
  })

  await prismaClient.lieuInclusionRegistreMain.deleteMany({
    where: { structureCoopId: { in: lieux.map(({ id }) => id) } },
  })

  await prismaClient.lieuInclusion.deleteMany({ where: lieuxDuScenario })
  await prismaClient.personneAffectationEmploiMain.deleteMany({
    where: { structureAdministrativeId: { in: [...trackedEmployeuseMainIds] } },
  })
  await prismaClient.structureAdministrativeMain.deleteMany({
    where: { id: { in: [...trackedEmployeuseMainIds] } },
  })
  await prismaClient.adresseMain.deleteMany({
    where: { id: { in: [...trackedAdresseMainIds] } },
  })
})
