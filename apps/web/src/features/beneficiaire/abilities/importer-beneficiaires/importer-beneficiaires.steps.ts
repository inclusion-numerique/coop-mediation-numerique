import assert from 'node:assert'
import type { BeneficiaireAImporter } from '@app/web/features/beneficiaire/abilities/importer-beneficiaires'
import { importerBeneficiaires } from '@app/web/features/beneficiaire/abilities/importer-beneficiaires/implementation'
import {
  testMediateurId,
  trackBeneficiaire,
} from '@app/web/features/beneficiaire/beneficiaire.cucumber'
import { Genre } from '@app/web/features/beneficiaire/domain/genre'
import { Nom } from '@app/web/features/beneficiaire/domain/nom'
import { Prenom } from '@app/web/features/beneficiaire/domain/prenom'
import { StatutSocial } from '@app/web/features/beneficiaire/domain/statut-social'
import { prismaClient } from '@app/web/prismaClient'
import { Then, When } from '@cucumber/cucumber'

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
  for (const { id } of created) trackBeneficiaire(id)
})

Then("l'import crée {int} bénéficiaires", (count: number) => {
  assert.strictEqual(result?.importes, count)
})
