import assert from 'node:assert'
import {
  semerUnCompteDeListe,
  semerUneEmployeuse,
} from '@app/web/features/utilisateurs/utilisateurs.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { garantirLeRoleCoordinateurDuDispositif } from './implementation'

const garantie: {
  utilisateurId?: string
  cree?: boolean
} = {}

const utilisateurId = (): string => {
  assert.ok(garantie.utilisateurId, 'Aucun compte semé')
  return garantie.utilisateurId
}

const semer = async (source: 'idposte' | 'coop') => {
  garantie.utilisateurId = await semerUnCompteDeListe({
    prenom: 'Claire',
    marqueur: `Dispositif${v4().slice(0, 8)}`,
    creeLe: new Date('2026-01-01'),
    inscritLe: new Date('2026-01-02'),
  })
  const personne = await prismaClient.personneMain.create({
    data: { coopId: utilisateurId(), isCoordinateur: true },
    select: { id: true },
  })
  await prismaClient.personneAffectationEmploiMain.create({
    data: {
      personneId: personne.id,
      structureAdministrativeId: await semerUneEmployeuse('Employeuse CN'),
      source,
      estActive: true,
    },
  })
}

Given(
  'un coordinateur du dispositif sans rôle coordinateur dans la coop',
  async () => {
    await semer('idposte')
  },
)

Given(
  'une personne hors dispositif sans rôle coordinateur dans la coop',
  async () => {
    await semer('coop')
  },
)

When('le rôle coordinateur du dispositif est garanti', async () => {
  garantie.cree = (
    await garantirLeRoleCoordinateurDuDispositif(utilisateurId())
  ).cree
})

Then('le rôle coordinateur est créé', async () => {
  assert.strictEqual(garantie.cree, true)
  assert.strictEqual(
    await prismaClient.coordinateur.count({
      where: { userId: utilisateurId() },
    }),
    1,
  )
})

Then("aucun rôle coordinateur n'est créé", async () => {
  assert.strictEqual(garantie.cree, false)
  assert.strictEqual(
    await prismaClient.coordinateur.count({
      where: { userId: utilisateurId() },
    }),
    0,
  )
})
