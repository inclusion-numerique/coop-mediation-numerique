import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma/prismaClient'
import { emptyOpeningHours } from '@/features/lieux-activite/domain/horaires-d-ouverture'
import type { Typologie } from '@/generated/prisma/client'
import { rattacherAuLieuDesire } from './abilities/ajouter-des-lieux-activite/implementations/prisma/rattacher-au-lieu-desire'
import { creerLieuActivite } from './abilities/creer-lieu-activite'
import { nouveauLieu } from './abilities/creer-lieu-activite/action/depuis-la-saisie'
import {
  type CreerLieuActiviteData,
  CreerLieuActiviteValidation,
} from './domain/creation/creer-lieu-activite.validation'
import { MediateurId } from './domain/mediateur-id'
import { UserId } from './domain/user-id'
import {
  mediateurCourant as mediateur,
  suivreLeLieu as trackLieuActivite,
  utilisateurCourant as utilisateur,
} from './lieux-activite.cucumber'

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
  trackLieuActivite(id)
  return id
}

const renseigner = (
  lieux: Parameters<typeof rattacherAuLieuDesire>[1]['lieu'][],
) =>
  prismaClient.$transaction(async (transaction) => {
    await lieux.reduce(async (precedents, lieu) => {
      await precedents
      await rattacherAuLieuDesire(transaction, {
        userId: utilisateur(),
        lieu,
        structuresCartoParId: new Map(),
        maintenant: new Date(),
      })
    }, Promise.resolve())
  })

const creerUnLieuDActivite = (saisie: CreerLieuActiviteData) =>
  creerLieuActivite({
    lieu: nouveauLieu(saisie, UserId(utilisateur()), new Date()),
    mediateurId: MediateurId(mediateur()),
  })

let lieuDisponibleId = ''

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

let nomDuLieuDisponible = ''
let siretDuLieuDisponible = ''
let nomDuNouveauLieu = ''
let communeDuLieuDisponible = ''
let lieuCreeId = ''
let lieuSupprimeId = ''

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
    openingHours: emptyOpeningHours,
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
  trackLieuActivite(resultat.data.id)
  return resultat.data.id
}

const activitesActivesPour = (structureId: string) =>
  prismaClient.mediateurEnActivite.findMany({
    where: {
      mediateur: { userId: utilisateur() },
      structureId,
      suppression: null,
      fin: null,
    },
  })

Given('un lieu d’activité est disponible', async () => {
  nomDuLieuDisponible = `Lieu disponible ${v4()}`
  lieuDisponibleId = await seedLieuActivite({ nom: nomDuLieuDisponible })
})

Given(
  'un lieu d’activité est disponible, identifié par son SIRET',
  async () => {
    nomDuLieuDisponible = `Lieu disponible ${v4()}`
    siretDuLieuDisponible = siretDeTest()
    lieuDisponibleId = await seedLieuActivite({
      nom: nomDuLieuDisponible,
      siret: siretDuLieuDisponible,
    })
  },
)

Given(
  'un lieu d’activité est disponible, dénommé comme une mairie',
  async () => {
    communeDuLieuDisponible = v4()
    nomDuLieuDisponible = `Mairie de ${communeDuLieuDisponible}`
    lieuDisponibleId = await seedLieuActivite({ nom: nomDuLieuDisponible })
  },
)

Given(
  'un lieu d’activité est disponible, portant un SIRET de provenance inconnue',
  async () => {
    nomDuLieuDisponible = `Lieu disponible ${v4()}`
    siretDuLieuDisponible = siretDeTest()
    lieuDisponibleId = await seedLieuActivite({
      nom: nomDuLieuDisponible,
      siretNonVerifie: siretDeTest(),
    })
  },
)

Given(
  'un lieu d’activité est disponible, enregistré sous le code INSEE de la commune',
  async () => {
    nomDuLieuDisponible = `Lieu disponible ${v4()}`
    lieuDisponibleId = await seedLieuActivite({
      nom: nomDuLieuDisponible,
      adresse: { ...adresseDuLieuDisponible, codeInsee: '75056' },
    })
  },
)

