import assert from 'node:assert'
import {
  creerOuFusionnerBeneficiairesDepuisUsagersExternes,
  type ExternalUserToMerge,
} from '@app/web/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe'
import {
  seedBeneficiaire,
  testMediateurId,
  trackBeneficiaire,
} from '@app/web/features/beneficiaire/beneficiaire.cucumber'
import { NOM_MAX_LENGTH } from '@app/web/features/beneficiaire/domain/nom'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'

type PortResult = Awaited<
  ReturnType<typeof creerOuFusionnerBeneficiairesDepuisUsagersExternes>
>

const createdRdvUserIds = new Set<number>()

let usagers: ExternalUserToMerge[] = []
let result: PortResult | undefined
let existingBeneficiaireId: string | undefined

const seedRdvUser = async (id: number): Promise<void> => {
  await prismaClient.rdvUser.create({
    data: {
      id,
      firstName: 'Usager',
      lastName: 'Externe',
      notifyByEmail: false,
      notifyBySms: false,
    },
  })
  createdRdvUserIds.add(id)
}

const externalUser = (
  rdvUserId: number,
  fields: Partial<Omit<ExternalUserToMerge, 'rdvUserId'>> = {},
): ExternalUserToMerge => ({
  rdvUserId,
  nom: fields.nom ?? null,
  prenom: fields.prenom ?? null,
  telephone: fields.telephone ?? null,
  email: fields.email ?? null,
  adresse: fields.adresse ?? null,
  birthDate: fields.birthDate ?? null,
})

Given('un usager externe sans bénéficiaire correspondant', async () => {
  await seedRdvUser(990_201)
  usagers = [
    externalUser(990_201, {
      nom: 'Externe',
      prenom: 'Unique',
      email: 'ext-unique@example.com',
    }),
  ]
})

Given(
  'un usager externe correspondant à un bénéficiaire existant',
  async () => {
    await seedRdvUser(990_202)
    existingBeneficiaireId = await seedBeneficiaire({
      prenom: 'Deux',
      nom: 'Doublonexterne',
      email: 'dup-externe@example.com',
    })
    usagers = [
      externalUser(990_202, {
        nom: 'Doublonexterne',
        prenom: 'Deux',
        email: 'dup-externe@example.com',
      }),
    ]
  },
)

Given(
  'un usager externe correspondant à un bénéficiaire au téléphone legacy invalide',
  async () => {
    await seedRdvUser(990_203)
    existingBeneficiaireId = await seedBeneficiaire({
      prenom: 'Trois',
      nom: 'Legacyexterne',
      email: 'legacy-externe@example.com',
    })
    // Téléphone legacy hors validation stricte, injecté hors value object.
    await prismaClient.beneficiaire.update({
      where: { id: existingBeneficiaireId },
      data: { telephone: 'NUMERO-LEGACY-INVALIDE' },
    })
    usagers = [
      externalUser(990_203, {
        nom: 'Legacyexterne',
        prenom: 'Trois',
        email: 'legacy-externe@example.com',
      }),
    ]
  },
)

Given(
  'deux usagers externes dont un provoque une erreur d’infrastructure',
  async () => {
    // 990_204 : rdv_user seedé → création OK. 990_299 : PAS de rdv_user seedé →
    // violation de clé étrangère à la création → usager écarté (Skipped), sans
    // bloquer le premier.
    await seedRdvUser(990_204)
    usagers = [
      externalUser(990_204, {
        nom: 'Valide',
        prenom: 'Quatre',
        email: 'valide-quatre@example.com',
      }),
      externalUser(990_299, {
        nom: 'Echec',
        prenom: 'Poison',
        email: 'poison@example.com',
      }),
    ]
  },
)

When('je crée ou fusionne les bénéficiaires depuis ces usagers', async () => {
  result = await creerOuFusionnerBeneficiairesDepuisUsagersExternes({
    usagers,
    mediateurId: testMediateurId,
  })
  for (const merge of result.merges) trackBeneficiaire(merge.id)
})

