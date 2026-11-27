import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { prismaClient } from '@/configuration/prisma'
import { reglerLaVisibiliteCarto } from '@/features/mediateurs/abilities/regler-la-visibilite-carto/domain/regler-la-visibilite-carto'
import { enregistrerLaVisibilite } from '@/features/mediateurs/abilities/regler-la-visibilite-carto/implementations/prisma/enregistrer-la-visibilite.mutation'
import { lireLeMediateurARegler } from '@/features/mediateurs/abilities/regler-la-visibilite-carto/implementations/prisma/mediateur-a-regler.query'
import { AuteurId, MediateurId } from '@/features/mediateurs/domain'
import {
  semerUnMediateurVisible,
  visibiliteSemee,
} from '@/features/mediateurs/mediateurs.cucumber'

type Issue = Awaited<ReturnType<ReturnType<typeof reglerLaVisibiliteCarto>>>

const dernier: { reglage?: Issue } = {}

const momentDuReglage = new Date('2026-06-01T10:00:00.000Z')

const regler = async ({
  visible,
  par,
}: {
  visible: boolean
  par: 'mediateur' | 'administrateur'
}) => {
  const semee = visibiliteSemee()
  dernier.reglage = await reglerLaVisibiliteCarto({
    lireLeMediateur: lireLeMediateurARegler,
    enregistrer: enregistrerLaVisibilite(async () => undefined),
  })({
    mediateurId: MediateurId(semee.mediateurId),
    visible,
    auteurId: AuteurId(
      par === 'mediateur' ? semee.mediateurUserId : semee.administrateurUserId,
    ),
    maintenant: momentDuReglage,
  })
}

const mediateurSeme = () =>
  prismaClient.mediateur.findUniqueOrThrow({
    where: { id: visibiliteSemee().mediateurId },
    select: {
      isVisible: true,
      modification: true,
      visibiliteChoisieLe: true,
      user: { select: { updated: true } },
    },
  })

Given('un médiateur visible sur la cartographie', async () => {
  await semerUnMediateurVisible()
})

Given(
  'un administrateur a rendu ce médiateur invisible sur la cartographie',
  async () => {
    await regler({ visible: false, par: 'administrateur' })
  },
)

Given('le compte de ce médiateur est supprimé', async () => {
  await prismaClient.user.update({
    where: { id: visibiliteSemee().mediateurUserId },
    data: { deleted: new Date() },
  })
})

When('ce médiateur se rend invisible sur la cartographie', async () => {
  await regler({ visible: false, par: 'mediateur' })
})

When('ce médiateur se rend visible sur la cartographie', async () => {
  await regler({ visible: true, par: 'mediateur' })
})

When(
  'un administrateur rend ce médiateur invisible sur la cartographie',
  async () => {
    await regler({ visible: false, par: 'administrateur' })
  },
)

Then(
  "le profil de ce médiateur n'est plus visible sur la cartographie",
  async () => {
    assert.strictEqual(dernier.reglage?.success, true)
    assert.strictEqual((await mediateurSeme()).isVisible, false)
  },
)

Then('le profil de ce médiateur est visible sur la cartographie', async () => {
  assert.strictEqual((await mediateurSeme()).isVisible, true)
})

Then(
  'la date de modification de ce médiateur est celle du réglage',
  async () => {
    const { modification, user } = await mediateurSeme()
    assert.deepStrictEqual(modification, momentDuReglage)
    assert.deepStrictEqual(user.updated, momentDuReglage)
  },
)

Then('le choix de visibilité de ce médiateur est daté du réglage', async () => {
  assert.deepStrictEqual(
    (await mediateurSeme()).visibiliteChoisieLe,
    momentDuReglage,
  )
})

Then(
  'le réglage de la visibilité échoue car le médiateur est introuvable',
  () => {
    assert.deepStrictEqual(dernier.reglage, {
      success: false,
      error: {
        _tag: 'MediateurIntrouvable',
        mediateurId: visibiliteSemee().mediateurId,
      },
    })
  },
)
