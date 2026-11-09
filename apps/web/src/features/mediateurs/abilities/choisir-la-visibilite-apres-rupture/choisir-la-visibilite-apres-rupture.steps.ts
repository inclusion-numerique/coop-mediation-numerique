import assert from 'node:assert'
import {
  choisirLaVisibiliteApresRupture,
  lireLaRuptureEnAttente,
} from '@app/web/features/mediateurs/abilities/choisir-la-visibilite-apres-rupture'
import { ReponseApresRupture } from '@app/web/features/mediateurs/abilities/choisir-la-visibilite-apres-rupture/domain'
import { AuteurId, MediateurId } from '@app/web/features/mediateurs/domain'
import {
  exConseillerSeme,
  semerUnContratDeLExConseiller,
  semerUnExConseiller,
} from '@app/web/features/mediateurs/mediateurs.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'

type Issue = Awaited<ReturnType<typeof choisirLaVisibiliteApresRupture>>

const derniere: { reponse?: Issue } = {}

const momentDeLaReponse = new Date('2026-10-20T09:00:00.000Z')

const date = (jour: string): Date => {
  const [j, m, a] = jour.split('/').map(Number)
  return new Date(Date.UTC(a, m - 1, j))
}

const repondre = async (reponse: ReponseApresRupture) => {
  const seme = exConseillerSeme()
  derniere.reponse = await choisirLaVisibiliteApresRupture({
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

const ruptureEnAttente = () =>
  lireLaRuptureEnAttente({
    mediateurId: MediateurId(exConseillerSeme().mediateurId),
    maintenant: momentDeLaReponse,
  })

Given(
  /^un ex-conseiller (visible|invisible) sur la cartographie, réglé le (\d{2}\/\d{2}\/\d{4})$/,
  async (visibilite: string, jour: string) => {
    await semerUnExConseiller({
      visible: visibilite === 'visible',
      reglageLe: date(jour),
    })
  },
)

Given(
  'un ex-conseiller visible sur la cartographie, sans réglage de visibilité',
  async () => {
    await semerUnExConseiller({ visible: true, reglageLe: null })
  },
)

Given(
  /^son contrat débuté le (\d{2}\/\d{2}\/\d{4}) (?:a été|sera) rompu le (\d{2}\/\d{2}\/\d{4})$/,
  async (debut: string, rupture: string) => {
    await semerUnContratDeLExConseiller({
      debut: date(debut),
      rupture: date(rupture),
    })
  },
)

Given(
  /^un nouveau contrat (?:a débuté|débutera) le (\d{2}\/\d{2}\/\d{4})$/,
  async (debut: string) => {
    await semerUnContratDeLExConseiller({ debut: date(debut), rupture: null })
  },
)

Given("il a répondu qu'il souhaite apparaître", async () => {
  await repondre(ReponseApresRupture('SouhaiteApparaitre'))
})

When("il répond qu'il souhaite apparaître", async () => {
  await repondre(ReponseApresRupture('SouhaiteApparaitre'))
})

When("il répond qu'il préfère rester masqué", async () => {
  await repondre(ReponseApresRupture('PrefereResterMasque'))
})

Then('une réponse sur sa visibilité est attendue', async () => {
  assert.notStrictEqual(await ruptureEnAttente(), null)
})

Then("aucune réponse n'est attendue", async () => {
  assert.strictEqual(await ruptureEnAttente(), null)
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
