import assert from 'node:assert'
import {
  AdresseCourriel,
  type ContactAImporter,
} from '@app/web/features/utilisateurs/domain'
import { versContactBrevo } from '@app/web/features/utilisateurs/implementation/brevo/liste-de-diffusion'
import {
  type CompteDeListe,
  semerUnCompteDeListe,
} from '@app/web/features/utilisateurs/utilisateurs.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { synchroniserLesRolesBrevo } from './commands/synchroniser-les-roles-brevo'
import {
  type BilanDeSynchronisation,
  IdentifiantDImport,
  TailleDeLot,
} from './domain'

const vierge = { derniereActivite: null, dernierBeneficiaire: null }
const sansEquipe = { aUneEquipe: false, aCoordonne: false }

const situations: Readonly<
  Record<
    string,
    Pick<
      CompteDeListe,
      | 'mediateur'
      | 'coordinateur'
      | 'conseillerNumerique'
      | 'coordinateurDeclare'
    >
  >
> = {
  'médiateur hors dispositif': { mediateur: vierge },
  'médiateur conseiller numérique': {
    mediateur: vierge,
    conseillerNumerique: true,
  },
  'coordinateur de la coop hors dispositif': { coordinateur: sansEquipe },
  'coordinateur du dispositif sans rôle coordinateur coop': {
    conseillerNumerique: true,
    coordinateurDeclare: true,
  },
  'médiateur et coordinateur conseiller numérique': {
    mediateur: vierge,
    coordinateur: sansEquipe,
    conseillerNumerique: true,
  },
  'sans rôle': {},
  'déclaré coordinateur hors dispositif': { coordinateurDeclare: true },
}

const synchro: {
  semes: readonly string[]
  tailleMax: number
  refuserLePremier: boolean
  refuses: readonly string[]
  lots: readonly (readonly ContactAImporter[])[]
  retraits: readonly AdresseCourriel[]
  bilan?: BilanDeSynchronisation
} = {
  semes: [],
  tailleMax: 1000,
  refuserLePremier: false,
  refuses: [],
  lots: [],
  retraits: [],
}

const semer = async (
  options: Partial<CompteDeListe> & { readonly prenom?: string },
): Promise<string> => {
  const id = await semerUnCompteDeListe({
    prenom: options.prenom ?? 'Brevo',
    marqueur: `Roles${v4().slice(0, 8)}`,
    creeLe: new Date('2026-01-01'),
    inscritLe: new Date('2026-01-02'),
    ...options,
  })
  synchro.semes = [...synchro.semes, id]
  return id
}

const courrielDe = async (id: string): Promise<AdresseCourriel> =>
  AdresseCourriel(
    (
      await prismaClient.user.findUniqueOrThrow({
        where: { id },
        select: { email: true },
      })
    ).email,
  )

const lotsDesSemes = (): readonly (readonly ContactAImporter[])[] =>
  synchro.lots
    .map((lot) =>
      lot.filter(({ utilisateurId }) => synchro.semes.includes(utilisateurId)),
    )
    .filter((lot) => lot.length > 0)

const contactDe = (id: string): ContactAImporter | undefined =>
  synchro.lots.flat().find(({ utilisateurId }) => utilisateurId === id)

Given('un inscrit vivant {string}', async (situation: string) => {
  const options = situations[situation]
  assert.ok(options, `Situation « ${situation} » inconnue`)
  synchro.semes = []
  await semer(options)
})

Given(
  "un médiateur au compte supprimé et un médiateur à l'inscription inachevée",
  async () => {
    synchro.semes = []
    await semer({ mediateur: vierge, supprimeLe: new Date('2026-03-01') })
    await semer({ mediateur: vierge, inscritLe: null })
  },
)

Given(
  'un médiateur vivant avec un prénom, un nom et un téléphone',
  async () => {
    synchro.semes = []
    await semer({
      prenom: 'Jeanne',
      mediateur: vierge,
      telephone: '0612345678',
    })
  },
)

Given(
  'un médiateur vivant dont le téléphone enregistré est illisible',
  async () => {
    synchro.semes = []
    await semer({ mediateur: vierge, telephone: '123' })
  },
)

