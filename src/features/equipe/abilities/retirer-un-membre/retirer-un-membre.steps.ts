import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { retirerUnMembre as retirerUnMembreAvec } from '@/features/equipe/abilities/retirer-un-membre/domain/retirer-un-membre'
import { archiverLAdhesion } from '@/features/equipe/abilities/retirer-un-membre/implementations/prisma/archiver-l-adhesion.mutation'
import {
  CoordinateurId,
  MediateurId,
  UtilisateurId,
} from '@/features/equipe/domain'
import {
  adhesionsDe,
  type CoordinateurSeme,
  type MediateurSeme,
  semerUnCoordinateur,
  semerUneAdhesion,
  semerUnMediateurDEquipe,
} from '@/features/equipe/equipe.cucumber'
import { lireLesAdhesionsDeLaPaire } from '@/features/equipe/implementations/prisma/adhesion.query'

const retirerUnMembre = retirerUnMembreAvec({
  lireLesAdhesionsDeLaPaire,
  archiverLAdhesion,
})

const contexte: {
  coordinateur?: CoordinateurSeme
  mediateur?: MediateurSeme
  issue?: Awaited<ReturnType<typeof retirerUnMembre>>
} = {}

const paire = () => {
  assert.ok(contexte.coordinateur && contexte.mediateur)
  return {
    coordinateurId: contexte.coordinateur.coordinateurId,
    mediateurId: contexte.mediateur.mediateurId,
  }
}

const retirerPar = async (auteur: CoordinateurSeme) => {
  contexte.issue = await retirerUnMembre({
    mediateurId: MediateurId(paire().mediateurId),
    coordinateurId: CoordinateurId(paire().coordinateurId),
    gestionnaire: {
      type: 'Coordinateur',
      coordinateurId: CoordinateurId(auteur.coordinateurId),
    },
    auteurId: UtilisateurId(auteur.userId),
    maintenant: new Date(),
  })
}

Given('un coordinateur et un membre de son équipe', async () => {
  contexte.coordinateur = await semerUnCoordinateur()
  contexte.mediateur = await semerUnMediateurDEquipe()
  await semerUneAdhesion(paire())
})

When('le coordinateur retire ce membre', async () => {
  assert.ok(contexte.coordinateur)
  await retirerPar(contexte.coordinateur)
})

When("le coordinateur d'une autre équipe retire ce membre", async () => {
  await retirerPar(await semerUnCoordinateur())
})

Then('le retrait du membre réussit', () => {
  assert.strictEqual(contexte.issue?.success, true)
})

Then('le retrait du membre est refusé', () => {
  assert.strictEqual(contexte.issue?.success, false)
})

Then('ce membre devient ancien membre', async () => {
  const [adhesion] = await adhesionsDe(paire())
  assert.ok(adhesion?.suppression)
})

Then("ce membre fait toujours partie de l'équipe", async () => {
  const [adhesion] = await adhesionsDe(paire())
  assert.strictEqual(adhesion?.suppression, null)
})
