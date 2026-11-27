import assert from 'node:assert'
import { After, Given, Then, When } from '@cucumber/cucumber'
import {
  Adresse,
  CodeInsee,
  CodePostal,
  Contact,
  DispositifProgrammesNationaux,
  FormationsLabels,
  FraisACharge,
  Itinerances,
  Localisation,
  ModalitesAcces,
  ModalitesAccompagnement,
  Nom,
  PrisesEnChargeSpecifiques,
  PublicsSpecifiquementAdresses,
  Services,
  Typologies,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import type {
  LieuACreer,
  LieuCarto,
  LieuDemande,
  LieuExistant,
} from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/domain'
import { ajouterDesLieuxActivite } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/domain/ajouter-des-lieux-activite'
import { rattacherAuxLieux } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementations/prisma/ajouter-des-lieux-activite.mutation'
import {
  detacherDuLieu,
  rattacherAuLieuDecrit,
} from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementations/prisma/lieu-decrit.mutation'
import { lireLieuxDejaRattaches } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementations/prisma/lieux-deja-rattaches.query'
import {
  etatDuLieu,
  lieuPorteurDeLaCarto,
  nouvelIdentifiantDeLieu,
} from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementations/prisma/situation-du-lieu.query'
import {
  IdentifiantCartographie,
  IdsCartographieNationale,
} from '@/features/lieux-activite/domain/cartographie-nationale/ids-cartographie-nationale'
import { destinationDuLieuDecrit } from '@/features/lieux-activite/domain/destination-du-lieu-decrit'
import type { Fiche } from '@/features/lieux-activite/domain/fiche'
import { BanId } from '@/features/lieux-activite/domain/identifiants/ban-id'
import { LieuId } from '@/features/lieux-activite/domain/identifiants/lieu-id'
import { MediateurId } from '@/features/lieux-activite/domain/identifiants/mediateur-id'
import { UtilisateurId } from '@/features/lieux-activite/domain/identifiants/utilisateur-id'
import { lieuCorreleAuLieuDecrit } from '@/features/lieux-activite/domain/lieu-correle-au-lieu-decrit'
import type { LieuDecritGeocode } from '@/features/lieux-activite/domain/lieu-decrit'
import { lieuxAuMemeEndroit } from '@/features/lieux-activite/implementations/prisma/lieux-au-meme-endroit.query'
import {
  effacerDuRegistre,
  lieuxSemes,
  nomUnique,
  suivreLeLieu,
  utilisateurCourant,
} from '@/features/lieux-activite/lieux-activite.cucumber'

type Issue = Awaited<ReturnType<ReturnType<typeof ajouterDesLieuxActivite>>>

const dernier: {
  ajout?: Issue
  lieuReference?: string
} = {}
const lieuxDeTest: string[] = []

const ajouter = async (
  demandes: readonly LieuDemande[],
  mediateurId: string | null,
  structuresCarto: ReadonlyMap<string, LieuCarto> = new Map(),
) => {
  dernier.ajout = await ajouterDesLieuxActivite({
    lireLieuxDejaRattaches,
    trouverStructuresCarto: async () => structuresCarto,
    etatDuLieu,
    lieuPorteurDeLaCarto,
    lieuxAuMemeEndroit,
    nouvelIdentifiantDeLieu,
    rattacherAuxLieux,
  })({
    demandes,
    utilisateurId: UtilisateurId(lieuxSemes().userId),
    mediateurId: mediateurId == null ? null : MediateurId(mediateurId),
    maintenant: new Date(),
  })

  if (dernier.ajout.success)
    lieuxDeTest.push(...dernier.ajout.data.lieuxRattaches)
}

const lieuSaisi = (partie: Partial<LieuACreer> = {}): LieuACreer => ({
  _tag: 'LieuACreer',
  nom: Nom('Tiers-lieu du Port'),
  siret: null,
  structureCartographieNationaleId: null,
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
  _tag: 'LieuExistant',
  nom: Nom('Tiers-lieu du Port'),
  siret: null,
  structureCartographieNationaleId: null,
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
      codePostal: CodePostal('17300'),
      codeInsee: CodeInsee('17299'),
      banId: '17299_0123_00005',
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
      ...(dernier.lieuReference === undefined
        ? {}
        : { structureId: dernier.lieuReference }),
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
  const { adresses, inscriptions } = semisEntrepot
  lieuxDeTest.length = 0
  delete dernier.ajout
  delete dernier.lieuReference
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
  typologies: Typologies([]),
  contact: Contact({}),
  horaires: null,
  presentation: null,
  services: Services([]),
  publicsSpecifiquementAdresses: PublicsSpecifiquementAdresses([]),
  priseEnChargeSpecifique: PrisesEnChargeSpecifiques([]),
  modalitesAcces: ModalitesAcces([]),
  fraisACharge: FraisACharge([]),
  itinerance: Itinerances([]),
  dispositifProgrammesNationaux: DispositifProgrammesNationaux([]),
  formationsLabels: FormationsLabels([]),
  autresFormationsLabels: [],
  modalitesAccompagnement: ModalitesAccompagnement([]),
  ficheAccesLibre: null,
  priseRdv: null,
}

Given('le registre connaît déjà un lieu de la cartographie', async () => {
  const [adresse] = await prismaClient.$queryRaw<{ id: number }[]>`
    INSERT INTO main.adresse (code_postal, code_insee, nom_commune, numero_voie, nom_voie)
    VALUES ('17300', '17299', 'Rochefort', 77, 'Rue De La Cartographie')
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

const IDENTIFIANT_CARTO_DEJA_RELIE = 'Dora_99999999-8888-7777-6666-555555555555'

Given(
  'le registre relie ce lieu référencé à un identifiant de cartographie',
  async () => {
    const inscription = await prismaClient.lieuInclusionRegistreMain.create({
      data: {
        nom: 'Médiathèque du Centre',
        ...(dernier.lieuReference === undefined
          ? {}
          : { structureCoopId: dernier.lieuReference }),
        structureCartographieNationaleId: IDENTIFIANT_CARTO_DEJA_RELIE,
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
        structureCartographieNationaleId: IdentifiantCartographie(
          IDENTIFIANT_CARTO_DEJA_RELIE,
        ),
      }),
    ],
    lieuxSemes().mediateurId,
    new Map([
      [
        IDENTIFIANT_CARTO_DEJA_RELIE,
        {
          idsCartographieNationale: IdsCartographieNationale(
            IDENTIFIANT_CARTO_DEJA_RELIE,
          ),
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

const lieuMaterialise = async () => {
  const lieu = await prismaClient.lieuInclusion.findFirstOrThrow({
    where: {
      inscriptionRegistre: {
        structureCartographieNationaleId: IDENTIFIANT_CARTO,
      },
    },
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

const etat: {
  nom: string
  utilisateurs: string[]
  lieuConnuId?: string
  commune?: string
} = { nom: '', utilisateurs: [] }

const lieuDecrit = (nom: string): LieuDecritGeocode => ({
  nom,
  adresse: {
    _tag: 'AdresseGeocodee',
    voie: '1 Rue de la Paix',
    commune: 'Paris',
    codePostal: CodePostal('75001'),
    codeInsee: CodeInsee('75101'),
    banId: '75101_7038_00001',
    latitude: 48.869_36,
    longitude: 2.331_08,
  },
  siret: null,
  synchronisationSiret: null,
  rna: null,
  nomReferent: null,
  courrielReferent: null,
  telephoneReferent: null,
})

const semerUnMediateur = async (): Promise<string> => {
  const utilisateurId = v4()
  await prismaClient.user.create({
    data: {
      id: utilisateurId,
      email: `lieu-decrit-${utilisateurId}@example.com`,
    },
  })
  await prismaClient.mediateur.create({ data: { userId: utilisateurId } })
  etat.utilisateurs.push(utilisateurId)
  return utilisateurId
}

const rattacher = async (utilisateurId: string, nom = etat.nom) => {
  const destination = await destinationDuLieuDecrit({
    lieuxAuMemeEndroit,
    nouvelIdentifiantDeLieu,
  })({ lieu: lieuDecrit(nom) })

  return rattacherAuLieuDecrit({
    utilisateurId,
    destination: destination.data,
    trace: { userId: utilisateurId },
    maintenant: new Date(),
  })
}

const rattachementsActifs = (utilisateurId: string) =>
  prismaClient.mediateurEnActivite.findMany({
    where: {
      mediateur: { userId: utilisateurId },
      lieuInclusion: { nom: etat.nom },
      suppression: null,
      fin: null,
    },
    select: { structureId: true },
  })

const lieuxNommes = () =>
  prismaClient.lieuInclusion.findMany({
    where: { nom: etat.nom, suppression: null },
    select: { id: true },
  })

Given('je me suis déjà rattaché au lieu décrit', async () => {
  etat.nom = etat.nom || nomUnique('Lieu décrit')
  await rattacher(utilisateurCourant())
})

Given('un collègue médiateur', async () => {
  await semerUnMediateur()
})

Given(
  'la coop connaît sous le nom de la commune un lieu décrit comme sa mairie',
  async () => {
    etat.commune = v4()
    const { id } = await prismaClient.lieuInclusion.create({
      data: {
        nom: `COMMUNE DE ${etat.commune}`,
        typologies: ['MUNI'],
        adresse: '1 rue de la Paix',
        commune: 'Paris',
        codePostal: CodePostal('75001'),
        codeInsee: CodeInsee('75101'),
        banId: '75101_0001_00001',
      },
      select: { id: true },
    })
    etat.lieuConnuId = id
    suivreLeLieu(id)
  },
)

When('je me rattache au lieu décrit', async () => {
  etat.nom = etat.nom || nomUnique('Lieu décrit')
  await rattacher(utilisateurCourant())
})

When('je me rattache au lieu décrit comme la mairie', async () => {
  etat.nom = `Mairie de ${etat.commune}`
  await rattacher(utilisateurCourant())
})

When('mon collègue se rattache au même lieu décrit', async () => {
  const collegue = etat.utilisateurs.at(-1)
  assert.ok(collegue, 'Aucun collègue semé')
  await rattacher(collegue)
})

When('je me détache du lieu décrit', async () => {
  const utilisateurId = utilisateurCourant()
  const correle = await lieuCorreleAuLieuDecrit({ lieuxAuMemeEndroit })({
    lieu: lieuDecrit(etat.nom),
  })

  if (correle.data !== null)
    await detacherDuLieu({
      utilisateurId,
      lieuId: correle.data,
      trace: { userId: utilisateurId },
      maintenant: new Date(),
    })
})

Then('je suis rattaché au lieu décrit', async () => {
  assert.strictEqual(
    (await rattachementsActifs(utilisateurCourant())).length,
    1,
  )
})

Then(
  'le lieu décrit n’existe qu’une fois et je n’y suis rattaché qu’une fois',
  async () => {
    assert.strictEqual((await lieuxNommes()).length, 1)
    assert.strictEqual(
      (await rattachementsActifs(utilisateurCourant())).length,
      1,
    )
  },
)

Then('nous sommes rattachés au même lieu', async () => {
  const collegue = etat.utilisateurs.at(-1) ?? ''
  const [miens, siens] = await Promise.all([
    rattachementsActifs(utilisateurCourant()),
    rattachementsActifs(collegue),
  ])
  assert.strictEqual((await lieuxNommes()).length, 1)
  assert.deepStrictEqual(miens, siens)
})

Then('je suis rattaché au lieu que la coop connaissait déjà', async () => {
  const actifs = await prismaClient.mediateurEnActivite.findMany({
    where: {
      mediateur: { userId: utilisateurCourant() },
      suppression: null,
      fin: null,
    },
    select: { structureId: true },
  })
  assert.deepStrictEqual(
    actifs.map(({ structureId }) => structureId),
    [etat.lieuConnuId],
  )
})

Then('ce lieu n’a pas été recréé', async () => {
  const lieux = await prismaClient.lieuInclusion.count({
    where: {
      suppression: null,
      OR: [
        { nom: `COMMUNE DE ${etat.commune}` },
        { nom: `Mairie de ${etat.commune}` },
      ],
    },
  })
  assert.strictEqual(lieux, 1)
})

Then('je ne suis plus rattaché au lieu décrit', async () => {
  assert.strictEqual(
    (await rattachementsActifs(utilisateurCourant())).length,
    0,
  )
})

Then('le lieu décrit est inscrit au registre', async () => {
  const [lieu] = await lieuxNommes()
  assert.ok(lieu, 'Le lieu décrit n’a pas été matérialisé')
  const inscription =
    await prismaClient.lieuInclusionRegistreMain.findUniqueOrThrow({
      where: { structureCoopId: lieu.id },
      select: { nom: true, source: true, editedBy: true, updatedAtCoop: true },
    })
  assert.strictEqual(inscription.nom, etat.nom)
  assert.strictEqual(inscription.source, 'Coop numérique')
  assert.strictEqual(inscription.editedBy, 'coop')
  assert.notStrictEqual(inscription.updatedAtCoop, null)
})

After(async () => {
  const utilisateurs = etat.utilisateurs
  const noms = [etat.nom, `COMMUNE DE ${etat.commune}`].filter(
    (nom) => nom !== '' && nom !== 'COMMUNE DE undefined',
  )
  etat.nom = ''
  etat.utilisateurs = []
  delete etat.lieuConnuId
  delete etat.commune
  if (noms.length === 0 && utilisateurs.length === 0) return

  const lieux = await prismaClient.lieuInclusion.findMany({
    where: { nom: { in: noms } },
    select: { id: true },
  })
  const ids = lieux.map(({ id }) => id)
  await prismaClient.mediateurEnActivite.deleteMany({
    where: {
      OR: [
        { structureId: { in: ids } },
        { mediateur: { userId: { in: utilisateurs } } },
      ],
    },
  })
  await prismaClient.mediateur.deleteMany({
    where: { userId: { in: utilisateurs } },
  })
  await prismaClient.user.deleteMany({ where: { id: { in: utilisateurs } } })
  await effacerDuRegistre(ids)
  await prismaClient.lieuInclusion.deleteMany({ where: { id: { in: ids } } })
})
