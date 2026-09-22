import assert from 'node:assert'
import {
  deposerLeReleve,
  lireLesLieux,
  mentionsDuLieu,
  type Releve,
  reprendreLesDonneesDesLieux,
  reprendreLesHoraires,
  reprendreLesSitesWeb,
  reprendreLeTelephone,
  repriseDesHoraires,
  repriseDesSitesWeb,
  repriseDuTelephone,
  sansDepot,
  sansRepriseDesHoraires,
  sansRepriseDesSitesWeb,
  sansRepriseDuTelephone,
  sansTri,
  triDesListes,
  trierLesListes,
} from '@app/web/features/lieux-activite/abilities/reprendre-les-donnees-des-lieux'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'
import type { Service, ServiceMain } from '@prisma/client'
import { v4 } from 'uuid'

const SERVICES_DESORDONNES: readonly Service[] = [
  'MaitriseDesOutilsNumeriquesDuQuotidien',
  'AideAuxDemarchesAdministratives',
]

const SERVICES_TRIES: readonly Service[] = [
  'AideAuxDemarchesAdministratives',
  'MaitriseDesOutilsNumeriquesDuQuotidien',
]

const SERVICES_DESORDONNES_AU_REGISTRE: readonly ServiceMain[] = [
  'MaitriseDesOutilsNumeriquesDuQuotidien',
  'AideAuxDemarchesAdministratives',
]

const HORAIRES_A_CORRIGER = 'We 09:00-12:00 Mercredis semaines paires'

const HORAIRES_CORRIGES = 'We 09:00-12:00 "Mercredis semaines paires"'

const HORAIRES_SANS_CRENEAU = '"Sur rendez-vous uniquement"'

const DESCRIPTION_EXISTANTE = 'Un espace ouvert à toutes et tous.'

const CRENEAUX_ILLISIBLES = 'We-Fr 09:00-14:00-19:00; Mo,Tu 09:00-12:30'

const SITE_WEB_VALIDE = 'https://www.exemple-reims.fr'

const SITE_WEB_SANS_DOMAINE = 'https://www.'

const semis: { lieuId?: string; modification?: Date; releve?: Releve } = {}

const lieuSeme = (): string => {
  if (semis.lieuId == null) throw new Error('Aucun lieu semé')

  return semis.lieuId
}

const releve = (): Releve => {
  if (semis.releve == null) throw new Error('Aucune passe menée')

  return semis.releve
}

const semerUnLieu = async (champs: {
  readonly services?: readonly Service[]
  readonly horaires?: string
  readonly description?: string
  readonly telephone?: string
  readonly siteWeb?: readonly string[]
}): Promise<void> => {
  const lieu = await prismaClient.lieuInclusion.create({
    data: {
      nom: `Lieu à reprendre ${v4()}`,
      adresse: '12 quai du Port',
      commune: 'Rochefort',
      codePostal: '17300',
      services: [...(champs.services ?? SERVICES_TRIES)],
      horaires: champs.horaires ?? null,
      presentationDetail: champs.description ?? null,
      telephone: champs.telephone ?? null,
      siteWeb: [...(champs.siteWeb ?? [])],
    },
    select: { id: true, modification: true },
  })

  semis.lieuId = lieu.id
  semis.modification = lieu.modification
}

const lireLesLieuxDuScenario = async () =>
  (await lireLesLieux()).filter(({ id }) => id === lieuSeme())

const servicesDuLieu = async (): Promise<readonly string[]> =>
  (
    await prismaClient.lieuInclusion.findUniqueOrThrow({
      where: { id: lieuSeme() },
      select: { services: true },
    })
  ).services

const horairesDuLieu = async (): Promise<string | null> =>
  (
    await prismaClient.lieuInclusion.findUniqueOrThrow({
      where: { id: lieuSeme() },
      select: { horaires: true },
    })
  ).horaires

const horairesDuRegistre = async (): Promise<string | null> =>
  (
    await prismaClient.lieuInclusionRegistreMain.findFirstOrThrow({
      where: { structureCoopId: lieuSeme() },
      select: { horaires: true },
    })
  ).horaires

