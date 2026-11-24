import assert from 'node:assert'
import { Then, When } from '@cucumber/cucumber'
import { prismaClient } from '@/configuration/prisma/prisma-client'
import { type LieuActiviteTrouve } from '@/features/lieux-activite/abilities/rechercher-un-lieu-activite/domain/index'
import { rechercherUnLieuActivite } from '@/features/lieux-activite/abilities/rechercher-un-lieu-activite/implementations/prisma/rechercher-un-lieu-activite.query'
import { MediateurId } from '@/features/lieux-activite/domain/identifiants/mediateur-id'
import { ficheSemee } from '@/features/lieux-activite/lieux-activite.cucumber'

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