Given(
  'un lieu d’activité est disponible dans une commune voisine du même code postal',
  async () => {
    nomDuLieuDisponible = `Mairie ${v4()}`
    lieuDisponibleId = await seedLieuActivite({
      nom: nomDuLieuDisponible,
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
  nomDuLieuDisponible = '[Non diffusible]'
  lieuDisponibleId = await seedLieuActivite({
    nom: nomDuLieuDisponible,
    adresse: { ...adresseDuLieuDisponible, codeInsee: '75101' },
  })
})

Given('un lieu d’activité sans adresse est disponible', async () => {
  nomDuLieuDisponible = `Mairie de ${v4()}`
  lieuDisponibleId = await seedLieuActivite({
    nom: nomDuLieuDisponible,
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
    nomDuLieuDisponible = `Espace numérique ${v4()}`
    lieuDisponibleId = await seedLieuActivite({
      nom: nomDuLieuDisponible,
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
        nom: nomDuLieuDisponible,
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
        siret: siretDuLieuDisponible,
        nom: `${nomDuLieuDisponible} SAS`,
        ...adresseDuLieuDisponible,
      },
    ])
  },
)

When(
  'je renseigne deux fois le nouveau lieu nommé {string}',
  async (nom: string) => {
    nomDuNouveauLieu = `${nom} ${v4()}`
    const nouveauLieu = {
      nom: nomDuNouveauLieu,
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
    nomDuNouveauLieu = `Point numerique ${v4()}`
    lieuSupprimeId = await seedLieuActivite({
      nom: nomDuNouveauLieu,
      visiblePourCartographieNationale: true,
      supprime: true,
    })
  },
)

Given(
  'un lieu d’activité supprimé porte un nom qu’un autre lieu contient',
  async () => {
    nomDuNouveauLieu = `Fleury ${v4()}`
    lieuSupprimeId = await seedLieuActivite({
      nom: nomDuNouveauLieu,
      supprime: true,
    })
  },
)

When(
  'je renseigne un lieu de l’annuaire des entreprises de même nom et même adresse, mais d’un autre SIRET',
  async () => {
    nomDuNouveauLieu = nomDuLieuDisponible
    await renseigner([
      {
        siret: siretDeTest(),
        nom: nomDuLieuDisponible,
        ...adresseDuLieuDisponible,
      },
    ])

    const active = await prismaClient.mediateurEnActivite.findFirstOrThrow({
      where: {
        mediateur: { userId: utilisateur() },
        suppression: null,
        fin: null,
      },
      select: { structureId: true },
    })
    lieuCreeId = active.structureId
    trackLieuActivite(lieuCreeId)
  },
)

When(
  'je crée un lieu d’activité de même nom, à une autre adresse',
  async () => {
    nomDuNouveauLieu = nomDuLieuDisponible
    const resultat = await creerUnLieuDActivite(
      saisieDeCreation(nomDuLieuDisponible, {
        adresse: '99 avenue Ailleurs',
        codeInsee: '75102',
      }),
    )
    assert.ok(resultat.success, 'La création du lieu aurait dû réussir')
    lieuCreeId = resultat.data.id
    trackLieuActivite(lieuCreeId)
  },
)

When(
  'je crée un lieu d’activité de même nom et même adresse, sous le code INSEE de l’arrondissement',
  async () => {
    nomDuNouveauLieu = nomDuLieuDisponible
    lieuCreeId = await creerEtRattacher(saisieDeCreation(nomDuLieuDisponible))
  },
)

When(
  'je crée un lieu d’activité de même nom et même adresse, dans ma commune',
  async () => {
    nomDuNouveauLieu = nomDuLieuDisponible
    lieuCreeId = await creerEtRattacher(
      saisieDeCreation(nomDuLieuDisponible, {
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
    nomDuNouveauLieu = '[Non diffusible]'
    lieuCreeId = await creerEtRattacher(saisieDeCreation('[Non diffusible]'))
  },
)

When('je crée un lieu d’activité de même nom, avec une adresse', async () => {
  nomDuNouveauLieu = nomDuLieuDisponible
  lieuCreeId = await creerEtRattacher(saisieDeCreation(nomDuLieuDisponible))
})

When(
  'je renseigne un lieu de l’annuaire des entreprises portant un SIRET',
  async () => {
    nomDuNouveauLieu = `Annuaire ${v4()}`
    siretDuLieuDisponible = siretDeTest()
    await renseigner([
      {
        siret: siretDuLieuDisponible,
        nom: nomDuNouveauLieu,
        ...adresseDuLieuDisponible,
        banId: 'ban-voie-de-test',
      },
    ])

    const active = await prismaClient.mediateurEnActivite.findFirstOrThrow({
      where: {
        mediateur: { userId: utilisateur() },
        suppression: null,
        fin: null,
      },
      select: { structureId: true },
    })
    lieuCreeId = active.structureId
    trackLieuActivite(lieuCreeId)
  },
)

Then('le lieu créé porte l’identifiant BAN de son adresse', async () => {
  const lieu = await prismaClient.lieuInclusion.findUniqueOrThrow({
    where: { id: lieuCreeId },
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
    where: { id: lieuCreeId },
    select: { siret: true, synchronisationSiret: true },
  })
  assert.strictEqual(lieu.siret, siretDuLieuDisponible)
  assert.strictEqual(
    lieu.synchronisationSiret,
    null,
    'Un SIRET soumis par le navigateur a été marqué comme vérifié',
  )
})

When(
  'je crée un lieu d’activité de même nom, à la même position mais sous l’adresse complète',
  async () => {
    nomDuNouveauLieu = nomDuLieuDisponible
    lieuCreeId = await creerEtRattacher(
      saisieDeCreation(nomDuLieuDisponible, {
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
    nomDuNouveauLieu = nomDuLieuDisponible
    lieuCreeId = await creerEtRattacher(
      saisieDeCreation(nomDuLieuDisponible, {
        adresse: 'Place du 8 Mai 1945',
        latitude: 48.873,
        longitude: 2.33,
      }),
    )
  },
)

When('je crée un lieu d’activité que la coop ignore', async () => {
  nomDuNouveauLieu = `Tiers-lieu ${v4()}`
  const resultat = await creerUnLieuDActivite(
    saisieDeCreation(nomDuNouveauLieu),
  )
  assert.ok(resultat.success, 'La création du lieu aurait dû réussir')
  lieuCreeId = resultat.data.id
  trackLieuActivite(lieuCreeId)
})

When('je crée un lieu d’activité identique à ce lieu retiré', async () => {
  const resultat = await creerUnLieuDActivite(
    saisieDeCreation(nomDuNouveauLieu),
  )
  assert.ok(resultat.success, 'La création du lieu aurait dû réussir')
  lieuCreeId = resultat.data.id
  trackLieuActivite(lieuCreeId)
})

When(
  'je crée un lieu d’activité dont le nom contient celui du lieu supprimé, à une autre adresse',
  async () => {
    const resultat = await creerUnLieuDActivite(
      saisieDeCreation(`${nomDuNouveauLieu} Annexe`, {
        adresse: '99 avenue Ailleurs',
        codeInsee: '75102',
      }),
    )
    assert.ok(resultat.success, 'La création du lieu aurait dû réussir')
    lieuCreeId = resultat.data.id
    trackLieuActivite(lieuCreeId)
  },
)

When(
  'je crée un lieu d’activité dénommé comme la commune, à la même adresse',
  async () => {
    const resultat = await creerUnLieuDActivite(
      saisieDeCreation(`COMMUNE DE ${communeDuLieuDisponible}`.toUpperCase()),
    )
    assert.ok(resultat.success, 'La création du lieu aurait dû réussir')
    lieuCreeId = resultat.data.id
    trackLieuActivite(lieuCreeId)
  },
)

Then('le lieu créé est un de mes lieux d’activité actifs', async () => {
  const actives = await activitesActivesPour(lieuCreeId)
  assert.strictEqual(
    actives.length,
    1,
    'Le lieu créé n’est pas un lieu d’activité actif',
  )

  const lieu = await prismaClient.lieuInclusion.findUniqueOrThrow({
    where: { id: lieuCreeId },
    select: { nom: true },
  })
  assert.strictEqual(lieu.nom, nomDuNouveauLieu)
})

Then('ce lieu n’est pas visible sur la cartographie nationale', async () => {
  const lieu = await prismaClient.lieuInclusion.findUniqueOrThrow({
    where: { id: lieuCreeId },
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
      mediateur: { userId: utilisateur() },
      suppression: null,
      fin: null,
    },
    select: { structureId: true },
  })
  assert.strictEqual(actives.length, 1, 'Un lieu a été rattaché en trop')
})

Then('un second lieu d’activité a été créé', async () => {
  assert.notStrictEqual(
    lieuCreeId,
    lieuDisponibleId,
    'Le lieu a été rapproché de l’existant alors qu’il en est distinct',
  )

  const lieu = await prismaClient.lieuInclusion.findUniqueOrThrow({
    where: { id: lieuCreeId },
    select: { nom: true },
  })
  assert.strictEqual(lieu.nom, nomDuNouveauLieu)
})

Then('le lieu supprimé n’a pas été relevé', async () => {
  const lieu = await prismaClient.lieuInclusion.findUniqueOrThrow({
    where: { id: lieuSupprimeId },
    select: { suppression: true },
  })
  assert.notStrictEqual(
    lieu.suppression,
    null,
    'Le lieu supprimé a été relevé alors que la corrélation était faible',
  )
})

Then('ce lieu est un de mes lieux d’activité actifs', async () => {
  const actives = await activitesActivesPour(lieuDisponibleId)
  assert.strictEqual(
    actives.length,
    1,
    'Le lieu n’est pas un lieu d’activité actif',
  )
})

Then('aucun autre lieu d’activité n’a été créé', async () => {
  const actives = await prismaClient.mediateurEnActivite.findMany({
    where: {
      mediateur: { userId: utilisateur() },
      suppression: null,
      fin: null,
    },
    select: { structureId: true },
  })
  assert.deepStrictEqual(
    actives.map(({ structureId }) => structureId),
    [lieuDisponibleId],
    'Un lieu a été créé ou rattaché en plus du lieu renseigné',
  )
})

Then(
  'un seul lieu d’activité nommé {string} est créé et rattaché',
  async (_nom: string) => {
    const actives = await prismaClient.mediateurEnActivite.findMany({
      where: {
        mediateur: { userId: utilisateur() },
        suppression: null,
        fin: null,
      },
      select: { lieuInclusion: { select: { id: true, nom: true } } },
    })

    const rattaches = actives.filter(
      (activite) => activite.lieuInclusion.nom === nomDuNouveauLieu,
    )
    assert.strictEqual(
      rattaches.length,
      1,
      'Le nouveau lieu a été rattaché plus d’une fois',
    )
    const [rattache] = rattaches
    trackLieuActivite(rattache.lieuInclusion.id)
  },
)

Then(
  'un lieu d’activité nommé {string} est créé et rattaché',
  async (nom: string) => {
    const actives = await prismaClient.mediateurEnActivite.findMany({
      where: {
        mediateur: { userId: utilisateur() },
        suppression: null,
        fin: null,
      },
      select: { lieuInclusion: { select: { id: true, nom: true } } },
    })

    const rattache = actives.find(
      (activite) => activite.lieuInclusion.nom === nom,
    )
    assert.ok(rattache, 'Le nouveau lieu n’a pas été créé et rattaché')
    trackLieuActivite(rattache.lieuInclusion.id)
  },
)
