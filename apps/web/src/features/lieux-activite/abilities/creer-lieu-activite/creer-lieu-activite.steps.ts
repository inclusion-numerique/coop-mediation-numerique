import assert from 'node:assert'
import { creerLieuActivite } from '@app/web/features/lieux-activite/abilities/creer-lieu-activite'
import { nouveauLieu } from '@app/web/features/lieux-activite/abilities/creer-lieu-activite/action/depuis-la-saisie'
import { MediateurId } from '@app/web/features/lieux-activite/domain/mediateur-id'
import { UserId } from '@app/web/features/lieux-activite/domain/user-id'
import type { CreerLieuActiviteData } from '@app/web/features/lieux-activite/formulaire/CreerLieuActiviteValidation'
import { ficheSemee } from '@app/web/features/lieux-activite/lieux-activite.cucumber'
import { emptyOpeningHours } from '@app/web/opening-hours/openingHoursHelpers'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'
import {
  PublicSpecifiquementAdresse,
  Typologie,
} from '@gouvfr-anct/lieux-de-mediation-numerique'

type Issue = Awaited<ReturnType<typeof creerLieuActivite>>

const dernier: { creation?: Issue; lieuxCreesIds: string[] } = {
  lieuxCreesIds: [],
}

const saisie: CreerLieuActiviteData = {
  nom: 'Tiers-lieu du Port',
  adresseBan: {
    id: '17300_0123_00012',
    label: '12 quai du Port, 17300 Rochefort',
    nom: '12 quai du Port',
    commune: 'Rochefort',
    codePostal: '17300',
    codeInsee: '17299',
    contexte: '17, Charente-Maritime',
    latitude: 45.94,
    longitude: -0.96,
  },
  complementAdresse: null,
  lieuItinerant: null,
  typologies: [Typologie.BIB],
  visiblePourCartographieNationale: false,
  presentationResume: null,
  presentationDetail: null,
  formationsLabels: [],
  siteWeb: null,
  ficheAccesLibre: null,
  priseRdv: null,
  horairesComment: null,
  openingHours: emptyOpeningHours,
  modalitesAcces: null,
  fraisACharge: [],
  services: [],
  modalitesAccompagnement: [],
  priseEnChargeSpecifique: [],
  toutPublic: true,
  publicsSpecifiquementAdresses: [PublicSpecifiquementAdresse.Jeunes],
}

const creer = async (
  mediateurId: string | null,
  quoi: CreerLieuActiviteData = saisie,
) => {
  dernier.creation = await creerLieuActivite({
    lieu: nouveauLieu(quoi, UserId(ficheSemee().userIds[0] ?? ''), new Date()),
    mediateurId: mediateurId == null ? null : MediateurId(mediateurId),
  })

  if (dernier.creation.success)
    dernier.lieuxCreesIds = [...dernier.lieuxCreesIds, dernier.creation.data.id]
}

/** L'identifiant rendu par la création de rang `rang`, la première valant 1. */
const lieuCree = (rang: number): string | undefined =>
  dernier.lieuxCreesIds[rang - 1]

When('ce médiateur crée un lieu « Tiers-lieu du Port »', async () => {
  await creer(ficheSemee().mediateurRattacheId)
})

When('ce médiateur ressaisit le même lieu', async () => {
  await creer(ficheSemee().mediateurRattacheId)
})

When("quelqu'un sans médiateur tente de créer un lieu", async () => {
  await creer(null)
})

Then('le lieu créé existe', async () => {
  assert.strictEqual(
    await prismaClient.lieuInclusion.count({
      where: { id: lieuCree(1) },
    }),
    1,
  )
})

Then('ce médiateur exerce dans le lieu créé', async () => {
  assert.strictEqual(
    await prismaClient.mediateurEnActivite.count({
      where: {
        structureId: lieuCree(1),
        mediateurId: ficheSemee().mediateurRattacheId,
        fin: null,
      },
    }),
    1,
  )
})

Then('la création est refusée', () => {
  assert.strictEqual(dernier.creation?.success, false)
})

Then('le lieu créé ne vise aucun public en particulier', async () => {
  const lieu = await prismaClient.lieuInclusion.findUnique({
    where: { id: lieuCree(1) },
    select: { publicsSpecifiquementAdresses: true },
  })

  assert.deepStrictEqual(lieu?.publicsSpecifiquementAdresses, [])
})

Then('les deux créations désignent le même lieu', () => {
  assert.strictEqual(dernier.lieuxCreesIds.length, 2)
  assert.strictEqual(lieuCree(1), lieuCree(2))
})

Then("ce médiateur n'exerce qu'une fois dans le lieu créé", async () => {
  assert.strictEqual(
    await prismaClient.mediateurEnActivite.count({
      where: {
        structureId: lieuCree(1),
        mediateurId: ficheSemee().mediateurRattacheId,
        fin: null,
      },
    }),
    1,
  )
})

