import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { SireneIndisponible } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/domain/errors'
import { rattacherAUneEmployeuse } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/domain/rattacher-a-une-employeuse'
import { statutDeConseillerNumerique } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/conseiller-numerique-en-poste.query'
import { creerLEmployeuse } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/creer-l-employeuse.mutation'
import { lireLesEmployeusesDuSiret } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/employeuses-du-siret.query'
import { enregistrerLeRattachement } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/enregistrer-le-rattachement.mutation'
import { IdentiteEmployeuse } from '@/features/employeuse/domain/identite-employeuse'
import { UtilisateurId } from '@/features/employeuse/domain/utilisateur-id'
import {
  affectationsDe,
  seedAffectation,
  seedEmployeuseMain,
  seedUtilisateur,
} from '@/features/employeuse/employeuse.cucumber'
import { failure } from '@/libraries/result'

// État local à cette ability (les phrasés Cucumber sont globaux).
let inscritId: string
const employeuses = new Map<string, { id: number; siret: string }>()

// Les employeuses sont enregistrées AVANT le rattachement, avec le SIRET et la dénomination que
// l'identité portera : la garantie les retrouve alors par leur clé métier, sans géocodage — donc
// sans appel réseau, et le scénario reste déterministe.
const identitePour = (nom: string): IdentiteEmployeuse => {
  const employeuse = employeuses.get(nom)
  assert.ok(employeuse, `L'employeuse « ${nom} » n'a pas été enregistrée`)

  return IdentiteEmployeuse({
    siret: employeuse.siret,
    denomination: nom,
    adresse: {
      voie: null,
      commune: 'Nantes',
      codePostal: '44000',
      codeInsee: '44109',
    },
  })
}

const employeuseId = (nom: string): number => {
  const employeuse = employeuses.get(nom)
  assert.ok(employeuse, `L'employeuse « ${nom} » n'a pas été enregistrée`)
  return employeuse.id
}

const affectation = async (nom: string, source: string) => {
  const affectations = await affectationsDe(inscritId)
  return affectations.find(
    (candidate) =>
      candidate.structureAdministrativeId === employeuseId(nom) &&
      candidate.source === source,
  )
}

Given(
  'une employeuse {string} enregistrée avec le SIRET {string}',
  async (nom: string, siret: string) => {
    employeuses.set(nom, { id: await seedEmployeuseMain(nom, siret), siret })
  },
)

Given('un utilisateur nouvellement inscrit', async () => {
  inscritId = await seedUtilisateur()
})

Given(
  'ce utilisateur affecté par le dispositif à {string}',
  async (nom: string) => {
    await seedAffectation({
      userId: inscritId,
      employeuseId: employeuseId(nom),
      source: 'idposte',
    })
  },
)

const rattacher = rattacherAUneEmployeuse({
  lireLEtablissement: async () => failure(SireneIndisponible()),
  lireLeStatutDeConseillerNumerique: statutDeConseillerNumerique,
  lireLesEmployeusesDuSiret,
  creerLEmployeuse: creerLEmployeuse({ geocoder: async () => null }),
  enregistrerLeRattachement: enregistrerLeRattachement({
    garantirLaPersonne: ({ coopUserId, email }, transaction) =>
      transaction.personneMain.upsert({
        where: { coopId: coopUserId },
        create: { coopId: coopUserId, contact: { coop: { email } } },
        update: {},
        select: { id: true },
      }),
    synchroniserLaPersonne: async () => undefined,
  }),
})

When('je le rattache à {string}', async (nom: string) => {
  await rattacher({
    userId: UtilisateurId(inscritId),
    source: { _tag: 'Saisie', identite: identitePour(nom) },
  })
})

When('je le rattache à nouveau à {string}', async (nom: string) => {
  await rattacher({
    userId: UtilisateurId(inscritId),
    source: { _tag: 'Saisie', identite: identitePour(nom) },
  })
})

Then('il est rattaché à {string}', async (nom: string) => {
  assert.ok(await affectation(nom, 'coop'), `Aucun rattachement à « ${nom} »`)
})

Then('son rattachement à {string} est actif', async (nom: string) => {
  assert.strictEqual((await affectation(nom, 'coop'))?.estActive, true)
})

Then('son rattachement à {string} est terminé', async (nom: string) => {
  assert.strictEqual((await affectation(nom, 'coop'))?.estActive, false)
})

Then(
  'il a {int} rattachement(s) déclaré(s) par la coop',
  async (attendu: number) => {
    const affectations = await affectationsDe(inscritId)
    assert.strictEqual(
      affectations.filter(({ source }) => source === 'coop').length,
      attendu,
    )
  },
)

Then(
  'son affectation du dispositif à {string} est toujours active',
  async (nom: string) => {
    assert.strictEqual((await affectation(nom, 'idposte'))?.estActive, true)
  },
)
