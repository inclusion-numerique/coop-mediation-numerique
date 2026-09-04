import assert from 'node:assert'
import {
  type LieuActiviteTrouve,
  rechercherUnLieuActivite,
} from '@app/web/features/lieux-activite/abilities/rechercher-un-lieu-activite'
import { MediateurId } from '@app/web/features/lieux-activite/domain/mediateur-id'
import { ficheSemee } from '@app/web/features/lieux-activite/lieux-activite.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Then, When } from '@cucumber/cucumber'

const resultats: { trouves?: readonly LieuActiviteTrouve[] } = {}

const chercher = (mediateurId: string, recherche: string) =>
  rechercherUnLieuActivite({
    mediateurId: MediateurId(mediateurId),
    recherche,
  })

When('ce médiateur cherche « Maison »', async () => {
  resultats.trouves = await chercher(ficheSemee().mediateurRattacheId, 'Maison')
})

When('ce médiateur cherche « Piscine »', async () => {
  resultats.trouves = await chercher(
    ficheSemee().mediateurRattacheId,
    'Piscine',
  )
})

When('ce médiateur se retire de ce lieu puis cherche « Maison »', async () => {
  await prismaClient.mediateurEnActivite.updateMany({
    where: {
      mediateurId: ficheSemee().mediateurRattacheId,
      structureId: ficheSemee().lieuId,
    },
    data: { fin: new Date() },
  })

  resultats.trouves = await chercher(ficheSemee().mediateurRattacheId, 'Maison')
})

Then('la recherche propose ce lieu', () => {
  assert.deepStrictEqual(
    resultats.trouves?.map(({ id }) => id),
    [ficheSemee().lieuId],
  )
})

Then('la recherche ne propose rien', () => {
  assert.deepStrictEqual(resultats.trouves, [])
})

Then(
  'un médiateur étranger qui cherche « Maison » ne trouve rien',
  async () => {
    assert.deepStrictEqual(
      await chercher(ficheSemee().mediateurEtrangerId, 'Maison'),
      [],
    )
  },
)
