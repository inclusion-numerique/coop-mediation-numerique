import assert from 'node:assert'
import { Before, Given, Then, When } from '@cucumber/cucumber'
import { prismaClient } from '@/configuration/prisma/prisma-client'
import { type RenseignerStructureEmployeuseError } from '@/features/inscription/abilities/renseigner-structure-employeuse/domain/decider-la-structure-employeuse'
import { type RattacherEmployeuse } from '@/features/inscription/abilities/renseigner-structure-employeuse/domain/ports'
import { type StructureEmployeuseInput } from '@/features/inscription/abilities/renseigner-structure-employeuse/domain/structure-employeuse-input'
import { renseignerStructureEmployeuseAvec } from '@/features/inscription/abilities/renseigner-structure-employeuse/implementations/renseigner-structure-employeuse.binding'
import { ProfilInscription } from '@/features/inscription/domain'
import {
  seedProfilChoisi,
  utilisateurDeLInscriptionEnCours,
} from '@/features/inscription/inscription.cucumber'
import type { Result } from '@/libraries/result'

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
  return { _tag: rattachable ? 'rattachee' : 'employeuseIndisponible' }
}

const structureEmployeuseInput: StructureEmployeuseInput = {
  nom: 'Structure de test',
  siret: '35600000000048',
  adresse: '1 rue de la Paix',
  commune: 'Paris',
  codeInsee: '75101',
  codePostal: '75001',
}

Given('j’ai choisi le profil {string}', async (profil: string) => {
  await seedProfilChoisi(ProfilInscription.schema.parse(profil))
})

Given('l’employeuse choisie n’est pas rattachable', () => {
  rattachable = false
})

When('je renseigne ma structure employeuse', async () => {
  resultat = await renseignerStructureEmployeuseAvec(rattacherEmployeuse)({
    command: {
      userId: utilisateurDeLInscriptionEnCours(),
      structureEmployeuse: structureEmployeuseInput,
    },
    maintenant: new Date(),
  })
})

Then('ma structure employeuse est renseignée', async () => {
  const user = await prismaClient.user.findUniqueOrThrow({
    where: { id: utilisateurDeLInscriptionEnCours() },
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
    where: { id: utilisateurDeLInscriptionEnCours() },
    select: { structureEmployeuseRenseignee: true },
  })
  assert.strictEqual(user.structureEmployeuseRenseignee, null)
})
