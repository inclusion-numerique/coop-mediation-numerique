import assert from 'node:assert'
import { ajouterDesLieuxActivite } from '@app/web/features/lieux-activite/abilities/ajouter-des-lieux-activite'
import type {
  LieuACreer,
  LieuCarto,
  LieuDemande,
  LieuExistant,
} from '@app/web/features/lieux-activite/abilities/ajouter-des-lieux-activite/domain'
import { lireLieuxDejaRattaches } from '@app/web/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementation'
import { BanId } from '@app/web/features/lieux-activite/domain/ban-id'
import type { Fiche } from '@app/web/features/lieux-activite/domain/fiche'
import {
  IdentifiantCartographie,
  IdsCartographieNationale,
} from '@app/web/features/lieux-activite/domain/ids-cartographie-nationale'
import { LieuId } from '@app/web/features/lieux-activite/domain/lieu-id'
import { MediateurId } from '@app/web/features/lieux-activite/domain/mediateur-id'
import { UserId } from '@app/web/features/lieux-activite/domain/user-id'
import { lieuxSemes } from '@app/web/features/lieux-activite/lieux-activite.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'
import {
  Adresse,
  Contact,
  Localisation,
  Nom,
} from '@gouvfr-anct/lieux-de-mediation-numerique'

type Issue = Awaited<ReturnType<typeof ajouterDesLieuxActivite>>

const dernier: { ajout?: Issue; lieuReference?: string } = {}
const lieuxDeTest: string[] = []

/** L'Entrepôt n'est pas joignable en test : le port existe pour cela. */
const ports = {
  lireLieuxDejaRattaches,
  trouverStructuresCarto: async () => new Map(),
}

const ajouter = async (
  demandes: readonly LieuDemande[],
  mediateurId: string | null,
  structuresCarto: ReadonlyMap<string, LieuCarto> = new Map(),
) => {
  dernier.ajout = await ajouterDesLieuxActivite({
    demandes,
    userId: UserId(lieuxSemes().userId),
    mediateurId: mediateurId == null ? null : MediateurId(mediateurId),
    ports: { ...ports, trouverStructuresCarto: async () => structuresCarto },
  })
}

/**
 * Un lieu à créer porte toujours une adresse validée par la BAN : c'est la
 * condition pour qu'il soit créé du tout. Les scénarios qui mettent en scène un
 * lieu déjà connu passent son `id` et n'ont pas d'adresse à valider.
 */
const lieuSaisi = (partie: Partial<LieuACreer> = {}): LieuACreer => ({
  nom: Nom('Tiers-lieu du Port'),
  adresse: Adresse({
    voie: '12 quai du Port',
    commune: 'Rochefort',
    code_postal: '17300',
    code_insee: '17299',
  }),
  localisation: Localisation({ latitude: 45.94, longitude: -0.96 }),
  banId: BanId('17299_0123_00012'),
  ...partie,
})

const lieuConnu = (
  id: string,
  partie: Partial<LieuExistant> = {},
): LieuExistant => ({
  nom: Nom('Tiers-lieu du Port'),
  id: LieuId(id),
  ...partie,
})

const lieuxDuMediateur = async () =>
  prismaClient.mediateurEnActivite.count({
    where: {
      mediateurId: lieuxSemes().mediateurId,
      fin: null,
      suppression: null,
    },
  })

Given('un lieu référencé dans la coop', async () => {
  const lieu = await prismaClient.lieuInclusion.create({
    data: {
      nom: Nom('Médiathèque du Centre'),
      adresse: '5 place de la Mairie',
      commune: 'Rochefort',
      codePostal: '17300',
      codeInsee: '17299',
    },
    select: { id: true },
  })

  dernier.lieuReference = lieu.id
  lieuxDeTest.push(lieu.id)
})

When('ce médiateur ajoute ce lieu référencé', async () => {
  await ajouter(
    [
      lieuConnu(dernier.lieuReference ?? '', {
        nom: Nom('Médiathèque du Centre'),
      }),
    ],
    lieuxSemes().mediateurId,
  )
})

When('ce médiateur ajoute deux fois ce lieu référencé', async () => {
  const demande = lieuConnu(dernier.lieuReference ?? '', {
    nom: Nom('Médiathèque du Centre'),
  })

  await ajouter([demande, demande], lieuxSemes().mediateurId)
})

When('ce médiateur ajoute un lieu saisi « Tiers-lieu du Port »', async () => {
  await ajouter([lieuSaisi()], lieuxSemes().mediateurId)
})