Given('trois médiateurs vivants', async () => {
  synchro.semes = []
  await semer({ mediateur: vierge })
  await semer({ mediateur: vierge })
  await semer({ mediateur: vierge })
})

Given('Brevo accepte au plus deux contacts par lot', () => {
  synchro.tailleMax = 2
})

Given(
  'Brevo accepte au plus deux contacts par lot et refuse celui du premier médiateur',
  () => {
    synchro.tailleMax = 2
    synchro.refuserLePremier = true
  },
)

When('les rôles Brevo sont synchronisés', async () => {
  synchro.lots = []
  synchro.retraits = []
  synchro.refuses = []
  const [premier] = synchro.semes

  synchro.bilan = await synchroniserLesRolesBrevo({
    importer: {
      tailleMax: TailleDeLot(synchro.tailleMax),
      envoyer: async (lot) => {
        if (
          synchro.refuserLePremier &&
          lot.some(({ utilisateurId }) => utilisateurId === premier)
        ) {
          synchro.refuses = lot.map(({ utilisateurId }) => utilisateurId)
          throw new Error('Lot refusé')
        }
        synchro.lots = [...synchro.lots, lot]
        return IdentifiantDImport(synchro.lots.length)
      },
    },
    retirer: {
      tailleMax: TailleDeLot(150),
      envoyer: async (lot) => {
        synchro.retraits = [...synchro.retraits, ...lot]
      },
    },
  })

  synchro.tailleMax = 1000
  synchro.refuserLePremier = false
})

Then('son contact est importé avec les rôles {string}', (roles: string) => {
  const [id] = synchro.semes
  const contact = id === undefined ? undefined : contactDe(id)
  assert.ok(contact, 'Contact non importé')
  assert.deepStrictEqual(
    versContactBrevo(contact).attributes.ROLES,
    roles.split(', '),
  )
})

Then('son contact est retiré de la liste', async () => {
  const [id] = synchro.semes
  assert.ok(id)
  assert.ok(synchro.retraits.includes(await courrielDe(id)))
  assert.strictEqual(contactDe(id), undefined)
})

Then("aucun de leurs contacts n'est importé ni retiré", async () => {
  const courriels = await Promise.all(synchro.semes.map(courrielDe))
  assert.strictEqual(lotsDesSemes().length, 0)
  assert.ok(courriels.every((courriel) => !synchro.retraits.includes(courriel)))
})

Then(
  'son contact porte son prénom, son nom, son téléphone et son identifiant',
  () => {
    const [id] = synchro.semes
    const contact = id === undefined ? undefined : contactDe(id)
    assert.ok(contact && id)
    const { attributes } = versContactBrevo(contact)
    assert.strictEqual(attributes.EXT_ID, id)
    assert.strictEqual(attributes.FIRSTNAME, 'Jeanne')
    assert.ok(attributes.LASTNAME.startsWith('Roles'))
    assert.strictEqual(attributes.SMS, '+33612345678')
  },
)

Then('son contact est importé sans téléphone', () => {
  const [id] = synchro.semes
  const contact = id === undefined ? undefined : contactDe(id)
  assert.ok(contact)
  assert.strictEqual(contact.telephone, null)
})

Then('aucun lot importé ne dépasse deux contacts', () => {
  assert.ok(synchro.lots.every((lot) => lot.length <= 2))
})

Then('chacun des trois médiateurs figure dans exactement un lot', () => {
  assert.ok(
    synchro.semes.every(
      (id) =>
        synchro.lots.filter((lot) =>
          lot.some(({ utilisateurId }) => utilisateurId === id),
        ).length === 1,
    ),
  )
})

Then('le bilan signale les contacts du lot refusé', async () => {
  const [premier] = synchro.semes
  assert.ok(synchro.bilan && premier)
  const courriel = await courrielDe(premier)
  assert.ok(
    synchro.bilan.echecs.some(
      ({ _tag, courriels }) =>
        _tag === 'ImportEchoue' && courriels.includes(courriel),
    ),
  )
})

Then('les lots suivants sont importés', () => {
  const horsDuLotRefuse = synchro.semes.filter(
    (id) => !synchro.refuses.includes(id),
  )
  assert.ok(horsDuLotRefuse.length > 0)
  assert.ok(horsDuLotRefuse.every((id) => contactDe(id) !== undefined))
})
