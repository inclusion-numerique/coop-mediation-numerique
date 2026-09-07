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
import {
  Service,
  Typologie,
  Url,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { depuisLaSaisie } from './action/depuis-la-saisie'
import { InformationsGeneralesSaisie } from './action/modifier-la-fiche-du-lieu.validation'
import { informationsGeneralesSoumises } from './ui/informations-generales-soumises'

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

/**
 * L'adresse telle que la Base Adresse Nationale l'a reconnue — celle de
 * l'établissement de l'Annuaire y est géocodée au moment de le choisir, comme
 * celle qu'un utilisateur cherche lui-même.
 */
const adresseBan = {
  id: '51454_7160_00012',
  label: '12 rue de la Paix, 51100 Reims',
  nom: '12 rue de la Paix',
  commune: 'Reims',
  codePostal: '51100',
  codeInsee: '51454',
  contexte: '51, Marne, Grand Est',
  latitude: 49.25,
  longitude: 4.03,
}

const ETABLISSEMENT = {
  nom: 'MAISON FRANCE SERVICES',
  adresse: '12 rue de la Paix',
  codePostal: '51100',
  commune: 'Reims',
  codeInsee: '51454',
  siret: '13002603200016',
  source: 'api' as const,
}

/** Le chemin complet du formulaire : ce qu'il porte, ce qu'il soumet, ce qui s'écrit. */
const enregistrerLesInformationsGenerales = async (
  valeurs: Parameters<typeof informationsGeneralesSoumises>[0],
) =>
  modifierLaFicheDuLieu({
    id: LieuId(ficheSemee().lieuId),
    par: auteur(),
    modification: depuisLaSaisie(
      InformationsGeneralesSaisie.parse(informationsGeneralesSoumises(valeurs)),
    ),
  })

Given('une fiche de lieu immatriculée', async () => {
  await semerUneFicheDeLieu()

  await prismaClient.lieuInclusion.update({
    where: { id: ficheSemee().lieuId },
    data: { siret: ETABLISSEMENT.siret, nomUsage: 'La Maison du Port' },
  })
})

When(
  "le médiateur rattaché enregistre les informations générales avec un établissement de l'Annuaire",
  async () => {
    await enregistrerLesInformationsGenerales({
      id: ficheSemee().lieuId,
      noSiret: false,
      siretSearch: ETABLISSEMENT,
      // Le nom vient de l'établissement choisi, que le formulaire recopie.
      nom: ETABLISSEMENT.nom,
      adresseBan,
      nomUsage: 'La Maison du Port',
      rna: null,
      lieuItinerant: null,
      complementAdresse: null,
      typologies: [Typologie.TIERS_LIEUX],
    })
  },
)

When(
  "le médiateur rattaché enregistre les informations générales en déclarant l'absence de SIRET",
  async () => {
    await enregistrerLesInformationsGenerales({
      id: ficheSemee().lieuId,
      noSiret: true,
      siretSearch: null,
      nom: 'Tiers-lieu du Port',
      adresseBan,
      nomUsage: 'La Maison du Port',
      rna: null,
      lieuItinerant: null,
      complementAdresse: null,
      typologies: [Typologie.TIERS_LIEUX],
    })
  },
)

Then('le lieu porte le SIRET de cet établissement', async () => {
  const { lieu } = await relire()
  assert.strictEqual(lieu.fiche.pivot, ETABLISSEMENT.siret)
})

Then("le lieu porte le nom d'usage saisi", async () => {
  const { lieu } = await relire()
  assert.strictEqual(lieu.identiteSirene.nomUsage, 'La Maison du Port')
})

Then("le lieu n'a plus d'immatriculation", async () => {
  const { lieu } = await relire()
  assert.strictEqual(lieu.fiche.pivot, null)
})

Then("le lieu n'a plus de nom d'usage", async () => {
  const { lieu } = await relire()
  assert.strictEqual(lieu.identiteSirene.nomUsage, null)
})

Then('le nom du lieu est celui qui a été saisi', async () => {
  const { lieu } = await relire()
  assert.strictEqual(lieu.fiche.nom, 'Tiers-lieu du Port')
})

const derniere: { issue?: Awaited<ReturnType<typeof modifierLaFicheDuLieu>> } =
  {}

Given('une fiche de lieu sans service', async () => {
  await semerUneFicheDeLieu()

  await prismaClient.lieuInclusion.update({
    where: { id: ficheSemee().lieuId },
    data: { services: [] },
  })
})

Given('une fiche de lieu visible sur la cartographie', async () => {
  await semerUneFicheDeLieu()

  await prismaClient.lieuInclusion.update({
    where: { id: ficheSemee().lieuId },
    data: { visiblePourCartographieNationale: true },
  })
})

When(
  'le médiateur rattaché rend le lieu visible sur la cartographie',
  async () => {
    derniere.issue = await modifierLaFicheDuLieu({
      id: LieuId(ficheSemee().lieuId),
      par: auteur(),
      modification: depuisLaSaisie({
        section: 'VisibiliteCartographie',
        visiblePourCartographieNationale: true,
      }),
    })
  },
)

When('le médiateur rattaché retire tous les services', async () => {
  derniere.issue = await modifierLaFicheDuLieu({
    id: LieuId(ficheSemee().lieuId),
    par: auteur(),
    modification: depuisLaSaisie({
      section: 'ServicesEtAccompagnement',
      services: [],
      modalitesAccompagnement: [],
    }),
  })
})

Then('le lieu est visible sur la cartographie', async () => {
  const { lieu } = await relire()
  assert.strictEqual(lieu.visibilite, 'Publie')
})

Then("le lieu n'est pas visible sur la cartographie", async () => {
  const { lieu } = await relire()
  assert.strictEqual(lieu.visibilite, 'NonPublie')
})

Then('la modification est refusée', () => {
  assert.strictEqual(derniere.issue?.success, false)
})

Then('le lieu annonce toujours son service', async () => {
  const { lieu } = await relire()
  assert.deepStrictEqual(lieu.fiche.services, [
    Service.AideAuxDemarchesAdministratives,
  ])
})
