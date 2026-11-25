import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { prismaClient } from '@/configuration/prisma'
import { type LieuDuMediateurEnListe } from '@/features/lieux-activite/abilities/lister-les-lieux-du-mediateur/domain/index'
import { listerLesLieuxDuMediateur } from '@/features/lieux-activite/abilities/lister-les-lieux-du-mediateur/implementations/prisma/lister-les-lieux-du-mediateur.query'
import { MediateurId } from '@/features/lieux-activite/domain/identifiants/mediateur-id'
import { ficheSemee } from '@/features/lieux-activite/lieux-activite.cucumber'
import { triDesLieuxLu } from '@/features/lieux-activite/ui/filtres/tri-des-lieux.filtre'

const liste: { lieux?: readonly LieuDuMediateurEnListe[] } = {}

const lister = async (mediateurId: string, tri?: string) => {
  liste.lieux = await listerLesLieuxDuMediateur({
    mediateurId: MediateurId(mediateurId),
    tri: triDesLieuxLu.charger({ tri }).tri,
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

Then('ce lieu est signalé avec une adresse à préciser', () => {
  assert.deepStrictEqual(
    liste.lieux?.map(({ lieuInclusion }) => lieuInclusion.adresseAPreciser),
    [true],
  )
})

Then("ce lieu n'est pas signalé avec une adresse à préciser", () => {
  assert.deepStrictEqual(
    liste.lieux?.map(({ lieuInclusion }) => lieuInclusion.adresseAPreciser),
    [false],
  )
})

Then('la liste est vide', () => {
  assert.deepStrictEqual(liste.lieux, [])
})

const IDENTIFIANT_DU_REGISTRE =
  'Coop-numérique_du-registre__France-Services_9999'

Given(
  'le registre donne à ce lieu un identifiant de cartographie',
  async () => {
    await prismaClient.lieuInclusionRegistreMain.create({
      data: {
        nom: 'Maison France Services de Reims',
        structureCoopId: ficheSemee().lieuId,
        structureCartographieNationaleId: IDENTIFIANT_DU_REGISTRE,
        source: 'dora',
        editedBy: 'carto',
        updatedAtCarto: new Date('2026-01-01'),
      },
      select: { id: true },
    })
  },
)

Then("le lieu listé porte l'identifiant du registre", () => {
  assert.deepStrictEqual(
    liste.lieux?.map(
      ({ lieuInclusion }) => lieuInclusion.identifiantCartographie,
    ),
    [IDENTIFIANT_DU_REGISTRE],
  )
})
