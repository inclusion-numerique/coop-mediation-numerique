import assert from 'node:assert'
import { Then, When } from '@cucumber/cucumber'
import { prismaClient } from '@/configuration/prisma/prisma-client'
import { type BeneficiaireAImporter } from '@/features/beneficiaire/abilities/importer-beneficiaires/domain/importer-beneficiaires'
import { importerBeneficiaires } from '@/features/beneficiaire/abilities/importer-beneficiaires/implementations/prisma/importer-beneficiaires.mutation'
import {
  suivreLeBeneficiaire,
  testMediateurId,
} from '@/features/beneficiaire/beneficiaire.cucumber'
import { Genre } from '@/features/beneficiaire/domain/genre'
import { Nom } from '@/features/beneficiaire/domain/nom'
import { Prenom } from '@/features/beneficiaire/domain/prenom'
import { StatutSocial } from '@/features/beneficiaire/domain/statut-social'
import { TrancheAge } from '@/features/beneficiaire/domain/tranche-age'

let result: { importes: number } | undefined

const beneficiaireAImporter = (
  prenom: string,
  nom: string,
): BeneficiaireAImporter => ({
  prenom: Prenom(prenom),
  nom: Nom(nom),
  contactTelephone: { _tag: 'nonRenseigne' },
  email: null,
  anneeNaissance: null,
  communeResidence: null,
  genre: Genre(null),
  trancheAge: TrancheAge(null),
  statutSocial: StatutSocial(null),
  notes: null,
})

When("j'importe {int} bénéficiaires", async (count: number) => {
  result = await importerBeneficiaires({
    beneficiaires: Array.from({ length: count }, (_, index) =>
      beneficiaireAImporter(`Prenom${index}`, `Nom${index}`),
    ),
    mediateurId: testMediateurId,
  })

  const created = await prismaClient.beneficiaire.findMany({
    where: {
      mediateurId: testMediateurId,
      prenom: { startsWith: 'Prenom' },
      suppression: null,
    },
    select: { id: true },
  })
  for (const { id } of created) suivreLeBeneficiaire(id)
})

Then("l'import crée {int} bénéficiaires", (count: number) => {
  assert.strictEqual(result?.importes, count)
})
