import assert from 'node:assert'
import { After, Given, setDefaultTimeout, Then, When } from '@cucumber/cucumber'
import { typologiesDepuisNom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import type { LieuxAAjouterData } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/action/ajouter-des-lieux-activite.validation'
import { depuisLePanier } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/action/panier.transfer'
import { planifierLesRattachements } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/domain/planifier-les-rattachements'
import { appliquerLesDestinations } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementations/prisma/ajouter-des-lieux-activite.mutation'
import {
  etatDuLieu,
  lieuPorteurDeLaCarto,
  nouvelIdentifiantDeLieu,
} from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementations/prisma/situation-du-lieu.query'
import { nouveauLieu } from '@/features/lieux-activite/abilities/creer-lieu-activite/action/saisie-du-lieu.transfer'
import { creerLieuActivite } from '@/features/lieux-activite/abilities/creer-lieu-activite/domain/creer-lieu-activite'
import { enregistrerLieuActivite } from '@/features/lieux-activite/abilities/creer-lieu-activite/implementations/prisma/enregistrer-lieu-activite.mutation'
import {
  type CreerLieuActiviteData,
  CreerLieuActiviteValidation,
} from '@/features/lieux-activite/action/creer-lieu-activite.validation'
import { LieuId } from '@/features/lieux-activite/domain/identifiants/lieu-id'
import { MediateurId } from '@/features/lieux-activite/domain/identifiants/mediateur-id'
import { UtilisateurId } from '@/features/lieux-activite/domain/identifiants/utilisateur-id'
import { horairesVides } from '@/features/lieux-activite/domain/saisie/horaires-d-ouverture'
import { lieuxAuMemeEndroit } from '@/features/lieux-activite/implementations/prisma/lieux-au-meme-endroit.query'
import type { Typologie } from '@/generated/prisma/client'

setDefaultTimeout(60_000)

export const effacerDuRegistre = async (
  lieuIds: readonly string[],
): Promise<void> => {
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
  delete semisDeLieux.lieux
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
  delete semis.fiche
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
  delete semisSiret.lieuxASiret
  if (!semé) return

  await effacerDuRegistre([semé.premierId, semé.secondId])
  await prismaClient.lieuInclusion.deleteMany({
    where: { id: { in: [semé.premierId, semé.secondId] } },
  })
})

const scenario: {
  utilisateurId?: string
  mediateurId?: string
  lieux: Set<string>
} = { lieux: new Set() }

export const utilisateurCourant = (): string => {
  if (scenario.utilisateurId === undefined)
    throw new Error('Aucun médiateur semé')
  return scenario.utilisateurId
}

export const mediateurCourant = (): string => {
  if (scenario.mediateurId === undefined)
    throw new Error('Aucun médiateur semé')
  return scenario.mediateurId
}

export const suivreLeLieu = (id: string): void => {
  scenario.lieux.add(id)
}

const suivreLesLieux = (ids: readonly string[]): void => {
  scenario.lieux = new Set([...scenario.lieux, ...ids])
}

Given('je suis un médiateur', async () => {
  const utilisateurId = v4()
  await prismaClient.user.create({
    data: {
      id: utilisateurId,
      email: `lieux-reconnus-${utilisateurId}@example.com`,
    },
  })
  const { id } = await prismaClient.mediateur.create({
    data: { userId: utilisateurId },
    select: { id: true },
  })
  scenario.utilisateurId = utilisateurId
  scenario.mediateurId = id
})

After(async () => {
  const utilisateurId = scenario.utilisateurId
  const lieux = [...scenario.lieux]
  delete scenario.utilisateurId
  delete scenario.mediateurId
  scenario.lieux = new Set()
  if (utilisateurId === undefined) return

  const rattaches = await prismaClient.mediateurEnActivite.findMany({
    where: { mediateur: { userId: utilisateurId } },
    select: { structureId: true },
  })
  const tous = [
    ...new Set([...lieux, ...rattaches.map(({ structureId }) => structureId)]),
  ]

  await prismaClient.mediateurEnActivite.deleteMany({
    where: { mediateur: { userId: utilisateurId } },
  })
  await prismaClient.mediateur.deleteMany({ where: { userId: utilisateurId } })
  await prismaClient.user.deleteMany({ where: { id: utilisateurId } })
  await effacerDuRegistre(tous)
  await prismaClient.lieuInclusion.deleteMany({
    where: { id: { in: tous }, mediateursEnActivite: { none: {} } },
  })
})

