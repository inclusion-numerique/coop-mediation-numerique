import { After, Before, setDefaultTimeout } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import type { ProfilInscription } from '@/features/inscription/domain'
import { UtilisateurId } from '@/features/inscription/domain'
import type { Typologie } from '@/generated/prisma/client'

setDefaultTimeout(60_000)

/**
 * Support Cucumber partagé pour la feature inscription. Chaque scénario démarre
 * sur un utilisateur fraîchement authentifié mais non démarré (sans profil ni
 * rôle), nettoyé après coup. Les .steps.ts ne définissent que Given/When/Then.
 */
let inscriptionUserId = ''

const trackedLieuActiviteIds = new Set<string>()
const trackedEmployeuseMainIds = new Set<number>()
const trackedAdresseMainIds = new Set<number>()
// Le lieu matérialisé depuis une employeuse ne reprend plus son id : on le
// retrouve, pour le nettoyage comme en production, par sa dénomination.
const trackedEmployeuseMainNoms = new Set<string>()

/**
 * Toute adresse de la coop vient de l'API adresse, qui rend systématiquement un
 * code INSEE — aucun des 12 477 lieux de la base n'en est dépourvu. Les fixtures
 * le portent donc aussi : c'est par lui, et lui seul, que se ratissent les
 * candidats à la corrélation.
 */
const adresseDeTest = {
  adresse: '1 rue de la Paix',
  commune: 'Paris',
  codePostal: '75001',
  codeInsee: '75101',
}

export const utilisateurDeLInscriptionEnCours = (): UtilisateurId =>
  UtilisateurId(inscriptionUserId)

/**
 * Amène l'utilisateur courant à l'état `EnCours` sans passer par l'ability
 * `choisir-profil` : les scénarios des étapes suivantes ont besoin d'un profil
 * posé, pas d'une dépendance vers une autre ability.
 */
export const seedProfilChoisi = async (
  profil: ProfilInscription,
): Promise<void> => {
  await prismaClient.user.update({
    where: { id: inscriptionUserId },
    data: { profilInscription: profil, acceptationCgu: new Date() },
  })
}

/** Amène l'utilisateur courant à l'état terminal `Validee` sur un profil donné. */
export const seedInscriptionValidee = async (
  profil: ProfilInscription,
): Promise<void> => {
  await prismaClient.user.update({
    where: { id: inscriptionUserId },
    data: {
      profilInscription: profil,
      acceptationCgu: new Date(),
      inscriptionValidee: new Date(),
    },
  })
}

/** Lieu d'activité de test (suivi pour nettoyage) : cible de `MediateurEnActivite`. */
export const seedLieuActivite = async (
  data: {
    nom?: string
    /** Un SIRET de fixture est réputé vérifié (API entreprise), comme en prod. */
    siret?: string | null
    /** SIRET de provenance inconnue (ex. cartographie) : sans date de vérification. */
    siretNonVerifie?: string | null
    visiblePourCartographieNationale?: boolean
    /**
     * L'identité cartographique du lieu. Elle vit dans son inscription au
     * registre de l'Entrepôt, dont c'est le domicile ; la coop n'en tient plus
     * copie. Le semis pose donc l'inscription et le lien qui y mène, comme le
     * fait la double écriture.
     */
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
      // Les écrans de création imposent au moins une typologie : un lieu de la
      // coop en porte toujours une, et la corrélation compare des typologies
      // déclarées de part et d'autre.
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

/**
 * Employeuse de test dans `main` (suivie pour nettoyage). Depuis l'échange final
 * de l'ADR-002, l'employeuse est une `main.structure_administrative` et c'est son
 * identifiant entier que reçoivent les écrans d'inscription.
 */
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

Before(async () => {
  inscriptionUserId = v4()
  trackedLieuActiviteIds.clear()
  trackedEmployeuseMainIds.clear()
  trackedAdresseMainIds.clear()
  trackedEmployeuseMainNoms.clear()
  await prismaClient.user.create({
    data: {
      id: inscriptionUserId,
      email: `inscription-${inscriptionUserId}@test.local`,
    },
  })
})

After(async () => {
  const userIds = [inscriptionUserId]
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
  // Inclut les employeuses matérialisées en lieu par l'ability « structure
  // employeuse en lieu d'activité » : elles ne reprennent plus l'id de la
  // structure, on les retrouve donc par leur dénomination.
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

  // Matérialiser un lieu l'inscrit au registre de l'Entrepôt. L'inscription y
  // survivrait au scénario, et sa clé étrangère vers `main.adresse` empêcherait
  // d'effacer les adresses semées plus bas : elle part donc en premier.
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
