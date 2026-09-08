import assert from 'node:assert'
import {
  listerMesLieuxActivite,
  type MonLieuActivite,
} from '@app/web/features/lieux-activite/abilities/lister-mes-lieux-activite'
import { MediateurId } from '@app/web/features/lieux-activite/domain/mediateur-id'
import { TriDesLieux } from '@app/web/features/lieux-activite/domain/tri-des-lieux'
import { ficheSemee } from '@app/web/features/lieux-activite/lieux-activite.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'

const liste: { lieux?: readonly MonLieuActivite[] } = {}

const lister = async (mediateurId: string, tri?: string) => {
  liste.lieux = await listerMesLieuxActivite({
    mediateurId: MediateurId(mediateurId),
    tri: TriDesLieux(tri),
  })
}

When("ce médiateur liste ses lieux d'activité", async () => {
  await lister(ficheSemee().mediateurRattacheId)
})

When("un médiateur étranger liste ses lieux d'activité", async () => {
  await lister(ficheSemee().mediateurEtrangerId)
})

When('ce médiateur liste ses lieux avec le tri « au hasard »', async () => {
  await lister(ficheSemee().mediateurRattacheId, 'au hasard')
})

When(
  "ce médiateur quitte ce lieu puis liste ses lieux d'activité",
  async () => {
    await prismaClient.mediateurEnActivite.updateMany({
      where: {
        mediateurId: ficheSemee().mediateurRattacheId,
        structureId: ficheSemee().lieuId,
      },
      data: { fin: new Date() },
    })

    await lister(ficheSemee().mediateurRattacheId)
  },
)

Then('la liste contient ce lieu', () => {
  assert.deepStrictEqual(
    liste.lieux?.map(({ lieuInclusion }) => lieuInclusion.id),
    [ficheSemee().lieuId],
  )
})

Then('la liste est vide', () => {
  assert.deepStrictEqual(liste.lieux, [])
})

const IDENTIFIANT_DU_REGISTRE =
  'Coop-numérique_du-registre__France-Services_9999'

Given(
  'le registre donne à ce lieu un autre identifiant de cartographie que la coop',
  async () => {
    // La coop porte le sien, périmé : c'est précisément la situation qu'on veut
    // voir trancher en faveur du registre.
    await prismaClient.lieuInclusion.update({
      where: { id: ficheSemee().lieuId },
      data: { structureCartographieNationaleId: 'Coop-numérique_perime' },
    })

    await prismaClient.lieuInclusionRegistreMain.create({
      data: {
        nom: 'Maison France Services de Reims',
        structureCoopId: ficheSemee().lieuId,
        structureCartographieNationaleId: IDENTIFIANT_DU_REGISTRE,
        source: 'dora',
        editedBy: 'carto',
        updatedAtCarto: new Date('2026-01-01'),
      },
    })
  },
)

Then("le lieu listé porte l'identifiant du registre", () => {
  assert.deepStrictEqual(
    liste.lieux?.map(
      ({ lieuInclusion }) => lieuInclusion.structureCartographieNationaleId,
    ),
    [IDENTIFIANT_DU_REGISTRE],
  )
})
