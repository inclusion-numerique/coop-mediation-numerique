import assert from 'node:assert'
import {
  type RenseignerStructureEmployeuseError,
  renseignerStructureEmployeuse,
  type StructureEmployeuseInput,
  StructureId,
} from '@app/web/features/inscription/abilities/renseigner-structure-employeuse'
import { ProfilInscription } from '@app/web/features/inscription/domain'
import {
  currentInscriptionUserId,
  seedProfilChoisi,
  seedStructureEmployeuse,
} from '@app/web/features/inscription/inscription.cucumber'
import type { Result } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

let nouvelleStructureId = ''
let ancienneStructureId = ''
let resultat: Result<
  { readonly structureId: StructureId },
  RenseignerStructureEmployeuseError
>

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
  typologies: [],
}

Given('j’ai choisi le profil {string}', async (profil: string) => {
  await seedProfilChoisi(ProfilInscription.schema.parse(profil))
})

Given('un emploi existe déjà dans une autre structure', async () => {
  ancienneStructureId = await seedStructureEmployeuse({
    nom: 'Ancienne structure',
  })
  await prismaClient.employeStructure.create({
    data: {
      id: v4(),
      userId: currentInscriptionUserId(),
      structureId: ancienneStructureId,
      debut: new Date(),
    },
  })
})

When('je renseigne ma structure employeuse', async () => {
  nouvelleStructureId = await seedStructureEmployeuse({
    nom: 'Nouvelle structure',
  })
  resultat = await renseignerStructureEmployeuse({
    command: {
      userId: currentInscriptionUserId(),
      structureEmployeuse: structureEmployeuseInput,
    },
    ensureStructureEmployeuse: async () => StructureId(nouvelleStructureId),
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

Then('je suis rattaché à cette structure comme employé', async () => {
  const emploi = await prismaClient.employeStructure.findFirst({
    where: {
      userId: currentInscriptionUserId(),
      structureId: nouvelleStructureId,
      fin: null,
    },
  })
  assert.ok(emploi, 'Aucun emploi actif pour la nouvelle structure')
})

Then('le précédent emploi est rompu', async () => {
  const ancien = await prismaClient.employeStructure.findFirst({
    where: {
      userId: currentInscriptionUserId(),
      structureId: ancienneStructureId,
    },
  })
  assert.ok(ancien?.fin, 'Le précédent emploi n’a pas été rompu')
})

Then('le renseignement est refusé faute de profil choisi', () => {
  assert.ok(!resultat.success, 'Le renseignement aurait dû être refusé')
  assert.strictEqual(resultat.error._tag, 'ProfilNonChoisi')
})

Then('ma structure employeuse n’est pas renseignée', async () => {
  const user = await prismaClient.user.findUniqueOrThrow({
    where: { id: currentInscriptionUserId() },
    select: { structureEmployeuseRenseignee: true },
  })
  assert.strictEqual(user.structureEmployeuseRenseignee, null)
})

Then('aucun emploi n’est créé', async () => {
  const emplois = await prismaClient.employeStructure.count({
    where: { userId: currentInscriptionUserId() },
  })
  assert.strictEqual(emplois, 0)
})
