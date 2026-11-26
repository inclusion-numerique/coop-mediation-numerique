import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { exporterLesMembres as exporterLesMembresAvec } from '@/features/equipe/abilities/exporter-les-membres/domain/exporter-les-membres'
import { lireLesMembresAExporter } from '@/features/equipe/abilities/exporter-les-membres/implementations/prisma/membres-a-exporter.query'
import { CoordinateurId, type Lecteur } from '@/features/equipe/domain'
import {
  type CoordinateurSeme,
  semerUnCoordinateur,
  semerUneAdhesion,
  semerUnMediateurDEquipe,
} from '@/features/equipe/equipe.cucumber'
import { criteresDeLEquipe } from '@/features/equipe/ui/filtres/equipe.filtre'

const exporterLesMembres = exporterLesMembresAvec({ lireLesMembresAExporter })

const contexte: {
  coordinateur?: CoordinateurSeme
  issue?: Awaited<ReturnType<typeof exporterLesMembres>>
} = {}

const coordinateur = (): CoordinateurSeme => {
  assert.ok(contexte.coordinateur)
  return contexte.coordinateur
}

const exporter = async (
  lecteur: Lecteur,
  parametres: Parameters<typeof criteresDeLEquipe>[0] = {},
) => {
  contexte.issue = await exporterLesMembres({
    coordinateurId: CoordinateurId(coordinateur().coordinateurId),
    lecteur,
    criteres: criteresDeLEquipe(parametres),
    maintenant: new Date(),
  })
}

Given(
  "un coordinateur dont l'équipe compte un membre actif et un ancien membre",
  async () => {
    contexte.coordinateur = await semerUnCoordinateur()
    const actif = await semerUnMediateurDEquipe({
      derniereActivite: new Date(),
    })
    const ancien = await semerUnMediateurDEquipe()
    await semerUneAdhesion({
      coordinateurId: coordinateur().coordinateurId,
      mediateurId: actif.mediateurId,
    })
    await semerUneAdhesion({
      coordinateurId: coordinateur().coordinateurId,
      mediateurId: ancien.mediateurId,
      archivee: true,
    })
  },
)

When('le coordinateur exporte les archives de son équipe', async () => {
  await exporter(
    {
      gestionnaire: {
        type: 'Coordinateur',
        coordinateurId: CoordinateurId(coordinateur().coordinateurId),
      },
      membreActifDeLEquipe: false,
    },
    { statut: 'archives' },
  )
})

When("le coordinateur d'une autre équipe exporte cette équipe", async () => {
  const autre = await semerUnCoordinateur()
  await exporter({
    gestionnaire: {
      type: 'Coordinateur',
      coordinateurId: CoordinateurId(autre.coordinateurId),
    },
    membreActifDeLEquipe: false,
  })
})

Then("l'export compte {int} membre(s)", (nombre: number) => {
  assert.ok(contexte.issue?.success)
  assert.strictEqual(contexte.issue.data.length, nombre)
})

Then('ce membre exporté est un ancien membre', () => {
  assert.ok(contexte.issue?.success)
  assert.strictEqual(contexte.issue.data[0]?.ligne.statut.type, 'AncienMembre')
})

Then("l'export est refusé", () => {
  assert.strictEqual(contexte.issue?.success, false)
})
