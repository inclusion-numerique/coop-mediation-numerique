import assert from 'node:assert'
import type {
  RattacherEmployeuse,
  RenseignerStructureEmployeuseError,
  StructureEmployeuseInput,
} from '@app/web/features/inscription/abilities/renseigner-structure-employeuse'
import { renseignerStructureEmployeuse } from '@app/web/features/inscription/abilities/renseigner-structure-employeuse/commands/renseigner-structure-employeuse'
import { ProfilInscription } from '@app/web/features/inscription/domain'
import {
  currentInscriptionUserId,
  seedProfilChoisi,
} from '@app/web/features/inscription/inscription.cucumber'
import type { Result } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { Before, Given, Then, When } from '@cucumber/cucumber'

let rattachable = true
let rattachementsDemandes = 0
let resultat: Result<void, RenseignerStructureEmployeuseError>

Before(() => {
  rattachable = true
  rattachementsDemandes = 0
})

/**
 * Port employeuse simulé : cette ability ne teste pas le rattachement — il a sa
 * propre BDD dans `features/employeuse` — mais ce qu'elle en déduit.
 */
const rattacherEmployeuse: RattacherEmployeuse = async () => {
  rattachementsDemandes += 1
  return rattachable ? 'rattachee' : 'indisponible'
}

const structureEmployeuseInput: StructureEmployeuseInput = {
  id: null,
  nom: 'Structure de test',
  siret: '35600000000048',
  adresse: {
    id: 'adr-1',
    nom: '1 rue de la Paix',
    commune: 'Paris',
    codeInsee: '75101',
    codePostal: '75001',
    contexte: '75, Paris',
    latitude: 0,
    longitude: 0,
  },
}

Given('j’ai choisi le profil {string}', async (profil: string) => {
  await seedProfilChoisi(ProfilInscription.schema.parse(profil))
})

Given('l’employeuse choisie n’est pas rattachable', () => {
  rattachable = false
})

When('je renseigne ma structure employeuse', async () => {
  resultat = await renseignerStructureEmployeuse({
    command: {
      userId: currentInscriptionUserId(),
      structureEmployeuse: structureEmployeuseInput,
    },
    rattacherEmployeuse,
    maintenant: new Date(),
  })
})

Then('ma structure employeuse est renseignée', async () => {
  const user = await prismaClient.user.findUniqueOrThrow({
    where: { id: currentInscriptionUserId() },
    select: { structureEmployeuseRenseignee: true },
  })
  assert.ok(
    user.structureEmployeuseRenseignee,
    'L’étape structure employeuse n’est pas marquée renseignée',
  )
})

Then('le rattachement à l’employeuse a été demandé', () => {
  assert.strictEqual(rattachementsDemandes, 1)
})

Then('aucun rattachement n’a été demandé', () => {
  assert.strictEqual(rattachementsDemandes, 0)
})

Then('le renseignement est refusé faute de profil choisi', () => {
  assert.ok(!resultat.success, 'Le renseignement aurait dû être refusé')
  assert.strictEqual(resultat.error._tag, 'ProfilNonChoisi')
})

Then('le renseignement est refusé faute d’employeuse rattachable', () => {
  assert.ok(!resultat.success, 'Le renseignement aurait dû être refusé')
  assert.strictEqual(resultat.error._tag, 'EmployeuseIndisponible')
})

Then('ma structure employeuse n’est pas renseignée', async () => {
  const user = await prismaClient.user.findUniqueOrThrow({
    where: { id: currentInscriptionUserId() },
    select: { structureEmployeuseRenseignee: true },
  })
  assert.strictEqual(user.structureEmployeuseRenseignee, null)
})