const servicesDuRegistre = async (): Promise<readonly string[]> =>
  (
    await prismaClient.lieuInclusionRegistreMain.findFirstOrThrow({
      where: { structureCoopId: lieuSeme() },
      select: { services: true },
    })
  ).services

const auReleve = () =>
  releve().lieux.find(({ lieuId }) => lieuId === lieuSeme())

const mentions = () => {
  const lieu = auReleve()

  return lieu == null ? [] : mentionsDuLieu(lieu)
}

const celluleDe = (colonne: string): string | undefined =>
  mentions().find((mention) => mention.colonne === colonne)?.cellule

Given('un lieu dont les services sont désordonnés', async () => {
  await semerUnLieu({ services: SERVICES_DESORDONNES })
})

Given('un lieu dont les listes sont en ordre', async () => {
  await semerUnLieu({})
})

Given(
  'un lieu dont les horaires portent un commentaire non guillemeté',
  async () => {
    await semerUnLieu({ horaires: HORAIRES_A_CORRIGER })
  },
)

Given('un lieu dont les horaires ne portent aucun créneau', async () => {
  await semerUnLieu({ horaires: HORAIRES_SANS_CRENEAU })
})

Given('un lieu dont le téléphone est noté à la française', async () => {
  await semerUnLieu({ telephone: '04 50 31 46 95' })
})

Given('un lieu dont un site web n’a pas de domaine', async () => {
  await semerUnLieu({ siteWeb: [SITE_WEB_VALIDE, SITE_WEB_SANS_DOMAINE] })
})

Given('un lieu dont les créneaux sont illisibles', async () => {
  await semerUnLieu({
    horaires: CRENEAUX_ILLISIBLES,
    description: DESCRIPTION_EXISTANTE,
  })
})

Given('un lieu sans créneau mais avec une description', async () => {
  await semerUnLieu({
    horaires: HORAIRES_SANS_CRENEAU,
    description: DESCRIPTION_EXISTANTE,
  })
})

Given(
  'il est inscrit au registre avec les mêmes services désordonnés',
  async () => {
    await prismaClient.lieuInclusionRegistreMain.create({
      data: {
        nom: 'Lieu à reprendre',
        structureCoopId: lieuSeme(),
        services: [...SERVICES_DESORDONNES_AU_REGISTRE],
      },
    })
  },
)

Given('il est inscrit au registre avec les mêmes horaires', async () => {
  await prismaClient.lieuInclusionRegistreMain.create({
    data: {
      nom: 'Lieu à reprendre',
      structureCoopId: lieuSeme(),
      horaires: HORAIRES_A_CORRIGER,
    },
  })
})

When('on reprend les données des lieux', async () => {
  semis.releve = (
    await reprendreLesDonneesDesLieux({
      reprises: [
        triDesListes(trierLesListes),
        repriseDesHoraires(reprendreLesHoraires),
        repriseDuTelephone(reprendreLeTelephone),
        repriseDesSitesWeb(reprendreLesSitesWeb),
      ],
      ports: {
        lireLesLieux: lireLesLieuxDuScenario,
        deposerLeReleve,
        journal: () => undefined,
      },
    })
  ).releve
})

When('on relève les données des lieux sans les reprendre', async () => {
  semis.releve = (
    await reprendreLesDonneesDesLieux({
      reprises: [
        triDesListes(sansTri),
        repriseDesHoraires(sansRepriseDesHoraires),
        repriseDuTelephone(sansRepriseDuTelephone),
        repriseDesSitesWeb(sansRepriseDesSitesWeb),
      ],
      ports: {
        lireLesLieux: lireLesLieuxDuScenario,
        deposerLeReleve: sansDepot,
        journal: () => undefined,
      },
    })
  ).releve
})

Then('le relevé compte ce lieu dans la colonne {string}', (colonne: string) => {
  assert.strictEqual(
    celluleDe(colonne),
    'à trier',
    `colonnes relevées : ${mentions()
      .map(({ colonne: relevee }) => relevee)
      .join(', ')}`,
  )
})

Then('le relevé ne retient pas ce lieu', () => {
  assert.strictEqual(auReleve(), undefined)
})

