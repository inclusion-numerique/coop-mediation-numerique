import assert from 'node:assert'
import {
  renseignerStructureEmployeuse,
  type StructureEmployeuseInput,
  StructureId,
} from '@app/web/features/inscription/abilities/renseigner-structure-employeuse'
import { lierEmploi } from '@app/web/features/inscription/abilities/renseigner-structure-employeuse/implementation'
import {
  currentInscriptionUserId,
  seedStructure,
} from '@app/web/features/inscription/inscription.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

let nouvelleStructureId = ''
let ancienneStructureId = ''

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

Given('un emploi existe déjà dans une autre structure', async () => {
  ancienneStructureId = await seedStructure({ nom: 'Ancienne structure' })
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
  nouvelleStructureId = await seedStructure({ nom: 'Nouvelle structure' })
  await renseignerStructureEmployeuse({
    ensureStructureEmployeuse: async () => StructureId(nouvelleStructureId),
    lierEmploi,
  })({
    userId: currentInscriptionUserId(),
    structureEmployeuse: structureEmployeuseInput,
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
