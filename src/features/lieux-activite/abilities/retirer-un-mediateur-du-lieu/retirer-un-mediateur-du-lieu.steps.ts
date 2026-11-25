import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { prismaClient } from '@/configuration/prisma'
import { envoyerLeRetraitDuLieu } from '@/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu/implementations/email/envoyer-le-retrait-du-lieu.mutation'
import { retirerUnMediateurDuLieu } from '@/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu/implementations/prisma/retirer-un-mediateur-du-lieu.mutation'
import { LieuId } from '@/features/lieux-activite/domain/identifiants/lieu-id'
import { MediateurId } from '@/features/lieux-activite/domain/identifiants/mediateur-id'
import { UtilisateurId } from '@/features/lieux-activite/domain/identifiants/utilisateur-id'
import {
  ficheSemee,
  semerUneFicheDeLieu,
} from '@/features/lieux-activite/lieux-activite.cucumber'

type Issue = Awaited<ReturnType<ReturnType<typeof retirerUnMediateurDuLieu>>>

const dernier: { retrait?: Issue } = {}

const auteur = (options: {
  mediateurId: string | null
  coordonneLeMediateurRetire?: boolean
}) => ({
  userId: UtilisateurId(ficheSemee().userIds[0] ?? ''),
  mediateurId:
    options.mediateurId == null ? null : MediateurId(options.mediateurId),
  estAdministrateur: false,
  coordonneLeMediateurRetire: options.coordonneLeMediateurRetire === true,
  nomAffiche: 'Une personne de la coop',
})

const retirer = async (options: {
  mediateurId: string | null
  coordonneLeMediateurRetire?: boolean
}) => {
  dernier.retrait = await retirerUnMediateurDuLieu({ envoyerLeRetraitDuLieu })({
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

When('le coordinateur de son équipe retire ce médiateur du lieu', async () => {
  await retirer({ mediateurId: null, coordonneLeMediateurRetire: true })
})

When(
  'le coordinateur d’une autre équipe tente de retirer ce médiateur du lieu',
  async () => {
    await retirer({ mediateurId: null, coordonneLeMediateurRetire: false })
  },
)

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
