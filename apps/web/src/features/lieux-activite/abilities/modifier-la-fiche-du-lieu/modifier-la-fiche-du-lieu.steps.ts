import assert from 'node:assert'
import {
  consulterLaFicheDuLieu,
  modifierLaFicheDuLieu,
} from '@app/web/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/implementation'
import { LieuId } from '@app/web/features/lieux-activite/domain/lieu-id'
import { UserId } from '@app/web/features/lieux-activite/domain/user-id'
import {
  ficheSemee,
  semerUneFicheDeLieu,
} from '@app/web/features/lieux-activite/lieux-activite.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { Url } from '@gouvfr-anct/lieux-de-mediation-numerique'

const auteur = () => UserId(ficheSemee().userIds[0] ?? '')

const relire = async () => {
  const fiche = await consulterLaFicheDuLieu(LieuId(ficheSemee().lieuId))
  assert.ok(fiche, 'La fiche devrait être lisible')
  return fiche
}

Given(
  'une fiche de lieu avec un site web, un téléphone et un courriel',
  async () => {
    await semerUneFicheDeLieu()
  },
)

When(
  'le médiateur rattaché enregistre les informations pratiques avec un nouveau site web',
  async () => {
    await modifierLaFicheDuLieu({
      id: LieuId(ficheSemee().lieuId),
      par: auteur(),
      modification: {
        section: 'InformationsPratiques',
        sitesWeb: [Url('https://nouveau.exemple-reims.fr')],
        ficheAccesLibre: null,
        priseRdv: null,
        horaires: null,
      },
    })
  },
)

When(
  'le médiateur rattaché enregistre les informations pratiques sans site web',
  async () => {
    await modifierLaFicheDuLieu({
      id: LieuId(ficheSemee().lieuId),
      par: auteur(),
      modification: {
        section: 'InformationsPratiques',
        sitesWeb: [],
        ficheAccesLibre: null,
        priseRdv: null,
        horaires: null,
      },
    })
  },
)

When(
  "le médiateur rattaché enregistre les modalités d'accès sans téléphone",
  async () => {
    await modifierLaFicheDuLieu({
      id: LieuId(ficheSemee().lieuId),
      par: auteur(),
      modification: {
        section: 'ModalitesAccesAuService',
        modalitesAcces: [],
        telephone: null,
        courriels: [],
        fraisACharge: [],
      },
    })
  },
)

When('un médiateur étranger au lieu enregistre la description', async () => {
  await modifierLaFicheDuLieu({
    id: LieuId(ficheSemee().lieuId),
    par: UserId(ficheSemee().userIds[1] ?? ''),
    modification: {
      section: 'Description',
      presentation: { resume: 'Une présentation du lieu' },
      formationsLabels: [],
    },
  })
})

When('ce lieu est supprimé', async () => {
  await prismaClient.lieuInclusion.update({
    where: { id: ficheSemee().lieuId },
    data: { suppression: new Date() },
  })
})

Then('le site web du lieu est le nouveau', async () => {
  const { lieu } = await relire()
  assert.deepStrictEqual(lieu.fiche.contact.site_web, [
    'https://nouveau.exemple-reims.fr',
  ])
})

Then('le téléphone et le courriel du lieu sont inchangés', async () => {
  const { lieu } = await relire()
  assert.strictEqual(lieu.fiche.contact.telephone, '+33180059880')
  assert.deepStrictEqual(lieu.fiche.contact.courriels, [
    'contact@exemple-reims.fr',
  ])
})

Then('le site web du lieu est inchangé', async () => {
  const { lieu } = await relire()
  assert.deepStrictEqual(lieu.fiche.contact.site_web, [
    'https://www.exemple-reims.fr',
  ])
})

Then("le lieu n'a plus de site web", async () => {
  const { lieu } = await relire()
  assert.strictEqual(lieu.fiche.contact.site_web, undefined)
})

Then('le lieu propose toujours la prise de rendez-vous en ligne', async () => {
  const { lieu } = await relire()
  assert.deepStrictEqual(lieu.fiche.modalitesAcces, ['Prendre un RDV en ligne'])
})

Then('la description du lieu est enregistrée', async () => {
  const { lieu } = await relire()
  assert.strictEqual(
    lieu.fiche.presentation?.resume,
    'Une présentation du lieu',
  )
})

Then('la fiche du lieu est introuvable', async () => {
  assert.strictEqual(
    await consulterLaFicheDuLieu(LieuId(ficheSemee().lieuId)),
    null,
  )
})
