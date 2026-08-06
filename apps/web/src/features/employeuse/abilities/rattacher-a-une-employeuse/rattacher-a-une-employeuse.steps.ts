import assert from 'node:assert'
import { rattacherAUneEmployeuse } from '@app/web/features/employeuse/abilities/rattacher-a-une-employeuse/implementation'
import { IdentiteEmployeuse } from '@app/web/features/employeuse/domain/identite-employeuse'
import {
  affectationsDe,
  seedAffectation,
  seedEmployeuseMain,
  seedUtilisateur,
} from '@app/web/features/employeuse/employeuse.cucumber'
import { Given, Then, When } from '@cucumber/cucumber'

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

When('je le rattache à {string}', async (nom: string) => {
  await rattacherAUneEmployeuse({
    userId: inscritId,
    identite: identitePour(nom),
  })
})

When('je le rattache à nouveau à {string}', async (nom: string) => {
  await rattacherAUneEmployeuse({
    userId: inscritId,
    identite: identitePour(nom),
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