When('ce médiateur ajoute un lieu où il exerce déjà', async () => {
  await ajouter(
    [
      lieuConnu(lieuxSemes().lieuIds[0] ?? '', {
        nom: Nom('Espace numérique 1'),
      }),
    ],
    lieuxSemes().mediateurId,
  )
})

When(
  'ce médiateur saisit un lieu à la même adresse que ce lieu référencé',
  async () => {
    // Ni id ni carto : seule la corrélation peut le rattacher à l'existant.
    await ajouter(
      [
        lieuSaisi({
          nom: Nom('Mediatheque du centre'),
          adresse: Adresse({
            voie: '5 place de la Mairie',
            commune: 'Rochefort',
            code_postal: '17300',
            code_insee: '17299',
          }),
        }),
      ],
      lieuxSemes().mediateurId,
    )
  },
)

When("quelqu'un sans médiateur tente d'ajouter un lieu", async () => {
  await ajouter([lieuSaisi()], null)
})

When('ce médiateur valide un panier vide', async () => {
  await ajouter([], lieuxSemes().mediateurId)
})

Then('ce médiateur exerce dans ce lieu référencé', async () => {
  const rattachement = await prismaClient.mediateurEnActivite.findFirst({
    where: {
      mediateurId: lieuxSemes().mediateurId,
      structureId: dernier.lieuReference,
      fin: null,
    },
  })

  assert.ok(rattachement, 'aucun rattachement au lieu référencé')
})

Then('le lieu « Tiers-lieu du Port » existe', async () => {
  const lieu = await prismaClient.lieuInclusion.findFirst({
    where: { nom: Nom('Tiers-lieu du Port') },
    select: { id: true },
  })

  assert.ok(lieu, 'le lieu saisi n’a pas été créé')
  lieuxDeTest.push(lieu.id)
})

Then('ce médiateur exerce dans le lieu « Tiers-lieu du Port »', async () => {
  const rattachement = await prismaClient.mediateurEnActivite.findFirst({
    where: {
      mediateurId: lieuxSemes().mediateurId,
      lieuInclusion: { nom: Nom('Tiers-lieu du Port') },
      fin: null,
    },
  })

  assert.ok(rattachement, 'aucun rattachement au lieu saisi')
})

Then("ce médiateur n'exerce toujours que dans deux lieux", async () => {
  assert.strictEqual(await lieuxDuMediateur(), 2)
})

Then('ce médiateur exerce dans trois lieux', async () => {
  assert.strictEqual(await lieuxDuMediateur(), 3)
})

/**
 * On cherche la dénomination SOUMISE, pas une absence globale : la base locale
 * porte des données restaurées, et compter les lieux d'une commune y mesurerait
 * la production plutôt que le scénario.
 */
Then("aucun lieu n'a été créé", async () => {
  const doublon = await prismaClient.lieuInclusion.count({
    where: { nom: Nom('Mediatheque du centre') },
  })

  assert.strictEqual(doublon, 0, 'la saisie a créé un doublon')
})

Then("l'ajout est refusé", () => {
  assert.strictEqual(dernier.ajout?.success, false)
})