Then('un bénéficiaire est créé et lié à cet usager', async () => {
  assert.ok(result)
  assert.strictEqual(result.merges.length, 1)
  assert.strictEqual(result.skipped.length, 0)
  const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
    where: { id: result.merges[0].id },
  })
  assert.strictEqual(beneficiaire.rdvUserId, 990_201)
})

Then(
  'aucun nouveau bénéficiaire n’est créé et l’existant est lié à l’usager',
  async () => {
    assert.ok(result)
    assert.strictEqual(result.merges.length, 1)
    assert.strictEqual(result.merges[0].id, existingBeneficiaireId)
    const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
      where: { id: existingBeneficiaireId },
    })
    assert.strictEqual(beneficiaire.rdvUserId, 990_202)
  },
)

Then('l’usager est fusionné sans erreur dans le bénéficiaire existant', () => {
  assert.ok(result)
  assert.strictEqual(result.skipped.length, 0)
  assert.strictEqual(result.merges.length, 1)
  assert.strictEqual(result.merges[0].id, existingBeneficiaireId)
})

Then('l’usager valide est fusionné et l’usager en échec est écarté', () => {
  assert.ok(result)
  assert.strictEqual(result.merges.length, 1)
  assert.strictEqual(result.skipped.length, 1)
  assert.strictEqual(result.skipped[0].rdvUserId, 990_299)
})

Given(
  'un usager externe au nom plus long que la limite du bénéficiaire',
  async () => {
    await seedRdvUser(990_205)
    usagers = [
      externalUser(990_205, {
        nom: 'Tronquenom'.padEnd(NOM_MAX_LENGTH + 50, 'X'),
        prenom: 'Cinq',
        email: 'nom-trop-long@example.com',
      }),
    ]
  },
)

Given('un usager externe dont le nom et le prénom sont vides', async () => {
  await seedRdvUser(990_206)
  usagers = [
    externalUser(990_206, {
      nom: '   ',
      prenom: '   ',
      email: 'sans-identite@example.com',
    }),
  ]
})

Given('un usager externe né dans le futur', async () => {
  await seedRdvUser(990_207)
  usagers = [
    externalUser(990_207, {
      nom: 'Futur',
      prenom: 'Sept',
      email: 'ne-dans-le-futur@example.com',
      birthDate: new Date('2999-05-04'),
    }),
  ]
})

Then('le bénéficiaire est créé avec un nom tronqué à la limite', async () => {
  assert.ok(result)
  assert.strictEqual(result.skipped.length, 0)
  assert.strictEqual(result.merges.length, 1)
  const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
    where: { id: result.merges[0].id },
  })
  assert.strictEqual(beneficiaire.nom?.length, NOM_MAX_LENGTH)
  assert.ok(beneficiaire.nom?.startsWith('Tronquenom'))
})

Then('aucun bénéficiaire n’est créé et l’usager est écarté', async () => {
  assert.ok(result)
  assert.strictEqual(result.merges.length, 0)
  assert.strictEqual(result.skipped.length, 1)
  assert.strictEqual(result.skipped[0].rdvUserId, 990_206)
  const cree = await prismaClient.beneficiaire.findFirst({
    where: { rdvUserId: 990_206 },
  })
  assert.strictEqual(cree, null)
})

Then('le bénéficiaire est créé sans année de naissance', async () => {
  assert.ok(result)
  assert.strictEqual(result.skipped.length, 0)
  assert.strictEqual(result.merges.length, 1)
  const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
    where: { id: result.merges[0].id },
  })
  assert.strictEqual(beneficiaire.anneeNaissance, null)
  assert.strictEqual(beneficiaire.trancheAge, null)
})

After(async () => {
  if (createdRdvUserIds.size > 0) {
    await prismaClient.rdvUser.deleteMany({
      where: { id: { in: [...createdRdvUserIds] } },
    })
    createdRdvUserIds.clear()
  }
  usagers = []
  result = undefined
  existingBeneficiaireId = undefined
})