/**
 * Ce que les scénarios sèment DANS l'Entrepôt — hors du périmètre des semis de
 * la coop, et donc à nettoyer ici.
 */
const semisEntrepot: { adresses: number[]; inscriptions: number[] } = {
  adresses: [],
  inscriptions: [],
}

/**
 * Sème une adresse de l'Entrepôt. `repetition` vaut `''` et non `null` pour le
 * scénario qui surveille la clé d'unicité : celle-ci compare des `COALESCE`, si
 * bien que les deux y désignent la même adresse.
 */
const semerUneAdresse = async (
  nomVoie: string,
  repetition: string | null = null,
): Promise<number> => {
  const [creee] = await prismaClient.$queryRaw<{ id: number }[]>`
    INSERT INTO main.adresse (code_postal, code_insee, nom_commune, nom_voie, repetition)
    VALUES ('17300', '17299', 'Rochefort', ${nomVoie}, ${repetition})
    RETURNING id`

  const id = creee?.id ?? 0
  semisEntrepot.adresses = [...semisEntrepot.adresses, id]

  return id
}

const SAISIE_A_ADRESSE_CONNUE: CreerLieuActiviteData = {
  ...saisie,
  adresseBan: {
    id: '17300_0999_00099',
    label: '99 quai du Test, 17300 Rochefort',
    nom: '99 quai du Test',
    commune: 'Rochefort',
    codePostal: '17300',
    codeInsee: '17299',
    contexte: '17, Charente-Maritime',
    latitude: 45.94,
    longitude: -0.96,
  },
}

const adresseARepetitionVide: { id?: number } = {}

Given("une adresse déjà connue de l'Entrepôt, à répétition vide", async () => {
  adresseARepetitionVide.id = await semerUneAdresse('99 quai du Test', '')
})

When('ce médiateur crée un lieu à cette adresse', async () => {
  await creer(ficheSemee().mediateurRattacheId, SAISIE_A_ADRESSE_CONNUE)
})

Then(
  "le registre pointe vers l'adresse que l'Entrepôt connaissait déjà",
  async () => {
    const inscription =
      await prismaClient.lieuInclusionRegistreMain.findUniqueOrThrow({
        where: { structureCoopId: lieuCree(1) },
        select: { adresseId: true },
      })

    assert.strictEqual(inscription.adresseId, adresseARepetitionVide.id)
  },
)

/**
 * Le même endroit que `SAISIE_DEJA_AU_REGISTRE`, déjà inscrit au registre sous
 * une autre source et sans lien coop — l'état qu'aucune sonde de la coop ne peut
 * voir, puisqu'il ne vit que dans l'Entrepôt.
 */
const inscriptionDora: { id?: number; adresseId?: number } = {}

const SAISIE_DEJA_AU_REGISTRE: CreerLieuActiviteData = {
  ...saisie,
  adresseBan: {
    id: '17300_0555_00050',
    label: '50 rue du Registre, 17300 Rochefort',
    nom: '50 rue du Registre',
    commune: 'Rochefort',
    codePostal: '17300',
    codeInsee: '17299',
    contexte: '17, Charente-Maritime',
    latitude: 45.94,
    longitude: -0.96,
  },
}

Given('le registre connaît déjà ce lieu sous la source « dora »', async () => {
  const adresseId = await semerUneAdresse('50 rue du Registre')

  const inscription = await prismaClient.lieuInclusionRegistreMain.create({
    data: {
      nom: saisie.nom,
      adresseId,
      typologies: ['BIB'],
      source: 'dora',
      editedBy: 'carto',
      updatedAtCarto: new Date('2026-01-01'),
    },
    select: { id: true },
  })

  inscriptionDora.id = inscription.id
  inscriptionDora.adresseId = adresseId
  semisEntrepot.inscriptions = [...semisEntrepot.inscriptions, inscription.id]
})

When('ce médiateur crée un lieu déjà connu du registre', async () => {
  await creer(ficheSemee().mediateurRattacheId, SAISIE_DEJA_AU_REGISTRE)
})

Then("le registre ne porte qu'une inscription pour cet endroit", async () => {
  assert.strictEqual(
    await prismaClient.lieuInclusionRegistreMain.count({
      where: { adresseId: inscriptionDora.adresseId },
    }),
    1,
  )
})

Then('cette inscription porte le lien vers le lieu créé', async () => {
  const inscription =
    await prismaClient.lieuInclusionRegistreMain.findUniqueOrThrow({
      where: { id: inscriptionDora.id ?? 0 },
      select: { structureCoopId: true, updatedAtCoop: true },
    })

  assert.strictEqual(inscription.structureCoopId, lieuCree(1))
  assert.notStrictEqual(inscription.updatedAtCoop, null)
})

