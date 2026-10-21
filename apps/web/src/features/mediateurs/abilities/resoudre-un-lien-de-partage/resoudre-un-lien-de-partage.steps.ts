import assert from 'node:assert'
import { resoudreUnLienDePartage } from '@app/web/features/mediateurs/abilities/resoudre-un-lien-de-partage'
import { compteSeme } from '@app/web/features/mediateurs/mediateurs.cucumber'
import { Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

type Issue = Awaited<ReturnType<typeof resoudreUnLienDePartage>>

const derniere: { resolution?: Issue } = {}

const ouvrir = async (lien: string | undefined) => {
  if (lien === undefined) throw new Error('Aucun partage semé pour ce rôle')
  derniere.resolution = await resoudreUnLienDePartage(lien)
}

When('un internaute ouvre le lien de ce partage', async () => {
  const [lien] = Object.values(compteSeme().partages)
  await ouvrir(lien)
})

When('un internaute ouvre le lien du partage du médiateur', async () => {
  await ouvrir(compteSeme().partages.mediateur)
})

When('un internaute ouvre le lien du partage du coordinateur', async () => {
  await ouvrir(compteSeme().partages.coordinateur)
})

When('un internaute ouvre un lien de partage inconnu', async () => {
  await ouvrir(v4())
})

When('un internaute ouvre un lien de partage malformé', async () => {
  await ouvrir('pas-un-identifiant')
})

Then('le lien désigne le médiateur de ce compte', () => {
  const { userId, mediateurId } = compteSeme()
  assert.deepStrictEqual(derniere.resolution, {
    success: true,
    data: {
      proprietaire: { _tag: 'Mediateur', mediateurId },
      utilisateurId: userId,
    },
  })
})

Then('le lien désigne le coordinateur de ce compte', () => {
  const { userId, coordinateurId } = compteSeme()
  assert.deepStrictEqual(derniere.resolution, {
    success: true,
    data: {
      proprietaire: { _tag: 'Coordinateur', coordinateurId },
      utilisateurId: userId,
    },
  })
})

Then('le lien est introuvable', () => {
  assert.deepStrictEqual(derniere.resolution, {
    success: false,
    error: { _tag: 'LienIntrouvable' },
  })
})
