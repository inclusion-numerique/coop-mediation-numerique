import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import type { DemandeurDeLExport } from '@/features/statistiques/abilities/exporter-mes-statistiques/domain/demandeur-de-l-export'
import { exporterMesStatistiques } from '@/features/statistiques/abilities/exporter-mes-statistiques/domain/exporter-mes-statistiques'
import { MediateurId } from '@/features/statistiques/domain/mediateur-id'

const LUI_MEME = MediateurId('a0000000-0000-4000-8000-000000000001')

const mediateurs: Readonly<Record<string, MediateurId>> = {
  'lui-même': LUI_MEME,
  'un médiateur coordonné': MediateurId('a0000000-0000-4000-8000-000000000002'),
  'un autre médiateur': MediateurId('a0000000-0000-4000-8000-000000000003'),
}

const MEDIATEUR: DemandeurDeLExport = {
  _tag: 'Mediateur',
  mediateurId: LUI_MEME,
}

const COORDINATEUR: DemandeurDeLExport = {
  _tag: 'Coordinateur',
  coordonnes: [MediateurId('a0000000-0000-4000-8000-000000000002')],
}

const exporter = exporterMesStatistiques({
  preparerLExport: async (perimetre: string) => `classeur ${perimetre}`,
})

const contexte: {
  demandeur?: DemandeurDeLExport | null
  resultat?: Awaited<ReturnType<typeof exporter>>
} = {}

Given('un médiateur', () => {
  contexte.demandeur = MEDIATEUR
})

Given('un coordinateur', () => {
  contexte.demandeur = COORDINATEUR
})

Given('un compte ni médiateur ni coordinateur', () => {
  contexte.demandeur = null
})

const exporterPour = async (mediateursExportes: readonly MediateurId[]) => {
  assert.ok(contexte.demandeur !== undefined, "Aucun demandeur n'a été décrit")
  contexte.resultat = await exporter({
    demandeur: contexte.demandeur,
    perimetre: contexte.demandeur === null ? null : contexte.demandeur._tag,
    mediateursExportes,
  })
}

When('il exporte les statistiques de {string}', async (qui: string) => {
  const mediateur = mediateurs[qui]
  assert.ok(mediateur, `Médiateur inconnu : ${qui}`)
  await exporterPour([mediateur])
})

When('il exporte ses statistiques', async () => {
  await exporterPour([])
})

Then("l'export est préparé", () => {
  assert.strictEqual(contexte.resultat?.success, true)
})

Then("l'export est refusé : {string}", (echec: string) => {
  assert.deepStrictEqual(contexte.resultat, {
    success: false,
    error: { _tag: echec },
  })
})