After(async () => {
  const ids = [...lieuxDeTest]
  // Les semis Entrepôt s'effacent même quand aucun lieu coop n'a été créé : ils
  // survivraient au scénario, leur table appartenant à un autre schéma.
  const { adresses, inscriptions } = semisEntrepot
  lieuxDeTest.length = 0
  dernier.ajout = undefined
  dernier.lieuReference = undefined
  semisEntrepot.adresses = []
  semisEntrepot.inscriptions = []

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

const semisEntrepot: { adresses: number[]; inscriptions: number[] } = {
  adresses: [],
  inscriptions: [],
}

const IDENTIFIANT_CARTO = 'Dora_11111111-2222-3333-4444-555555555555'

const ficheDeLaCarto: Fiche = {
  nom: Nom('Espace France Services du Port'),
  pivot: null,
  adresse: null,
  localisation: null,
  typologies: [],
  contact: Contact({}),
  horaires: null,
  presentation: null,
  services: [],
  publicsSpecifiquementAdresses: [],
  priseEnChargeSpecifique: [],
  modalitesAcces: [],
  fraisACharge: [],
  itinerance: [],
  dispositifProgrammesNationaux: [],
  formationsLabels: [],
  autresFormationsLabels: [],
  modalitesAccompagnement: [],
  ficheAccesLibre: null,
  priseRdv: null,
}

Given('le registre connaît déjà un lieu de la cartographie', async () => {
  const [adresse] = await prismaClient.$queryRaw<{ id: number }[]>`
    INSERT INTO main.adresse (code_postal, code_insee, nom_commune, nom_voie)
    VALUES ('17300', '17299', 'Rochefort', '77 rue de la Cartographie')
    RETURNING id`

  const adresseId = adresse?.id ?? 0
  semisEntrepot.adresses = [...semisEntrepot.adresses, adresseId]

  const inscription = await prismaClient.lieuInclusionRegistreMain.create({
    data: {
      nom: 'Espace France Services du Port',
      adresseId,
      structureCartographieNationaleId: IDENTIFIANT_CARTO,
      source: 'dora',
      editedBy: 'carto',
      updatedAtCarto: new Date('2026-01-01'),
    },
    select: { id: true },
  })

  semisEntrepot.inscriptions = [...semisEntrepot.inscriptions, inscription.id]
})

Given(
  'le registre relie ce lieu référencé à un identifiant de cartographie',
  async () => {
    const inscription = await prismaClient.lieuInclusionRegistreMain.create({
      data: {
        nom: 'Médiathèque du Centre',
        structureCoopId: dernier.lieuReference,
        structureCartographieNationaleId: IDENTIFIANT_CARTO,
        source: 'dora',
        editedBy: 'carto',
        updatedAtCarto: new Date('2026-01-01'),
      },
      select: { id: true },
    })

    semisEntrepot.inscriptions = [...semisEntrepot.inscriptions, inscription.id]
  },
)

When('ce médiateur ajoute le lieu de la cartographie ainsi relié', async () => {
  await ajouter(
    [
      lieuSaisi({
        structureCartographieNationaleId:
          IdentifiantCartographie(IDENTIFIANT_CARTO),
      }),
    ],
    lieuxSemes().mediateurId,
    new Map([
      [
        IDENTIFIANT_CARTO,
        {
          idsCartographieNationale: IdsCartographieNationale(IDENTIFIANT_CARTO),
          source: null,
          fiche: ficheDeLaCarto,
        },
      ],
    ]),
  )
})

When('ce médiateur ajoute ce lieu de la cartographie', async () => {
  await ajouter(
    [
      lieuSaisi({
        structureCartographieNationaleId:
          IdentifiantCartographie(IDENTIFIANT_CARTO),
      }),
    ],
    lieuxSemes().mediateurId,
    new Map([
      [
        IDENTIFIANT_CARTO,
        {
          idsCartographieNationale: IdsCartographieNationale(IDENTIFIANT_CARTO),
          source: null,
          fiche: ficheDeLaCarto,
        },
      ],
    ]),
  )
})

/** Le lieu coop que le scénario vient de matérialiser, quel que soit son nom. */
const lieuMaterialise = async () => {
  const lieu = await prismaClient.lieuInclusion.findFirstOrThrow({
    where: { structureCartographieNationaleId: IDENTIFIANT_CARTO },
    select: { id: true },
  })

  lieuxDeTest.push(lieu.id)

  return lieu.id
}

Then(
  "le registre ne porte qu'une inscription sous cet identifiant",
  async () => {
    assert.strictEqual(
      await prismaClient.lieuInclusionRegistreMain.count({
        where: { structureCartographieNationaleId: IDENTIFIANT_CARTO },
      }),
      1,
    )
  },
)

Then('cette inscription porte le lien vers le lieu matérialisé', async () => {
  const inscription =
    await prismaClient.lieuInclusionRegistreMain.findUniqueOrThrow({
      where: { structureCartographieNationaleId: IDENTIFIANT_CARTO },
      select: { structureCoopId: true, updatedAtCoop: true },
    })

  assert.strictEqual(inscription.structureCoopId, await lieuMaterialise())
  assert.notStrictEqual(inscription.updatedAtCoop, null)
})

Then('le lieu saisi est inscrit au registre', async () => {
  const lieu = await prismaClient.lieuInclusion.findFirstOrThrow({
    where: { nom: Nom('Tiers-lieu du Port') },
    select: { id: true },
  })

  const inscription =
    await prismaClient.lieuInclusionRegistreMain.findUniqueOrThrow({
      where: { structureCoopId: lieu.id },
      select: { nom: true, source: true, editedBy: true },
    })

  assert.strictEqual(inscription.nom, 'Tiers-lieu du Port')
  assert.strictEqual(inscription.source, 'Coop numérique')
  assert.strictEqual(inscription.editedBy, 'coop')
})
