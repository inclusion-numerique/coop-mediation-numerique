import assert from 'node:assert'
import { emptyOpeningHours } from '@app/web/components/structure/fields/openingHoursHelpers'
import { creerLieuActivite } from '@app/web/features/inscription/abilities/renseigner-lieux-activite/commands/creer-lieu-activite'
import { renseignerLieuxActivite } from '@app/web/features/inscription/abilities/renseigner-lieux-activite/commands/renseigner-lieux-activite'
import type { CreerLieuActivite } from '@app/web/features/inscription/abilities/renseigner-lieux-activite/domain'
import { mediateurFromUser } from '@app/web/features/inscription/abilities/renseigner-lieux-activite/implementation'
import { ProfilInscription } from '@app/web/features/inscription/domain'
import {
  currentInscriptionUserId,
  seedLieuActivite,
  seedProfilChoisi,
  trackLieuActivite,
} from '@app/web/features/inscription/inscription.cucumber'
import { creerLieuActivite as creerUnLieu } from '@app/web/features/lieux-activite/abilities/creer-lieu-activite'
import { nouveauLieu } from '@app/web/features/lieux-activite/abilities/creer-lieu-activite/action/depuis-la-saisie'
import { MediateurId } from '@app/web/features/lieux-activite/domain/mediateur-id'
import { UserId as LieuUserId } from '@app/web/features/lieux-activite/domain/user-id'
import type { CreerLieuActiviteData } from '@app/web/features/structures/CreerLieuActiviteValidation'
import { CreerLieuActiviteValidation } from '@app/web/features/structures/CreerLieuActiviteValidation'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

/**
 * Même branchement que `app/_actions/inscription/creer-lieu-activite.action.ts` :
 * l'inscription déclare le besoin, l'ability de `lieux-activite` le sert. Les
 * scénarios de corrélation ci-dessous valent donc pour les deux parcours.
 */
const creerDansLesLieuxActivite: CreerLieuActivite = async ({
  userId,
  mediateurId,
  saisie,
}) => {
  const resultat = await creerUnLieu({
    lieu: nouveauLieu(saisie, LieuUserId(userId), new Date()),
    mediateurId: MediateurId(mediateurId),
  })

  assert.ok(resultat.success, "L'ability aurait dû accepter le médiateur")

  return resultat.data
}

const creerUnLieuDActivite = (saisie: CreerLieuActiviteData) =>
  creerLieuActivite({
    command: { userId: currentInscriptionUserId(), saisie },
    mediateurFromUser,
    creerLieuActivite: creerDansLesLieuxActivite,
  })

let lieuDisponibleId = ''
let cartoIdDuLieuDisponible: string | null = null
let ancienLieuId = ''

/**
 * Id de cartographie nationale plausible mais absent de l'Entrepôt : le job
 * nightly de la carto le pose a posteriori sur un lieu déjà créé dans la coop,
 * et il peut ne plus rien désigner (id composite re-clé par une déduplication).
 */
const cartoIdDesynchronise = () => `Coop-numérique_${v4()}`

/**
 * Même adresse que `seedLieuActivite` : c'est elle qui porte la corrélation.
 *
 * Elle porte identifiant BAN et coordonnées, comme toute adresse d'un lieu à
 * créer : le formulaire la géocode avant de l'ajouter, et l'ability refuse
 * désormais de créer un lieu qu'elle ne saurait situer.
 */
const adresseDuLieuDisponible = {
  adresse: '1 rue de la Paix',
  commune: 'Paris',
  codePostal: '75001',
  codeInsee: '75101',
  banId: '75101_7160_00001',
  // Mêmes coordonnées que `saisieDeCreation` : la sonde de corrélation pèse la
  // distance, et un lieu semé à 900 m de celui qu'on saisit ne serait plus le
  // même endroit.
  latitude: 48.86,
  longitude: 2.33,
}

