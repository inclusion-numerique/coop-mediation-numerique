import assert from 'node:assert'
import { inventaireDesLieux } from '@app/web/features/lieux-activite/abilities/inventorier-les-lieux'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'
import {
  Frais,
  ModaliteAcces,
  Service,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import {
  FraisACharge as FraisAChargeStockee,
  ModaliteAcces as ModaliteAccesStockee,
  Service as ServiceStocke,
} from '@prisma/client'
import { v4 } from 'uuid'

const semis: {
  lieuId?: string
  inscriptionId?: number
  inventaire?: Awaited<ReturnType<typeof inventaireDesLieux>>
} = {}

const JOUR = 24 * 60 * 60 * 1000

const DEMAIN = () => new Date(Date.now() + JOUR)
const HIER = () => new Date(Date.now() - JOUR)
const LA_SEMAINE_DERNIERE = () => new Date(Date.now() - 7 * JOUR)
const L_AN_DERNIER = () => new Date(Date.now() - 365 * JOUR)

Given('un lieu à inventorier', async () => {
  const lieu = await prismaClient.lieuInclusion.create({
    data: {
      nom: `Espace inventaire ${v4()}`,
      adresse: '4 rue du Registre',
      commune: 'Rochefort',
      codePostal: '17300',
      visiblePourCartographieNationale: true,
    },
    select: { id: true },
  })

  semis.lieuId = lieu.id
})

Given('ce lieu a été retiré', async () => {
  await prismaClient.lieuInclusion.update({
    where: { id: semis.lieuId },
    data: { suppression: new Date() },
  })
})

Given("ce lieu n'est pas partagé sur la cartographie nationale", async () => {
  await prismaClient.lieuInclusion.update({
    where: { id: semis.lieuId },
    data: { visiblePourCartographieNationale: false },
  })
})

Given("la coop n'a pas touché à ce lieu depuis l'an dernier", async () => {
  await prismaClient.lieuInclusion.update({
    where: { id: semis.lieuId },
    data: { modification: L_AN_DERNIER() },
  })
})

Given("une autre source l'a repris hier", async () => {
  const inscription = await prismaClient.lieuInclusionRegistreMain.create({
    data: {
      nom: 'Espace inventaire repris par dora',
      structureCoopId: semis.lieuId,
      source: 'dora',
      editedBy: 'carto',
      updatedAtCarto: HIER(),
    },
    select: { id: true },
  })

  semis.inscriptionId = inscription.id
})

Given(
  "ce lieu déclare un service, des frais et une modalité d'accès",
  async () => {
    await prismaClient.lieuInclusion.update({
      where: { id: semis.lieuId },
      data: {
        services: [ServiceStocke.AideAuxDemarchesAdministratives],
        fraisACharge: [FraisAChargeStockee.GratuitSousCondition],
        modalitesAcces: [ModaliteAccesStockee.FicheDePrescription],
      },
    })
  },
)

When("un client d'API demande l'inventaire de ce lieu", async () => {
  semis.inventaire = await inventaireDesLieux({
    ids: [semis.lieuId ?? ''],
    take: 10,
  })
})

When("un client d'API demande les lieux modifiés depuis demain", async () => {
  semis.inventaire = await inventaireDesLieux({
    ids: [semis.lieuId ?? ''],
    take: 10,
    modifieDepuis: DEMAIN(),
  })
})

When(
  "un client d'API demande les lieux modifiés depuis la semaine dernière",
  async () => {
    semis.inventaire = await inventaireDesLieux({
      ids: [semis.lieuId ?? ''],
      take: 10,
      modifieDepuis: LA_SEMAINE_DERNIERE(),
    })
  },
)

Then("ce lieu figure à l'inventaire", () => {
  assert.strictEqual(semis.inventaire?.lieux.length, 1)
})

Then("ce lieu ne figure pas à l'inventaire", () => {
  assert.strictEqual(semis.inventaire?.lieux.length, 0)
})

/**
 * `FicheDePrescription` est le cas qui compte : c'est la seule nomenclature
 * dont le nom stocké ne ressemble pas au membre du standard qui lui correspond.
 */
Then('ses nomenclatures sont dites dans les termes du schéma national', () => {
  const lieu = semis.inventaire?.lieux.at(0)

  assert.deepStrictEqual(lieu?.services, [
    Service.AideAuxDemarchesAdministratives,
  ])
  assert.deepStrictEqual(lieu?.fraisACharge, [Frais.GratuitSousCondition])
  assert.deepStrictEqual(lieu?.modalitesAcces, [
    ModaliteAcces.PrescriptionParMail,
  ])
})

Then('sa date de modification est celle de la reprise', () => {
  const lieu = semis.inventaire?.lieux.at(0)

  assert.ok(
    lieu != null && lieu.modification > LA_SEMAINE_DERNIERE(),
    'La date de modification devrait être celle de la reprise, pas celle de la coop',
  )
})

Then('sa suppression est datée', () => {
  assert.ok(
    semis.inventaire?.lieux.at(0)?.suppression != null,
    'Le lieu supprimé devrait porter sa date de suppression',
  )
})

After(async () => {
  const id = semis.lieuId
  const inscriptionId = semis.inscriptionId
  semis.lieuId = undefined
  semis.inscriptionId = undefined
  semis.inventaire = undefined

  if (inscriptionId != null)
    await prismaClient.lieuInclusionRegistreMain.deleteMany({
      where: { id: inscriptionId },
    })

  if (!id) return

  await prismaClient.lieuInclusion.deleteMany({ where: { id } })
})
