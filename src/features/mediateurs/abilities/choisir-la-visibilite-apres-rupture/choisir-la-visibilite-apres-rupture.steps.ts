import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { prismaClient } from '@/configuration/prisma'
import { ReponseApresRupture } from '@/features/mediateurs/abilities/choisir-la-visibilite-apres-rupture/domain'
import { choisirLaVisibiliteApresRupture } from '@/features/mediateurs/abilities/choisir-la-visibilite-apres-rupture/domain/choisir-la-visibilite-apres-rupture'
import { enregistrerLeChoix } from '@/features/mediateurs/abilities/choisir-la-visibilite-apres-rupture/implementations/prisma/enregistrer-le-choix.mutation'
import { AuteurId, MediateurId } from '@/features/mediateurs/domain'
import { lireMediateurEtContrats } from '@/features/mediateurs/implementations/prisma/mediateur-et-contrats.query'
import { exConseillerSeme } from '@/features/mediateurs/mediateurs.cucumber'

type Issue = Awaited<
  ReturnType<ReturnType<typeof choisirLaVisibiliteApresRupture>>
>

const derniere: { reponse?: Issue } = {}

const momentDeLaReponse = new Date('2026-10-20T09:00:00.000Z')

const repondre = async (reponse: ReponseApresRupture) => {
  const seme = exConseillerSeme()
  derniere.reponse = await choisirLaVisibiliteApresRupture({
    lireMediateurEtContrats,
    enregistrer: enregistrerLeChoix(async () => undefined),
  })({
    mediateurId: MediateurId(seme.mediateurId),
    reponse,
    auteurId: AuteurId(seme.userId),
    maintenant: momentDeLaReponse,
  })
}

const mediateurSeme = () =>
  prismaClient.mediateur.findUniqueOrThrow({
    where: { id: exConseillerSeme().mediateurId },
    select: { isVisible: true, visibiliteChoisieLe: true },
  })

Given("il a répondu qu'il souhaite apparaître", async () => {
  await repondre(ReponseApresRupture('SouhaiteApparaitre'))
})

When("il répond qu'il souhaite apparaître", async () => {
  await repondre(ReponseApresRupture('SouhaiteApparaitre'))
})

When("il répond qu'il préfère rester masqué", async () => {
  await repondre(ReponseApresRupture('PrefereResterMasque'))
})

Then('il est visible sur la cartographie', async () => {
  assert.strictEqual((await mediateurSeme()).isVisible, true)
})

Then("il n'est plus visible sur la cartographie", async () => {
  assert.strictEqual((await mediateurSeme()).isVisible, false)
})

Then('son choix de visibilité est daté de sa réponse', async () => {
  assert.strictEqual(derniere.reponse?.success, true)
  assert.deepStrictEqual(
    (await mediateurSeme()).visibiliteChoisieLe,
    momentDeLaReponse,
  )
})

Then("la réponse est refusée car aucune rupture n'est en attente", () => {
  assert.deepStrictEqual(derniere.reponse, {
    success: false,
    error: {
      _tag: 'AucuneRuptureEnAttente',
      mediateurId: exConseillerSeme().mediateurId,
    },
  })
})
