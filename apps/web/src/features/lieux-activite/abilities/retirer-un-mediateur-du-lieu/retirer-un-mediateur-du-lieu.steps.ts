import assert from 'node:assert'
import { retirerUnMediateurDuLieu } from '@app/web/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu'
import { LieuId } from '@app/web/features/lieux-activite/domain/lieu-id'
import { MediateurId } from '@app/web/features/lieux-activite/domain/mediateur-id'
import { UserId } from '@app/web/features/lieux-activite/domain/user-id'
import {
  ficheSemee,
  semerUneFicheDeLieu,
} from '@app/web/features/lieux-activite/lieux-activite.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'

type Issue = Awaited<ReturnType<typeof retirerUnMediateurDuLieu>>

const dernier: { retrait?: Issue } = {}

const auteur = (options: {
  mediateurId: string | null
  estCoordinateur?: boolean
}) => ({
  userId: UserId(ficheSemee().userIds[0] ?? ''),
  mediateurId:
    options.mediateurId == null ? null : MediateurId(options.mediateurId),
  estAdministrateur: false,
  estCoordinateur: options.estCoordinateur === true,
  nomAffiche: 'Une personne de la coop',
})

const retirer = async (options: {
  mediateurId: string | null
  estCoordinateur?: boolean
}) => {
  dernier.retrait = await retirerUnMediateurDuLieu({
    mediateurId: MediateurId(ficheSemee().mediateurRattacheId),
    lieuId: LieuId(ficheSemee().lieuId),
    auteur: auteur(options),
  })
}

const rattachementActif = () =>
  prismaClient.mediateurEnActivite.count({
    where: {
      mediateurId: ficheSemee().mediateurRattacheId,
      structureId: ficheSemee().lieuId,
      fin: null,
      suppression: null,
    },
  })

Given('un médiateur qui exerce dans un lieu', async () => {
  await semerUneFicheDeLieu()
})

When('ce médiateur se retire lui-même du lieu', async () => {
  await retirer({ mediateurId: ficheSemee().mediateurRattacheId })
})

When('ce médiateur se retire à nouveau du lieu', async () => {
  await retirer({ mediateurId: ficheSemee().mediateurRattacheId })
})

When('un coordinateur retire ce médiateur du lieu', async () => {
  await retirer({ mediateurId: null, estCoordinateur: true })
})

When(
  'un médiateur étranger tente de retirer ce médiateur du lieu',
  async () => {
    await retirer({ mediateurId: ficheSemee().mediateurEtrangerId })
  },
)

Then('le rattachement porte une date de fin', async () => {
  const rattachement = await prismaClient.mediateurEnActivite.findFirst({
    where: {
      mediateurId: ficheSemee().mediateurRattacheId,
      structureId: ficheSemee().lieuId,
    },
    select: { fin: true },
  })

  assert.ok(rattachement?.fin, 'La date de fin devrait être posée')
})

Then('le rattachement n’est pas supprimé', async () => {
  const rattachement = await prismaClient.mediateurEnActivite.findFirst({
    where: {
      mediateurId: ficheSemee().mediateurRattacheId,
      structureId: ficheSemee().lieuId,
    },
    select: { suppression: true },
  })

  assert.strictEqual(rattachement?.suppression, null)
})

Then('ce médiateur n’exerce plus dans ce lieu', async () => {
  assert.strictEqual(await rattachementActif(), 0)
})

Then('ce médiateur exerce toujours dans ce lieu', async () => {
  assert.strictEqual(await rattachementActif(), 1)
})

Then('le retrait est refusé', () => {
  assert.strictEqual(dernier.retrait?.success, false)
})
