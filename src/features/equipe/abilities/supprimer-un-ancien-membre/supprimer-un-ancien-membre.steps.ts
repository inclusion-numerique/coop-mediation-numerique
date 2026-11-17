import assert from 'node:assert'
import { supprimerUnAncienMembre } from '@app/web/features/equipe/abilities/supprimer-un-ancien-membre'
import {
  CoordinateurId,
  MediateurId,
  UtilisateurId,
} from '@app/web/features/equipe/domain'
import {
  adhesionsDe,
  type CoordinateurSeme,
  type MediateurSeme,
  semerUnCoordinateur,
  semerUneAdhesion,
  semerUnMediateurDEquipe,
} from '@app/web/features/equipe/equipe.cucumber'
import { Given, Then, When } from '@cucumber/cucumber'

const contexte: {
  coordinateur?: CoordinateurSeme
  mediateur?: MediateurSeme
  issue?: Awaited<ReturnType<typeof supprimerUnAncienMembre>>
} = {}

const paire = () => {
  assert.ok(contexte.coordinateur && contexte.mediateur)
  return {
    coordinateurId: contexte.coordinateur.coordinateurId,
    mediateurId: contexte.mediateur.mediateurId,
  }
}

const semer = async (adhesions: readonly boolean[]) => {
  contexte.coordinateur = await semerUnCoordinateur()
  contexte.mediateur = await semerUnMediateurDEquipe()
  await Promise.all(
    adhesions.map((archivee) => semerUneAdhesion({ ...paire(), archivee })),
  )
}

Given('un coordinateur et un ancien membre de son équipe', async () => {
  await semer([true])
})

Given('un coordinateur et un membre revenu dans son équipe', async () => {
  await semer([true, false])
})

When('le coordinateur supprime cet ancien membre des archives', async () => {
  assert.ok(contexte.coordinateur)
  contexte.issue = await supprimerUnAncienMembre({
    mediateurId: MediateurId(paire().mediateurId),
    coordinateurId: CoordinateurId(paire().coordinateurId),
    gestionnaire: {
      type: 'Coordinateur',
      coordinateurId: CoordinateurId(contexte.coordinateur.coordinateurId),
    },
    auteurId: UtilisateurId(contexte.coordinateur.userId),
  })
})

Then('la suppression réussit', () => {
  assert.strictEqual(contexte.issue?.success, true)
})

Then('la suppression est refusée', () => {
  assert.strictEqual(contexte.issue?.success, false)
})

Then("cet ancien membre n'apparaît plus dans l'équipe", async () => {
  assert.strictEqual((await adhesionsDe(paire())).length, 0)
})

Then("ce membre est toujours actif dans l'équipe", async () => {
  const adhesions = await adhesionsDe(paire())
  assert.strictEqual(adhesions.length, 2)
  assert.ok(adhesions.some(({ suppression }) => suppression === null))
})