const adresseDeTest = {
  adresse: '1 rue de la Paix',
  commune: 'Paris',
  codePostal: '75001',
  codeInsee: '75101',
}

const seedLieuActivite = async (
  data: {
    nom?: string
    siret?: string | null
    siretNonVerifie?: string | null
    visiblePourCartographieNationale?: boolean
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
  suivreLeLieu(id)
  return id
}

const renseigner = async (saisies: LieuxAAjouterData['lieux']) => {
  const maintenant = new Date()
  const lieux = depuisLePanier(saisies)

  assert.ok(lieux.success, 'Les lieux saisis auraient dû être acceptés')

  const destinations = await planifierLesRattachements({
    etatDuLieu,
    lieuPorteurDeLaCarto,
    lieuxAuMemeEndroit,
    nouvelIdentifiantDeLieu,
  })({
    lieux: lieux.data,
    structuresCarto: new Map(),
    maintenant,
  })

  assert.ok(destinations.success, 'Les lieux désirés auraient dû se résoudre')

  await prismaClient.$transaction((transaction) =>
    appliquerLesDestinations(transaction, {
      utilisateurId: utilisateurCourant(),
      destinations: destinations.data,
      maintenant,
    }),
  )
}

const creerUnLieuDActivite = (saisie: CreerLieuActiviteData) =>
  creerLieuActivite({
    lieuxAuMemeEndroit,
    enregistrer: enregistrerLieuActivite,
  })({
    lieu: nouveauLieu(
      saisie,
      UtilisateurId(utilisateurCourant()),
      new Date(),
      LieuId(crypto.randomUUID()),
    ),
    mediateurId: MediateurId(mediateurCourant()),
  })

const typologiesLues = (nom: string): string =>
  [nom, `${nom} SAS`].map((lu) => typologiesDepuisNom(lu).join()).join(';')

export const nomUnique = (prefixe: string): string => {
  const nom = `${prefixe} ${v4()}`
  return typologiesLues(nom) === typologiesLues(prefixe)
    ? nom
    : nomUnique(prefixe)
}

const reconnus = {
  lieuDisponibleId: '',
  nomDuLieuDisponible: '',
  siretDuLieuDisponible: '',
  nomDuNouveauLieu: '',
  communeDuLieuDisponible: '',
  lieuCreeId: '',
  lieuSupprimeId: '',
}

const cartoIdDesynchronise = () => `Coop-numérique_${v4()}`

const adresseDuLieuDisponible = {
  adresse: '1 rue de la Paix',
  commune: 'Paris',
  codePostal: '75001',
  codeInsee: '75101',
  banId: '75101_7160_00001',
  latitude: 48.86,
  longitude: 2.33,
}

const saisieDeCreation = (
  nom: string,
  ailleurs?: {
    adresse?: string
    codeInsee?: string
    commune?: string
    latitude?: number
    longitude?: number
  },
  siret?: string,
) =>
  CreerLieuActiviteValidation.parse({
    nom,
    siret,
    typologies: ['ASSO'],
    openingHours: horairesVides,
    adresseBan: {
      id: 'ban-test',
      nom: ailleurs?.adresse ?? adresseDuLieuDisponible.adresse,
      commune: ailleurs?.commune ?? adresseDuLieuDisponible.commune,
      codePostal: adresseDuLieuDisponible.codePostal,
      codeInsee: ailleurs?.codeInsee ?? '75101',
      contexte: '75, Paris, Île-de-France',
      latitude: ailleurs?.latitude ?? 48.86,
      longitude: ailleurs?.longitude ?? 2.33,
    },
  })

const siretDeTest = () => v4().replace(/\D/g, '').padEnd(14, '0').slice(0, 14)

const creerEtRattacher = async (saisie: CreerLieuActiviteData) => {
  const resultat = await creerUnLieuDActivite(saisie)
  assert.ok(resultat.success, 'La création du lieu aurait dû réussir')
  suivreLeLieu(resultat.data.destination.id)
  return resultat.data.destination.id
}

const activitesActivesPour = (structureId: string) =>
  prismaClient.mediateurEnActivite.findMany({
    where: {
      mediateur: { userId: utilisateurCourant() },
      structureId,
      suppression: null,
      fin: null,
    },
  })

Given('un lieu d’activité est disponible', async () => {
  reconnus.nomDuLieuDisponible = nomUnique('Lieu disponible')
  reconnus.lieuDisponibleId = await seedLieuActivite({
    nom: reconnus.nomDuLieuDisponible,
  })
})

Given(
  'un lieu d’activité est disponible, identifié par son SIRET',
  async () => {
    reconnus.nomDuLieuDisponible = nomUnique('Lieu disponible')
    reconnus.siretDuLieuDisponible = siretDeTest()
    reconnus.lieuDisponibleId = await seedLieuActivite({
      nom: reconnus.nomDuLieuDisponible,
      siret: reconnus.siretDuLieuDisponible,
    })
  },
)

Given(
  'un lieu d’activité est disponible, dénommé comme une mairie',
  async () => {
    reconnus.communeDuLieuDisponible = v4()
    reconnus.nomDuLieuDisponible = `Mairie de ${reconnus.communeDuLieuDisponible}`
    reconnus.lieuDisponibleId = await seedLieuActivite({
      nom: reconnus.nomDuLieuDisponible,
    })
  },
)

Given(
  'un lieu d’activité est disponible, portant un SIRET de provenance inconnue',
  async () => {
    reconnus.nomDuLieuDisponible = nomUnique('Lieu disponible')
    reconnus.siretDuLieuDisponible = siretDeTest()
    reconnus.lieuDisponibleId = await seedLieuActivite({
      nom: reconnus.nomDuLieuDisponible,
      siretNonVerifie: siretDeTest(),
    })
  },
)

Given(
  'un lieu d’activité est disponible, enregistré sous le code INSEE de la commune',
  async () => {
    reconnus.nomDuLieuDisponible = nomUnique('Lieu disponible')
    reconnus.lieuDisponibleId = await seedLieuActivite({
      nom: reconnus.nomDuLieuDisponible,
      adresse: { ...adresseDuLieuDisponible, codeInsee: '75056' },
    })
  },
)

Given(
  'un lieu d’activité est disponible dans une commune voisine du même code postal',
  async () => {
    reconnus.nomDuLieuDisponible = nomUnique('Mairie')
    reconnus.lieuDisponibleId = await seedLieuActivite({
      nom: reconnus.nomDuLieuDisponible,
      adresse: {
        adresse: '2 rue de l’Eglise',
        commune: 'Village Voisin',
        codePostal: '70130',
        codeInsee: '70539',
      },
    })
  },
)

Given('un lieu d’activité non diffusible est disponible', async () => {
  reconnus.nomDuLieuDisponible = '[Non diffusible]'
  reconnus.lieuDisponibleId = await seedLieuActivite({
    nom: reconnus.nomDuLieuDisponible,
    adresse: { ...adresseDuLieuDisponible, codeInsee: '75101' },
  })
})

Given('un lieu d’activité sans adresse est disponible', async () => {
  reconnus.nomDuLieuDisponible = nomUnique('Mairie de')
  reconnus.lieuDisponibleId = await seedLieuActivite({
    nom: reconnus.nomDuLieuDisponible,
    adresse: {
      adresse: '',
      commune: 'Paris',
      codePostal: '75001',
      codeInsee: '75101',
    },
    banId: null,
  })
})

Given(
  'un lieu d’activité est disponible, dont l’adresse est écrite en abrégé',
  async () => {
    reconnus.nomDuLieuDisponible = nomUnique('Espace numérique')
    reconnus.lieuDisponibleId = await seedLieuActivite({
      nom: reconnus.nomDuLieuDisponible,
      adresse: {
        adresse: 'PL DU HUIT MAI 1945',
        commune: 'Paris',
        codePostal: '75001',
        codeInsee: '75101',
      },
      position: { latitude: 48.86, longitude: 2.33 },
    })
  },
)

When('je renseigne un nouveau lieu nommé {string}', async (nom: string) => {
  await renseigner([
    {
      nom,
      adresse: '12 rue des Lilas',
      commune: 'Lyon',
      codePostal: '69000',
      codeInsee: '69123',
      banId: '69123_5678_00012',
      latitude: 45.75,
      longitude: 4.85,
    },
  ])
})

When(
  'je renseigne un lieu de la cartographie nationale introuvable dans l’Entrepôt, nommé {string}',
  async (nom: string) => {
    await renseigner([
      {
        structureCartographieNationaleId: cartoIdDesynchronise(),
        nom,
        adresse: '3 rue de Bretagne',
        commune: 'Paris',
        codePostal: '75003',
        codeInsee: '75103',
        banId: '75103_1234_00003',
        latitude: 48.86,
        longitude: 2.36,
      },
    ])
  },
)

When(
  'je renseigne ce lieu par son entrée de cartographie nationale',
  async () => {
    await renseigner([
      {
        structureCartographieNationaleId: cartoIdDesynchronise(),
        nom: reconnus.nomDuLieuDisponible,
        ...adresseDuLieuDisponible,
      },
    ])
  },
)

When(
  'je renseigne un lieu de l’annuaire des entreprises à la même adresse',
  async () => {
    await renseigner([
      {
        siret: reconnus.siretDuLieuDisponible,
        nom: `${reconnus.nomDuLieuDisponible} SAS`,
        ...adresseDuLieuDisponible,
      },
    ])
  },
)

When(
  'je renseigne deux fois le nouveau lieu nommé {string}',
  async (nom: string) => {
    reconnus.nomDuNouveauLieu = nomUnique(nom)
    const nouveauLieu = {
      nom: reconnus.nomDuNouveauLieu,
      adresse: '12 rue des Lilas',
      commune: 'Lyon',
      codePostal: '69000',
      codeInsee: '69123',
      latitude: 45.75,
      banId: '69123_5678_00012',
      longitude: 4.85,
    }

    await renseigner([nouveauLieu, nouveauLieu])
  },
)

Given(
  'un lieu d’activité identique a été retiré de la cartographie par la modération',
  async () => {
    reconnus.nomDuNouveauLieu = nomUnique('Point numerique')
    reconnus.lieuSupprimeId = await seedLieuActivite({
      nom: reconnus.nomDuNouveauLieu,
      visiblePourCartographieNationale: true,
      supprime: true,
    })
  },
)

Given(
  'un lieu d’activité supprimé porte un nom qu’un autre lieu contient',
  async () => {
    reconnus.nomDuNouveauLieu = nomUnique('Fleury')
    reconnus.lieuSupprimeId = await seedLieuActivite({
      nom: reconnus.nomDuNouveauLieu,
      supprime: true,
    })
  },
)

When(
  'je renseigne un lieu de l’annuaire des entreprises de même nom et même adresse, mais d’un autre SIRET',
  async () => {
    reconnus.nomDuNouveauLieu = reconnus.nomDuLieuDisponible
    await renseigner([
      {
        siret: siretDeTest(),
        nom: reconnus.nomDuLieuDisponible,
        ...adresseDuLieuDisponible,
      },
    ])

    const active = await prismaClient.mediateurEnActivite.findFirstOrThrow({
      where: {
        mediateur: { userId: utilisateurCourant() },
        suppression: null,
        fin: null,
      },
      select: { structureId: true },
    })
    reconnus.lieuCreeId = active.structureId
    suivreLeLieu(reconnus.lieuCreeId)
  },
)

When(
  'je crée un lieu d’activité de même nom, à une autre adresse',
  async () => {
    reconnus.nomDuNouveauLieu = reconnus.nomDuLieuDisponible
    const resultat = await creerUnLieuDActivite(
      saisieDeCreation(reconnus.nomDuLieuDisponible, {
        adresse: '99 avenue Ailleurs',
        codeInsee: '75102',
      }),
    )
    assert.ok(resultat.success, 'La création du lieu aurait dû réussir')
    reconnus.lieuCreeId = resultat.data.destination.id
    suivreLeLieu(reconnus.lieuCreeId)
  },
)

When(
  'je crée un lieu d’activité de même nom et même adresse, sous le code INSEE de l’arrondissement',
  async () => {
    reconnus.nomDuNouveauLieu = reconnus.nomDuLieuDisponible
    reconnus.lieuCreeId = await creerEtRattacher(
      saisieDeCreation(reconnus.nomDuLieuDisponible),
    )
  },
)

When(
  'je crée un lieu d’activité de même nom et même adresse, dans ma commune',
  async () => {
    reconnus.nomDuNouveauLieu = reconnus.nomDuLieuDisponible
    reconnus.lieuCreeId = await creerEtRattacher(
      saisieDeCreation(reconnus.nomDuLieuDisponible, {
        adresse: '2 rue de l’Eglise',
        commune: 'Ma Commune',
        codeInsee: '70257',
      }),
    )
  },
)

When(
  'je crée un lieu d’activité non diffusible à la même adresse',
  async () => {
    reconnus.nomDuNouveauLieu = '[Non diffusible]'
    reconnus.lieuCreeId = await creerEtRattacher(
      saisieDeCreation('[Non diffusible]'),
    )
  },
)

When('je crée un lieu d’activité de même nom, avec une adresse', async () => {
  reconnus.nomDuNouveauLieu = reconnus.nomDuLieuDisponible
  reconnus.lieuCreeId = await creerEtRattacher(
    saisieDeCreation(reconnus.nomDuLieuDisponible),
  )
})

When(
  'je renseigne un lieu de l’annuaire des entreprises portant un SIRET',
  async () => {
    reconnus.nomDuNouveauLieu = nomUnique('Annuaire')
    reconnus.siretDuLieuDisponible = siretDeTest()
    await renseigner([
      {
        siret: reconnus.siretDuLieuDisponible,
        nom: reconnus.nomDuNouveauLieu,
        ...adresseDuLieuDisponible,
        banId: 'ban-voie-de-test',
      },
    ])

    const active = await prismaClient.mediateurEnActivite.findFirstOrThrow({
      where: {
        mediateur: { userId: utilisateurCourant() },
        suppression: null,
        fin: null,
      },
      select: { structureId: true },
    })
    reconnus.lieuCreeId = active.structureId
    suivreLeLieu(reconnus.lieuCreeId)
  },
)

Then('le lieu créé porte l’identifiant BAN de son adresse', async () => {
  const lieu = await prismaClient.lieuInclusion.findUniqueOrThrow({
    where: { id: reconnus.lieuCreeId },
    select: { banId: true },
  })
  assert.strictEqual(
    lieu.banId,
    'ban-voie-de-test',
    'L’identifiant BAN de l’adresse a été perdu à l’écriture',
  )
})

Then('le lieu créé porte ce SIRET, non vérifié', async () => {
  const lieu = await prismaClient.lieuInclusion.findUniqueOrThrow({
    where: { id: reconnus.lieuCreeId },
    select: { siret: true, synchronisationSiret: true },
  })
  assert.strictEqual(lieu.siret, reconnus.siretDuLieuDisponible)
  assert.strictEqual(
    lieu.synchronisationSiret,
    null,
    'Un SIRET soumis par le navigateur a été marqué comme vérifié',
  )
})

When(
  'je crée un lieu d’activité de même nom, à la même position mais sous l’adresse complète',
  async () => {
    reconnus.nomDuNouveauLieu = reconnus.nomDuLieuDisponible
    reconnus.lieuCreeId = await creerEtRattacher(
      saisieDeCreation(reconnus.nomDuLieuDisponible, {
        adresse: 'Place du 8 Mai 1945',
        latitude: 48.86,
        longitude: 2.33,
      }),
    )
  },
)

When(
  'je crée un lieu d’activité de même nom, à une autre position de la commune',
  async () => {
    reconnus.nomDuNouveauLieu = reconnus.nomDuLieuDisponible
    reconnus.lieuCreeId = await creerEtRattacher(
      saisieDeCreation(reconnus.nomDuLieuDisponible, {
        adresse: 'Place du 8 Mai 1945',
        latitude: 48.873,
        longitude: 2.33,
      }),
    )
  },
)

When('je crée un lieu d’activité que la coop ignore', async () => {
  reconnus.nomDuNouveauLieu = nomUnique('Tiers-lieu')
  const resultat = await creerUnLieuDActivite(
    saisieDeCreation(reconnus.nomDuNouveauLieu),
  )
  assert.ok(resultat.success, 'La création du lieu aurait dû réussir')
  reconnus.lieuCreeId = resultat.data.destination.id
  suivreLeLieu(reconnus.lieuCreeId)
})

When('je crée un lieu d’activité identique à ce lieu retiré', async () => {
  const resultat = await creerUnLieuDActivite(
    saisieDeCreation(reconnus.nomDuNouveauLieu),
  )
  assert.ok(resultat.success, 'La création du lieu aurait dû réussir')
  reconnus.lieuCreeId = resultat.data.destination.id
  suivreLeLieu(reconnus.lieuCreeId)
})

When(
  'je crée un lieu d’activité dont le nom contient celui du lieu supprimé, à une autre adresse',
  async () => {
    const resultat = await creerUnLieuDActivite(
      saisieDeCreation(`${reconnus.nomDuNouveauLieu} Annexe`, {
        adresse: '99 avenue Ailleurs',
        codeInsee: '75102',
      }),
    )
    assert.ok(resultat.success, 'La création du lieu aurait dû réussir')
    reconnus.lieuCreeId = resultat.data.destination.id
    suivreLeLieu(reconnus.lieuCreeId)
  },
)

When(
  'je crée un lieu d’activité dénommé comme la commune, à la même adresse',
  async () => {
    const resultat = await creerUnLieuDActivite(
      saisieDeCreation(
        `COMMUNE DE ${reconnus.communeDuLieuDisponible}`.toUpperCase(),
      ),
    )
    assert.ok(resultat.success, 'La création du lieu aurait dû réussir')
    reconnus.lieuCreeId = resultat.data.destination.id
    suivreLeLieu(reconnus.lieuCreeId)
  },
)

Then('le lieu créé est un de mes lieux d’activité actifs', async () => {
  const actives = await activitesActivesPour(reconnus.lieuCreeId)
  assert.strictEqual(
    actives.length,
    1,
    'Le lieu créé n’est pas un lieu d’activité actif',
  )

  const lieu = await prismaClient.lieuInclusion.findUniqueOrThrow({
    where: { id: reconnus.lieuCreeId },
    select: { nom: true },
  })
  assert.strictEqual(lieu.nom, reconnus.nomDuNouveauLieu)
})

Then('ce lieu n’est pas visible sur la cartographie nationale', async () => {
  const lieu = await prismaClient.lieuInclusion.findUniqueOrThrow({
    where: { id: reconnus.lieuCreeId },
    select: { visiblePourCartographieNationale: true },
  })
  assert.strictEqual(
    lieu.visiblePourCartographieNationale,
    false,
    'Le lieu relevé est réapparu sur la cartographie nationale',
  )
})

Then('je n’ai qu’un seul lieu d’activité actif', async () => {
  const actives = await prismaClient.mediateurEnActivite.findMany({
    where: {
      mediateur: { userId: utilisateurCourant() },
      suppression: null,
      fin: null,
    },
    select: { structureId: true },
  })
  assert.strictEqual(actives.length, 1, 'Un lieu a été rattaché en trop')
})

Then('un second lieu d’activité a été créé', async () => {
  assert.notStrictEqual(
    reconnus.lieuCreeId,
    reconnus.lieuDisponibleId,
    'Le lieu a été rapproché de l’existant alors qu’il en est distinct',
  )

  const lieu = await prismaClient.lieuInclusion.findUniqueOrThrow({
    where: { id: reconnus.lieuCreeId },
    select: { nom: true },
  })
  assert.strictEqual(lieu.nom, reconnus.nomDuNouveauLieu)
})

Then('le lieu supprimé n’a pas été relevé', async () => {
  const lieu = await prismaClient.lieuInclusion.findUniqueOrThrow({
    where: { id: reconnus.lieuSupprimeId },
    select: { suppression: true },
  })
  assert.notStrictEqual(
    lieu.suppression,
    null,
    'Le lieu supprimé a été relevé alors que la corrélation était faible',
  )
})

When('je renseigne ce lieu retiré en le désignant', async () => {
  await renseigner([
    {
      id: reconnus.lieuSupprimeId,
      nom: reconnus.nomDuNouveauLieu,
      ...adresseDuLieuDisponible,
    },
  ])
})

Then('le lieu retiré est relevé et je l’ai rejoint', async () => {
  const lieu = await prismaClient.lieuInclusion.findUniqueOrThrow({
    where: { id: reconnus.lieuSupprimeId },
    select: { suppression: true },
  })
  assert.strictEqual(
    lieu.suppression,
    null,
    'Le lieu désigné est resté supprimé',
  )

  const actives = await activitesActivesPour(reconnus.lieuSupprimeId)
  assert.strictEqual(actives.length, 1, 'Le médiateur n’a pas rejoint le lieu')
})

Then('ce lieu est un de mes lieux d’activité actifs', async () => {
  const actives = await activitesActivesPour(reconnus.lieuDisponibleId)
  assert.strictEqual(
    actives.length,
    1,
    'Le lieu n’est pas un lieu d’activité actif',
  )
})

Then('aucun autre lieu d’activité n’a été créé', async () => {
  const actives = await prismaClient.mediateurEnActivite.findMany({
    where: {
      mediateur: { userId: utilisateurCourant() },
      suppression: null,
      fin: null,
    },
    select: { structureId: true },
  })
  assert.deepStrictEqual(
    actives.map(({ structureId }) => structureId),
    [reconnus.lieuDisponibleId],
    'Un lieu a été créé ou rattaché en plus du lieu renseigné',
  )
})

Then(
  'un seul lieu d’activité nommé {string} est créé et rattaché',
  async (_nom: string) => {
    const actives = await prismaClient.mediateurEnActivite.findMany({
      where: {
        mediateur: { userId: utilisateurCourant() },
        suppression: null,
        fin: null,
      },
      select: { lieuInclusion: { select: { id: true, nom: true } } },
    })

    const rattaches = actives.filter(
      (activite) => activite.lieuInclusion.nom === reconnus.nomDuNouveauLieu,
    )
    assert.strictEqual(
      rattaches.length,
      1,
      'Le nouveau lieu a été rattaché plus d’une fois',
    )
    suivreLesLieux(rattaches.map(({ lieuInclusion }) => lieuInclusion.id))
  },
)

Then(
  'un lieu d’activité nommé {string} est créé et rattaché',
  async (nom: string) => {
    const actives = await prismaClient.mediateurEnActivite.findMany({
      where: {
        mediateur: { userId: utilisateurCourant() },
        suppression: null,
        fin: null,
      },
      select: { lieuInclusion: { select: { id: true, nom: true } } },
    })

    const rattache = actives.find(
      (activite) => activite.lieuInclusion.nom === nom,
    )
    assert.ok(rattache, 'Le nouveau lieu n’a pas été créé et rattaché')
    suivreLeLieu(rattache.lieuInclusion.id)
  },
)
