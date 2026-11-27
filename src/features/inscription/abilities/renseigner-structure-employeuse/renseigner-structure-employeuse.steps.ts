import assert from 'node:assert'
import { Before, Given, Then, When } from '@cucumber/cucumber'
import { prismaClient } from '@/configuration/prisma'
import type { EchecDeRenseignerStructureEmployeuse } from '@/features/inscription/abilities/renseigner-structure-employeuse/domain/errors'
import type { RattacherEmployeuse } from '@/features/inscription/abilities/renseigner-structure-employeuse/domain/ports'
import { renseignerStructureEmployeuse } from '@/features/inscription/abilities/renseigner-structure-employeuse/domain/renseigner-structure-employeuse'
import type { StructureEmployeuseRenseignee } from '@/features/inscription/abilities/renseigner-structure-employeuse/domain/structure-employeuse-renseignee'
import { projeterEtapeFranchie } from '@/features/inscription/abilities/renseigner-structure-employeuse/implementations/prisma/projeter-etape-franchie.mutation'
import { ProfilInscription } from '@/features/inscription/domain'
import { getInscriptionEtat } from '@/features/inscription/implementations/prisma/get-inscription-etat.query'
import {
  seedProfilChoisi,
  utilisateurDeLInscriptionEnCours,
} from '@/features/inscription/inscription.cucumber'
import { failure, type Result, success } from '@/libraries/result'

const employeuse = 'Structure de test'

const rattachement = 'Rattachée à la structure de test'

const rattachable: RattacherEmployeuse<string, string, string> = async () =>
  success(rattachement)

const nonRattachable: RattacherEmployeuse<string, string, string> = async () =>
  failure('Identité inexploitable')

const contexte: {
  rattacherEmployeuse: RattacherEmployeuse<string, string, string>
  resultat: Result<
    StructureEmployeuseRenseignee<string, string>,
    EchecDeRenseignerStructureEmployeuse<string>
  > | null
} = { rattacherEmployeuse: rattachable, resultat: null }

Before(() => {
  contexte.rattacherEmployeuse = rattachable
  contexte.resultat = null
})

Given('j’ai choisi le profil {string}', async (profil: string) => {
  await seedProfilChoisi(ProfilInscription.schema.parse(profil))
})

Given('l’employeuse choisie n’est pas rattachable', () => {
  contexte.rattacherEmployeuse = nonRattachable
})

When('je renseigne ma structure employeuse', async () => {
  contexte.resultat = await renseignerStructureEmployeuse({
    lireLEtat: getInscriptionEtat,
    rattacherEmployeuse: contexte.rattacherEmployeuse,
    projeterEtapeFranchie,
  })({
    command: { userId: utilisateurDeLInscriptionEnCours(), employeuse },
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
  assert.ok(contexte.resultat?.success, 'Le renseignement aurait dû aboutir')
  assert.strictEqual(contexte.resultat.data.rattachement, rattachement)
})

Then('le renseignement est refusé faute de profil choisi', () => {
  assert.ok(
    contexte.resultat && !contexte.resultat.success,
    'Le renseignement aurait dû être refusé',
  )
  assert.strictEqual(contexte.resultat.error._tag, 'ProfilNonChoisi')
})

Then('le renseignement est refusé faute d’employeuse rattachable', () => {
  assert.ok(
    contexte.resultat && !contexte.resultat.success,
    'Le renseignement aurait dû être refusé',
  )
  assert.strictEqual(contexte.resultat.error._tag, 'EmployeuseNonRattachee')
})

Then('ma structure employeuse n’est pas renseignée', async () => {
  const user = await prismaClient.user.findUniqueOrThrow({
    where: { id: utilisateurDeLInscriptionEnCours() },
    select: { structureEmployeuseRenseignee: true },
  })
  assert.strictEqual(user.structureEmployeuseRenseignee, null)
})