/**
 * La sonde de corrélation cherche dans TOUTE la coop : un homonyme à la même
 * adresse, fût-il le résidu d'un autre scénario, serait un candidat valable.
 * Nom et SIRET sont donc uniques à chaque scénario, pour que la seule
 * corrélation possible soit celle qu'on met en scène.
 */
let nomDuLieuDisponible = ''
let siretDuLieuDisponible = ''
let nomDuNouveauLieu = ''
let communeDuLieuDisponible = ''
let lieuCreeId = ''
let lieuSupprimeId = ''

/**
 * Saisie minimale de création d'un lieu, validée par le contrat lui-même : le
 * scénario ne prouve rien s'il envoie une saisie que l'écran refuserait.
 */
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
      mediateur: { userId: currentInscriptionUserId() },
      structureId,
      suppression: null,
      fin: null,
    },
  })

Given('je suis un médiateur en cours d’inscription', async () => {
  await seedProfilChoisi(ProfilInscription.schema.parse('Mediateur'))
  await prismaClient.mediateur.create({
    data: { id: v4(), userId: currentInscriptionUserId() },
  })
})

Given('un lieu d’activité est disponible', async () => {
  cartoIdDuLieuDisponible = null
  nomDuLieuDisponible = `Lieu disponible ${v4()}`
  lieuDisponibleId = await seedLieuActivite({ nom: nomDuLieuDisponible })
})

/**
 * Un doublon porteur du même id carto, créé AVANT le lieu renseigné : résoudre
 * le lieu par son id carto le rattacherait à ce doublon plutôt qu'au lieu
 * effectivement choisi. C'est l'id interne qui doit trancher.
 */
Given(
  'un doublon plus ancien porte un id de cartographie nationale',
  async () => {
    cartoIdDuLieuDisponible = cartoIdDesynchronise()
    await seedLieuActivite({
      nom: 'Doublon carto',
      structureCartographieNationaleId: cartoIdDuLieuDisponible,
    })
  },
)

Given(
  'un lieu d’activité est disponible, annoté de ce même id de cartographie nationale',
  async () => {
    nomDuLieuDisponible = `Lieu disponible ${v4()}`
    lieuDisponibleId = await seedLieuActivite({
      nom: nomDuLieuDisponible,
      structureCartographieNationaleId: cartoIdDuLieuDisponible,
    })
  },
)

Given(
  'un lieu d’activité est disponible, identifié par son SIRET',
  async () => {
    cartoIdDuLieuDisponible = null
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
    // « Mairie de X » et « COMMUNE DE X » se normalisent tous deux en
    // « ville X » : c'est la correspondance que le scénario met à l'épreuve.
    communeDuLieuDisponible = v4()
    nomDuLieuDisponible = `Mairie de ${communeDuLieuDisponible}`
    lieuDisponibleId = await seedLieuActivite({ nom: nomDuLieuDisponible })
  },
)

