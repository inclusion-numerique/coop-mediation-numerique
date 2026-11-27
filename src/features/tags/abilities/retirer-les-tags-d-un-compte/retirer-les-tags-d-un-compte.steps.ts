import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { prismaClient } from '@/configuration/prisma'
import { CoordinateurId, MediateurId, type Role } from '@/features/tags/domain'
import {
  semerUnCoordinateur,
  semerUneActiviteTaguee,
  semerUnMediateur,
  semerUnTag,
  tagEnBase,
  tagsDeLActivite,
} from '@/features/tags/tags.cucumber'
import { type BilanDuRetrait, bilanDuRetrait } from './domain'
import { retirerLesTagsDUnCompte } from './domain/retirer-les-tags-d-un-compte'
import { appliquerLeRetraitDesTags } from './implementations/prisma/retirer-les-tags-d-un-compte.mutation'
import {
  lireLesTagsDetenus,
  lireLesTagsDuCompte,
} from './implementations/prisma/tags-du-compte.query'

const retirerEnBase = retirerLesTagsDUnCompte({
  lireLesTagsDuCompte,
  lireLesTagsDetenus,
  appliquerLeRetrait: appliquerLeRetraitDesTags,
})

const retirer = async (compte: Role): Promise<BilanDuRetrait> => {
  const retrait = await retirerEnBase({ compte, maintenant: new Date() })
  return bilanDuRetrait(retrait.data)
}

const contexte: {
  mediateurId?: string
  coordinateurId?: string
  tagId?: string
  utilisateurs: readonly { mediateurId: string; activiteId: string }[]
  activiteId?: string
  bilan?: BilanDuRetrait
} = { utilisateurs: [] }

const valeur = <T>(valeur: T | undefined): T => {
  assert.ok(valeur)
  return valeur
}

const semerLeTagDuCoordinateur = async (nombreUtilisateurs: number) => {
  const { coordinateurId } = await semerUnCoordinateur()
  contexte.coordinateurId = coordinateurId
  contexte.tagId = await semerUnTag({ coordinateurId })
  contexte.utilisateurs = await Promise.all(
    Array.from({ length: nombreUtilisateurs }, async () => {
      const { mediateurId } = await semerUnMediateur()
      const activiteId = await semerUneActiviteTaguee({
        mediateurId,
        tagIds: [valeur(contexte.tagId)],
      })
      return { mediateurId, activiteId }
    }),
  )
}

Given(
  'un coordinateur partant dont le tag est utilisé par {int} médiateurs',
  semerLeTagDuCoordinateur,
)

Given(
  'un coordinateur partant dont le tag est utilisé par {int} médiateur',
  semerLeTagDuCoordinateur,
)

Given(
  'un médiateur partant qui a utilisé son tag dans une activité',
  async () => {
    const { mediateurId } = await semerUnMediateur()
    contexte.mediateurId = mediateurId
    contexte.tagId = await semerUnTag({ mediateurId })
    contexte.activiteId = await semerUneActiviteTaguee({
      mediateurId,
      tagIds: [contexte.tagId],
    })
  },
)

When('on retire les tags de ce coordinateur', async () => {
  contexte.bilan = await retirer({
    _tag: 'Coordinateur',
    coordinateurId: CoordinateurId(valeur(contexte.coordinateurId)),
  })
})

When('on retire les tags de ce médiateur', async () => {
  contexte.bilan = await retirer({
    _tag: 'Mediateur',
    mediateurId: MediateurId(valeur(contexte.mediateurId)),
  })
})

const copiesEssaimees = (attendu: number) => {
  assert.strictEqual(contexte.bilan?.transferes, attendu)
}

Then('{int} copies du tag du coordinateur sont essaimées', copiesEssaimees)

Then('{int} copie du tag du coordinateur est essaimée', copiesEssaimees)

Then('chaque médiateur utilisateur possède sa copie du tag', async () => {
  const mediateurIds = contexte.utilisateurs.map(
    ({ mediateurId }) => mediateurId,
  )
  assert.strictEqual(
    await prismaClient.tag.count({
      where: { mediateurId: { in: mediateurIds }, suppression: null },
    }),
    mediateurIds.length,
  )
})

Then('les activités de chaque médiateur portent sa copie du tag', async () => {
  await Promise.all(
    contexte.utilisateurs.map(async ({ mediateurId, activiteId }) => {
      const [tagId] = await tagsDeLActivite(activiteId)
      const tag = await tagEnBase(valeur(tagId))
      assert.strictEqual(tag?.mediateurId, mediateurId)
    }),
  )
})

Then('le tag du coordinateur partant est marqué supprimé', async () => {
  assert.ok((await tagEnBase(valeur(contexte.tagId)))?.suppression)
})

Then('le tag du médiateur partant est marqué supprimé', async () => {
  assert.ok((await tagEnBase(valeur(contexte.tagId)))?.suppression)
})

Then('son activité porte toujours ce tag', async () => {
  assert.deepStrictEqual(await tagsDeLActivite(valeur(contexte.activiteId)), [
    contexte.tagId,
  ])
})
