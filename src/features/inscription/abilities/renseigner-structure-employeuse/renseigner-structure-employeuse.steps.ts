import assert from 'node:assert'
import { Before, Given, Then, When } from '@cucumber/cucumber'
import { prismaClient } from '@/configuration/prisma'
import type { EchecDeRenseignerStructureEmployeuse } from '@/features/inscription/abilities/renseigner-structure-employeuse/domain/errors'
import type { RattacherEmployeuse } from '@/features/inscription/abilities/renseigner-structure-employeuse/domain/ports'
import { renseignerStructureEmployeuse } from '@/features/inscription/abilities/renseigner-structure-employeuse/domain/renseigner-structure-employeuse'
import type { SaisieEmployeuse } from '@/features/inscription/abilities/renseigner-structure-employeuse/domain/saisie-employeuse'
import type { StructureEmployeuseRenseignee } from '@/features/inscription/abilities/renseigner-structure-employeuse/domain/structure-employeuse-renseignee'
import { projeterEtapeFranchie } from '@/features/inscription/abilities/renseigner-structure-employeuse/implementations/prisma/projeter-etape-franchie.mutation'
import { ProfilInscription } from '@/features/inscription/domain'
import { getInscriptionEtat } from '@/features/inscription/implementations/prisma/get-inscription-etat.query'
import {
  seedProfilChoisi,
  utilisateurDeLInscriptionEnCours,
} from '@/features/inscription/inscription.cucumber'
import type { Result } from '@/libraries/result'

const renseignerStructureEmployeuseAvec = (
  rattacherEmployeuse: RattacherEmployeuse,
) =>
  renseignerStructureEmployeuse({
    lireLEtat: getInscriptionEtat,
    rattacherEmployeuse,
    projeterEtapeFranchie,
  })

let rattachable = true
let rattachementsDemandes = 0
let resultat: Result<
  StructureEmployeuseRenseignee,
  EchecDeRenseignerStructureEmployeuse
>

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
  return { success: rattachable }
}

const saisie: SaisieEmployeuse = {
  siret: '35600000000048',
  denomination: 'Structure de test',
  adresse: {
    voie: '1 rue de la Paix',
    commune: 'Paris',
    codePostal: '75001',
    codeInsee: '75101',
  },
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
      saisie,
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