Then('le relevé annonce des horaires à corriger', () => {
  assert.strictEqual(celluleDe('horaires'), 'à corriger')
})

Then('le relevé annonce des horaires à effacer', () => {
  assert.strictEqual(celluleDe('horaires'), CRENEAUX_ILLISIBLES)
})

Then('la description du lieu n’a pas bougé', async () => {
  const { presentationDetail } =
    await prismaClient.lieuInclusion.findUniqueOrThrow({
      where: { id: lieuSeme() },
      select: { presentationDetail: true },
    })

  assert.strictEqual(presentationDetail, DESCRIPTION_EXISTANTE)
})

Then('le relevé annonce des horaires à déplacer', () => {
  assert.strictEqual(
    celluleDe('horaires'),
    'À déplacer dans le champ description',
  )
})

Then('les services du lieu sont triés', async () => {
  assert.deepStrictEqual(await servicesDuLieu(), [...SERVICES_TRIES])
})

Then('les services du lieu sont restés en l’état', async () => {
  assert.deepStrictEqual(await servicesDuLieu(), [...SERVICES_DESORDONNES])
})

Then('les services de son inscription au registre sont triés', async () => {
  assert.deepStrictEqual(await servicesDuRegistre(), [...SERVICES_TRIES])
})

Then('les horaires du lieu sont corrigés', async () => {
  assert.strictEqual(await horairesDuLieu(), HORAIRES_CORRIGES)
})

Then('les horaires du lieu sont restés en l’état', async () => {
  assert.strictEqual(await horairesDuLieu(), HORAIRES_A_CORRIGER)
})

Then('les horaires de son inscription au registre sont corrigés', async () => {
  assert.strictEqual(await horairesDuRegistre(), HORAIRES_CORRIGES)
})

Then('les horaires du lieu sont effacés', async () => {
  assert.strictEqual(await horairesDuLieu(), null)
})

Then('la note passe dans la description du lieu', async () => {
  const { presentationDetail } =
    await prismaClient.lieuInclusion.findUniqueOrThrow({
      where: { id: lieuSeme() },
      select: { presentationDetail: true },
    })

  assert.strictEqual(presentationDetail, 'Sur rendez-vous uniquement')
})

Then('la note rejoint la description déjà écrite', async () => {
  const { presentationDetail } =
    await prismaClient.lieuInclusion.findUniqueOrThrow({
      where: { id: lieuSeme() },
      select: { presentationDetail: true },
    })

  assert.strictEqual(
    presentationDetail,
    `${DESCRIPTION_EXISTANTE}\n\nSur rendez-vous uniquement`,
  )
})

Then('le téléphone du lieu est écrit en E.164', async () => {
  const { telephone } = await prismaClient.lieuInclusion.findUniqueOrThrow({
    where: { id: lieuSeme() },
    select: { telephone: true },
  })

  assert.strictEqual(telephone, '+33450314695')
})

Then('le relevé montre l’adresse abandonnée', () => {
  assert.strictEqual(celluleDe('siteWeb'), SITE_WEB_SANS_DOMAINE)
})

Then('le lieu garde son autre site web', async () => {
  const { siteWeb } = await prismaClient.lieuInclusion.findUniqueOrThrow({
    where: { id: lieuSeme() },
    select: { siteWeb: true },
  })

  assert.deepStrictEqual(siteWeb, [SITE_WEB_VALIDE])
})

Then('la date de modification du lieu n’a pas bougé', async () => {
  const { modification } = await prismaClient.lieuInclusion.findUniqueOrThrow({
    where: { id: lieuSeme() },
    select: { modification: true },
  })

  assert.deepStrictEqual(modification, semis.modification)
})

After(async () => {
  const lieuId = semis.lieuId

  semis.lieuId = undefined
  semis.modification = undefined
  semis.releve = undefined

  if (lieuId == null) return

  await prismaClient.lieuInclusionRegistreMain.deleteMany({
    where: { structureCoopId: lieuId },
  })
  await prismaClient.lieuInclusion.deleteMany({ where: { id: lieuId } })
})