Given(
  'un lieu d’activité est disponible, portant un SIRET de provenance inconnue',
  async () => {
    cartoIdDuLieuDisponible = null
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
    // 75056 = Paris (commune) ; la saisie rendra 75101 (1er arrondissement).
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
    // Deux villages d'un même code postal : même nom de rue, communes distinctes.
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
  // Cas réel : employeuse `main` sans adresse, ou payload carto incomplet.
  nomDuLieuDisponible = `Mairie de ${v4()}`
  lieuDisponibleId = await seedLieuActivite({
    nom: nomDuLieuDisponible,
    adresse: {
      adresse: '',
      commune: 'Paris',
      codePostal: '75001',
      codeInsee: '75101',
    },
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

Given('j’ai déjà un lieu d’activité rattaché', async () => {
  ancienLieuId = await seedLieuActivite({ nom: 'Ancien lieu' })
  await prismaClient.mediateurEnActivite.create({
    data: {
      id: v4(),
      mediateur: { connect: { userId: currentInscriptionUserId() } },
      lieuInclusion: { connect: { id: ancienLieuId } },
      debut: new Date(),
    },
  })
})

When('je renseigne ce lieu comme lieu d’activité', async () => {
  const resultat = await renseignerLieuxActivite({
    command: {
      userId: currentInscriptionUserId(),
      lieuxActivite: [
        {
          id: lieuDisponibleId,
          structureCartographieNationaleId: cartoIdDuLieuDisponible,
          nom: nomDuLieuDisponible,
          adresse: '1 rue de la Paix',
          commune: 'Paris',
          codePostal: '75001',
        },
      ],
    },
    trouverStructuresCarto: async () => [],
    maintenant: new Date(),
  })
  assert.ok(resultat.success, 'Le renseignement des lieux aurait dû réussir')
})

When('je renseigne un nouveau lieu nommé {string}', async (nom: string) => {
  const resultat = await renseignerLieuxActivite({
    command: {
      userId: currentInscriptionUserId(),
      lieuxActivite: [
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
      ],
    },
    trouverStructuresCarto: async () => [],
    maintenant: new Date(),
  })
  assert.ok(resultat.success, 'Le renseignement des lieux aurait dû réussir')
})

When(
  'je renseigne un lieu de la cartographie nationale introuvable dans l’Entrepôt, nommé {string}',
  async (nom: string) => {
    const resultat = await renseignerLieuxActivite({
      command: {
        userId: currentInscriptionUserId(),
        lieuxActivite: [
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
        ],
      },
      trouverStructuresCarto: async () => [],
      maintenant: new Date(),
    })
    assert.ok(resultat.success, 'Le renseignement des lieux aurait dû réussir')
  },
)

When(
  'je renseigne ce lieu par son entrée de cartographie nationale',
  async () => {
    // Le lieu existe dans la coop mais n'a pas encore d'id de cartographie
    // nationale : la carto le propose donc comme un lieu qu'elle seule connaît.
    const resultat = await renseignerLieuxActivite({
      command: {
        userId: currentInscriptionUserId(),
        lieuxActivite: [
          {
            structureCartographieNationaleId: cartoIdDesynchronise(),
            nom: nomDuLieuDisponible,
            ...adresseDuLieuDisponible,
          },
        ],
      },
      trouverStructuresCarto: async () => [],
      maintenant: new Date(),
    })
    assert.ok(resultat.success, 'Le renseignement des lieux aurait dû réussir')
  },
)

When(
  'je renseigne un lieu de l’annuaire des entreprises à la même adresse',
  async () => {
    // L'annuaire rend une dénomination plus longue que celle enregistrée dans
    // la coop (« … SAS ») : c'est la dénomination à la même adresse qui
    // reconnaît l'endroit. Le SIRET voyage avec le lieu, mais ne rapproche
    // rien — il désigne une entité juridique, pas un endroit.
    const resultat = await renseignerLieuxActivite({
      command: {
        userId: currentInscriptionUserId(),
        lieuxActivite: [
          {
            siret: siretDuLieuDisponible,
            nom: `${nomDuLieuDisponible} SAS`,
            ...adresseDuLieuDisponible,
          },
        ],
      },
      trouverStructuresCarto: async () => [],
      maintenant: new Date(),
    })
    assert.ok(resultat.success, 'Le renseignement des lieux aurait dû réussir')
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

    const resultat = await renseignerLieuxActivite({
      command: {
        userId: currentInscriptionUserId(),
        lieuxActivite: [nouveauLieu, nouveauLieu],
      },
      trouverStructuresCarto: async () => [],
      maintenant: new Date(),
    })
    assert.ok(resultat.success, 'Le renseignement des lieux aurait dû réussir')
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
    // « Fleury » est contenu dans « Fleury Annexe » : corrélation faible, qui
    // rattache un lieu actif mais ne doit pas relever un lieu supprimé.
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
    // Le cas « LA POSTE » : deux antennes homonymes dans la même commune, que
    // seuls leurs SIRET distinguent. La saisie de création ne porte pas de
    // SIRET (cf. `CreerLieuShape`) — c'est l'annuaire des entreprises, via la
    // réconciliation, qui en fournit un.
    nomDuNouveauLieu = nomDuLieuDisponible
    const resultat = await renseignerLieuxActivite({
      command: {
        userId: currentInscriptionUserId(),
        lieuxActivite: [
          {
            siret: siretDeTest(),
            nom: nomDuLieuDisponible,
            ...adresseDuLieuDisponible,
          },
        ],
      },
      trouverStructuresCarto: async () => [],
      maintenant: new Date(),
    })
    assert.ok(resultat.success, 'Le renseignement des lieux aurait dû réussir')

    const active = await prismaClient.mediateurEnActivite.findFirstOrThrow({
      where: {
        mediateur: { userId: currentInscriptionUserId() },
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

When('je crée un lieu d’activité de même nom, sans adresse', async () => {
  nomDuNouveauLieu = nomDuLieuDisponible
  lieuCreeId = await creerEtRattacher(
    saisieDeCreation(nomDuLieuDisponible, { adresse: '' }),
  )
})

When('je crée un lieu d’activité de même nom, avec une adresse', async () => {
  nomDuNouveauLieu = nomDuLieuDisponible
  lieuCreeId = await creerEtRattacher(saisieDeCreation(nomDuLieuDisponible))
})

When(
  'je renseigne un lieu de l’annuaire des entreprises portant un SIRET',
  async () => {
    nomDuNouveauLieu = `Annuaire ${v4()}`
    siretDuLieuDisponible = siretDeTest()
    const resultat = await renseignerLieuxActivite({
      command: {
        userId: currentInscriptionUserId(),
        lieuxActivite: [
          {
            siret: siretDuLieuDisponible,
            nom: nomDuNouveauLieu,
            ...adresseDuLieuDisponible,
            banId: 'ban-voie-de-test',
          },
        ],
      },
      trouverStructuresCarto: async () => [],
      maintenant: new Date(),
    })
    assert.ok(resultat.success, 'Le renseignement des lieux aurait dû réussir')

    const active = await prismaClient.mediateurEnActivite.findFirstOrThrow({
      where: {
        mediateur: { userId: currentInscriptionUserId() },
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
      // ~1,5 km : au-delà du seuil de même emplacement.
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
      mediateur: { userId: currentInscriptionUserId() },
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

Then('l’étape lieux d’activité est franchie', async () => {
  const user = await prismaClient.user.findUniqueOrThrow({
    where: { id: currentInscriptionUserId() },
    select: { lieuxActiviteRenseignes: true },
  })
  assert.ok(
    user.lieuxActiviteRenseignes,
    'L’étape lieux d’activité n’est pas marquée franchie',
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
      mediateur: { userId: currentInscriptionUserId() },
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

Then('mon ancien lieu d’activité est retiré', async () => {
  const actives = await activitesActivesPour(ancienLieuId)
  assert.strictEqual(
    actives.length,
    0,
    'L’ancien lieu d’activité n’a pas été retiré',
  )
})

Then(
  'un seul lieu d’activité nommé {string} est créé et rattaché',
  // Le nom du scénario est décliné en un nom unique par `nomDuNouveauLieu` :
  // la sonde de corrélation cherche dans toute la coop, un homonyme laissé par
  // un autre run serait un candidat valable.
  async (_nom: string) => {
    const actives = await prismaClient.mediateurEnActivite.findMany({
      where: {
        mediateur: { userId: currentInscriptionUserId() },
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
    // Scopé à l'utilisateur courant (frais à chaque scénario) pour être robuste
    // aux éventuels lieux homonymes laissés par d'anciens runs.
    const actives = await prismaClient.mediateurEnActivite.findMany({
      where: {
        mediateur: { userId: currentInscriptionUserId() },
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
