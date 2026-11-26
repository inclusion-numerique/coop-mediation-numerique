import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { quitterUneEquipe as quitterUneEquipeAvec } from '@/features/equipe/abilities/quitter-une-equipe/domain/quitter-une-equipe'
import { enregistrerLeDepart } from '@/features/equipe/abilities/quitter-une-equipe/implementations/prisma/enregistrer-le-depart.mutation'
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

const quitterUneEquipe = quitterUneEquipeAvec({
  lireLesAdhesionsDeLaPaire,
  enregistrerLeDepart,
})

const contexte: {
  coordinateur?: CoordinateurSeme
  mediateur?: MediateurSeme
  issue?: Awaited<ReturnType<typeof quitterUneEquipe>>
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

Given("un médiateur membre d'une équipe", async () => {
  await semer([false])
})

Given(
  "un médiateur revenu dans une équipe qu'il avait déjà quittée",
  async () => {
    await semer([true, false])
  },
)

Given('un médiateur qui a déjà quitté une équipe', async () => {
  await semer([true])
})

When("ce médiateur quitte l'équipe", async () => {
  assert.ok(contexte.mediateur)
  contexte.issue = await quitterUneEquipe({
    mediateurId: MediateurId(paire().mediateurId),
    coordinateurId: CoordinateurId(paire().coordinateurId),
    auteurId: UtilisateurId(contexte.mediateur.userId),
    maintenant: new Date(),
  })
})

Then('le départ réussit', () => {
  assert.strictEqual(contexte.issue?.success, true)
})

Then('le départ est refusé', () => {
  assert.strictEqual(contexte.issue?.success, false)
})

Then('son adhésion est archivée', async () => {
  const [adhesion] = await adhesionsDe(paire())
  assert.ok(adhesion?.suppression)
})

Then("il n'a plus aucune adhésion active à cette équipe", async () => {
  const adhesions = await adhesionsDe(paire())
  assert.ok(adhesions.every(({ suppression }) => suppression !== null))
})

Then('son ancienne adhésion garde sa date de départ', async () => {
  const adhesions = await adhesionsDe(paire())
  assert.ok(
    adhesions.some(
      ({ suppression }) =>
        suppression?.getTime() === new Date('2026-01-01').getTime(),
    ),
  )
})