Then('cette inscription est désormais attribuée à la coop', async () => {
  const inscription =
    await prismaClient.lieuInclusionRegistreMain.findUniqueOrThrow({
      where: { id: inscriptionDora.id ?? 0 },
      select: { source: true },
    })

  assert.strictEqual(inscription.source, 'Coop numérique')
})

Then('le lieu créé est inscrit au registre', async () => {
  const inscription =
    await prismaClient.lieuInclusionRegistreMain.findUniqueOrThrow({
      where: { structureCoopId: lieuCree(1) },
      select: {
        nom: true,
        source: true,
        editedBy: true,
        updatedAtCoop: true,
        typologies: true,
      },
    })

  assert.strictEqual(inscription.nom, 'Tiers-lieu du Port')
  assert.strictEqual(inscription.source, 'Coop numérique')
  assert.strictEqual(inscription.editedBy, 'coop')
  assert.deepStrictEqual(inscription.typologies, ['BIB'])
  assert.notStrictEqual(inscription.updatedAtCoop, null)
})

Then("le registre porte l'adresse du lieu créé", async () => {
  const inscription =
    await prismaClient.lieuInclusionRegistreMain.findUniqueOrThrow({
      where: { structureCoopId: lieuCree(1) },
      select: {
        adresse: {
          select: {
            nomVoie: true,
            codePostal: true,
            nomCommune: true,
            clefInterop: true,
          },
        },
      },
    })

  assert.deepStrictEqual(inscription.adresse, {
    nomVoie: '12 quai du Port',
    codePostal: '17300',
    nomCommune: 'Rochefort',
    clefInterop: '17300_0123_00012',
  })
})

Then("le registre ne porte qu'une inscription pour le lieu créé", async () => {
  assert.strictEqual(
    await prismaClient.lieuInclusionRegistreMain.count({
      where: { structureCoopId: lieuCree(1) },
    }),
    1,
  )
})

// Les lieux créés par les scénarios ne sont pas semés : ils se nettoient ici.
//
// Les `main.adresse` résolues au passage restent, elles : la table est
// mutualisée entre lieux et structures administratives, et rien ne dit que la
// ligne trouvée a été créée par le scénario. Une exécution suivante la retrouve
// par sa `clef_interop` au lieu d'en créer une autre.
After(async () => {
  const ids = dernier.lieuxCreesIds
  // Les semis Entrepôt s'effacent même quand aucun lieu n'a été créé : un
  // scénario qui échoue en cours de création les laisserait sinon derrière lui,
  // et ferait buter l'exécution suivante sur la clé d'unicité — un échec qui ne
  // parlerait plus du tout du bug qu'on surveille.
  const { adresses, inscriptions } = semisEntrepot
  dernier.lieuxCreesIds = []
  dernier.creation = undefined
  semisEntrepot.adresses = []
  semisEntrepot.inscriptions = []
  adresseARepetitionVide.id = undefined
  inscriptionDora.id = undefined
  inscriptionDora.adresseId = undefined

  if (ids.length > 0) {
    await prismaClient.mediateurEnActivite.deleteMany({
      where: { structureId: { in: ids } },
    })
    await prismaClient.lieuInclusionRegistreMain.deleteMany({
      where: { structureCoopId: { in: ids } },
    })
    await prismaClient.lieuInclusion.deleteMany({ where: { id: { in: ids } } })
  }

  await prismaClient.lieuInclusionRegistreMain.deleteMany({
    where: { id: { in: inscriptions } },
  })
  await prismaClient.adresseMain.deleteMany({ where: { id: { in: adresses } } })
})

const COMMENTAIRE = 'Fermé le premier lundi du mois'

When(
  "ce médiateur crée un lieu ouvert le lundi matin avec un commentaire d'horaires",
  async () => {
    await creer(ficheSemee().mediateurRattacheId, {
      ...saisie,
      horairesComment: COMMENTAIRE,
      openingHours: {
        ...emptyOpeningHours,
        Mo: {
          am: { startTime: '09:00', endTime: '12:00', isOpen: true },
          pm: { startTime: null, endTime: null, isOpen: false },
        },
      },
    })
  },
)

Then(
  'les horaires du lieu créé portent le commentaire une seule fois',
  async () => {
    const lieu = await prismaClient.lieuInclusion.findUniqueOrThrow({
      where: { id: dernier.lieuxCreesIds.at(-1) ?? '' },
      select: { horaires: true },
    })

    assert.strictEqual(
      (lieu.horaires ?? '').split(COMMENTAIRE).length - 1,
      1,
      `Le commentaire devrait figurer une seule fois : ${lieu.horaires}`,
    )
  },
)
