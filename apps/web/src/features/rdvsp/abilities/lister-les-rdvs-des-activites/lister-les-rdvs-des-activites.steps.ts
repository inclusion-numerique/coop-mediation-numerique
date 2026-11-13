import assert from 'node:assert'
import {
  ID_TEST,
  seedCompteRdv,
  seedParticipation,
  seedRdv,
} from '@app/web/features/rdvsp/rdvsp.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { StatutRdv } from '../../domain/statut-rdv'
import {
  rendezVousAListerSql,
  rendezVousDesUsagersAListerSql,
  rendezVousLies,
  rendezVousParIds,
} from './implementation'

const COMPTE = ID_TEST.compte + 21
const PREMIER = ID_TEST.rdv + 210
const SECOND = ID_TEST.rdv + 211
const USAGER = ID_TEST.usager + 210
const PARTICIPATION = ID_TEST.participation + 210

let selectionnes: readonly number[] = []

Given('un compte RDV ayant 2 rendez-vous en mars 2026', async () => {
  selectionnes = []
  await seedCompteRdv({ id: COMPTE, accessToken: 'jeton-acces' })
  await seedRdv({
    id: PREMIER,
    rdvAccountId: COMPTE,
    debut: new Date('2026-03-03T09:00:00.000Z'),
  })
  await seedRdv({
    id: SECOND,
    rdvAccountId: COMPTE,
    debut: new Date('2026-03-05T09:00:00.000Z'),
  })
})

Given('le compte rendu de son premier rendez-vous a été décliné', async () => {
  await prismaClient.rdv.update({
    where: { id: PREMIER },
    data: { compteRenduRegle: true },
  })
})

Given('la présence à son second rendez-vous est honorée', async () => {
  await prismaClient.rdv.update({
    where: { id: SECOND },
    data: { status: 'seen' },
  })
})

Given('un usager RDV participe à son second rendez-vous', async () => {
  await seedParticipation({
    id: PARTICIPATION,
    rdvId: SECOND,
    usagerId: USAGER,
  })
})

const selectionner = async (
  statuts: readonly StatutRdv[],
  selection = rendezVousAListerSql,
) => {
  const lignes = await prismaClient.$queryRaw<{ id: number }[]>`
    SELECT id FROM (${selection({ comptes: [COMPTE], periode: null, statuts })}) r`
  selectionnes = lignes.map(({ id }) => id)
}

When('je sélectionne les rendez-vous de cet usager', async () => {
  await selectionner([], rendezVousDesUsagersAListerSql([USAGER]))
})

When("je sélectionne les rendez-vous d'aucun usager", async () => {
  await selectionner([], rendezVousDesUsagersAListerSql([]))
})

When('je sélectionne les rendez-vous du compte', async () => {
  await selectionner([])
})

When('je sélectionne les rendez-vous passés du compte', async () => {
  await selectionner([StatutRdv('passe')])
})

Then('{int} rendez-vous est sélectionné', (attendu: number) => {
  assert.strictEqual(selectionnes.length, attendu)
})

const RANGS: Readonly<Record<string, number>> = {
  premier: PREMIER,
  second: SECOND,
}

Then(
  'le statut affiché de son {word} rendez-vous est {string}',
  async (rang: string, statut: string) => {
    const id = RANGS[rang] ?? 0
    const [lie] = await rendezVousLies([id])
    const [detail] = await rendezVousParIds([id])
    assert.deepStrictEqual([lie?.statut, detail?.statut], [statut, statut])
  },
)
