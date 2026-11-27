import assert from 'node:assert'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { prismaClient } from '@/configuration/prisma'
import { creerOuFusionnerDepuisUsagerExterne } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/domain/creer-ou-fusionner-depuis-usager-externe'
import type { FusionDesUsagers } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/domain/fusion-des-usagers'
import { lireLeBeneficiaireLie } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma/beneficiaire-lie.query'
import { creerLeBeneficiaire } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma/creer-le-beneficiaire.mutation'
import { trouverUnDoublon } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma/doublon-de-l-usager.query'
import { mettreAJourLeBeneficiaire } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma/mettre-a-jour-le-beneficiaire.mutation'
import {
  demandeNormalisee,
  type UsagerExterneAFusionner,
} from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/rdv-service-public/usager-externe.transfer'
import {
  seedBeneficiaire,
  suivreLeBeneficiaire,
  testMediateurId,
} from '@/features/beneficiaire/beneficiaire.cucumber'
import { NOM_MAX_LENGTH } from '@/features/beneficiaire/domain/nom'
import { success } from '@/libraries/result'

type PortResult = FusionDesUsagers

const createdRdvUserIds = new Set<number>()

const contexte: {
  usagers: UsagerExterneAFusionner[]
  result?: PortResult | undefined
  existingBeneficiaireId?: string | undefined
} = { usagers: [] }

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
  fields: Partial<Omit<UsagerExterneAFusionner, 'rdvUserId'>> = {},
): UsagerExterneAFusionner => ({
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
  contexte.usagers = [
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
    contexte.existingBeneficiaireId = await seedBeneficiaire({
      prenom: 'Deux',
      nom: 'Doublonexterne',
      email: 'dup-externe@example.com',
    })
    contexte.usagers = [
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
    contexte.existingBeneficiaireId = await seedBeneficiaire({
      prenom: 'Trois',
      nom: 'Legacyexterne',
      email: 'legacy-externe@example.com',
    })
    await prismaClient.beneficiaire.update({
      where: { id: contexte.existingBeneficiaireId },
      data: { telephone: 'NUMERO-LEGACY-INVALIDE' },
    })
    contexte.usagers = [
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
    await seedRdvUser(990_204)
    contexte.usagers = [
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
  const fusion = await creerOuFusionnerDepuisUsagerExterne({
    lireLeBeneficiaireLie,
    trouverUnDoublon,
    communeDeLAdresse: async () => success(null),
    mettreAJourLeBeneficiaire,
    creerLeBeneficiaire,
  })(
    demandeNormalisee({
      usagers: contexte.usagers,
      mediateurId: testMediateurId,
      maintenant: new Date(),
    }),
  )
  contexte.result = fusion.data
  fusion.data.merges.map(({ id }) => id).forEach(suivreLeBeneficiaire)
})

Then('un bénéficiaire est créé et lié à cet usager', async () => {
  assert.ok(contexte.result)
  assert.strictEqual(contexte.result.merges.length, 1)
  assert.strictEqual(contexte.result.skipped.length, 0)
  const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
    where: { id: contexte.result.merges[0]?.id ?? '' },
  })
  assert.strictEqual(beneficiaire.rdvUserId, 990_201)
})

Then(
  'aucun nouveau bénéficiaire n’est créé et l’existant est lié à l’usager',
  async () => {
    assert.ok(contexte.result)
    assert.strictEqual(contexte.result.merges.length, 1)
    assert.strictEqual(
      contexte.result.merges[0]?.id,
      contexte.existingBeneficiaireId,
    )
    const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
      where: { id: contexte.existingBeneficiaireId ?? '' },
    })
    assert.strictEqual(beneficiaire.rdvUserId, 990_202)
  },
)

Then('l’usager est fusionné sans erreur dans le bénéficiaire existant', () => {
  assert.ok(contexte.result)
  assert.strictEqual(contexte.result.skipped.length, 0)
  assert.strictEqual(contexte.result.merges.length, 1)
  assert.strictEqual(
    contexte.result.merges[0]?.id,
    contexte.existingBeneficiaireId,
  )
})

Then('l’usager valide est fusionné et l’usager en échec est écarté', () => {
  assert.ok(contexte.result)
  assert.strictEqual(contexte.result.merges.length, 1)
  assert.strictEqual(contexte.result.skipped.length, 1)
  assert.strictEqual(contexte.result.skipped[0]?.rdvUserId, 990_299)
})

Given(
  'un usager externe au nom plus long que la limite du bénéficiaire',
  async () => {
    await seedRdvUser(990_205)
    contexte.usagers = [
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
  contexte.usagers = [
    externalUser(990_206, {
      nom: '   ',
      prenom: '   ',
      email: 'sans-identite@example.com',
    }),
  ]
})

Given('un usager externe né dans le futur', async () => {
  await seedRdvUser(990_207)
  contexte.usagers = [
    externalUser(990_207, {
      nom: 'Futur',
      prenom: 'Sept',
      email: 'ne-dans-le-futur@example.com',
      birthDate: new Date('2999-05-04'),
    }),
  ]
})

Then('le bénéficiaire est créé avec un nom tronqué à la limite', async () => {
  assert.ok(contexte.result)
  assert.strictEqual(contexte.result.skipped.length, 0)
  assert.strictEqual(contexte.result.merges.length, 1)
  const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
    where: { id: contexte.result.merges[0]?.id ?? '' },
  })
  assert.strictEqual(beneficiaire.nom?.length, NOM_MAX_LENGTH)
  assert.ok(beneficiaire.nom?.startsWith('Tronquenom'))
})

Then('aucun bénéficiaire n’est créé et l’usager est écarté', async () => {
  assert.ok(contexte.result)
  assert.strictEqual(contexte.result.merges.length, 0)
  assert.strictEqual(contexte.result.skipped.length, 1)
  assert.strictEqual(contexte.result.skipped[0]?.rdvUserId, 990_206)
  const cree = await prismaClient.beneficiaire.findFirst({
    where: { rdvUserId: 990_206 },
  })
  assert.strictEqual(cree, null)
})

Then('le bénéficiaire est créé sans année de naissance', async () => {
  assert.ok(contexte.result)
  assert.strictEqual(contexte.result.skipped.length, 0)
  assert.strictEqual(contexte.result.merges.length, 1)
  const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
    where: { id: contexte.result.merges[0]?.id ?? '' },
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
  contexte.usagers = []
  contexte.result = undefined
  contexte.existingBeneficiaireId = undefined
})
