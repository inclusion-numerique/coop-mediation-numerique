import assert from 'node:assert'
import type {
  AdresseGeocodee,
  AdresseRetrouvee,
  GeocoderLesAdresses,
  RetrouverParLesCoordonnees,
} from '@app/web/features/lieux-activite/abilities/reprendre-les-donnees-des-lieux'
import {
  deposerLeReleve,
  descendreLeResume,
  effacerLeRna,
  lireLesLieux,
  mentionsDuLieu,
  type Releve,
  reprendreLAdresse,
  reprendreLesCourriels,
  reprendreLesDonneesDesLieux,
  reprendreLesHoraires,
  reprendreLesSitesWeb,
  reprendreLeTelephone,
  repriseDeLAdresse,
  repriseDeLaPublication,
  repriseDesCourriels,
  repriseDesHoraires,
  repriseDesSitesWeb,
  repriseDuPivot,
  repriseDuResume,
  repriseDuTelephone,
  retirerLaPublication,
  sansDescenteDuResume,
  sansEffacementDuRna,
  sansRepriseDeLAdresse,
  sansRepriseDesCourriels,
  sansRepriseDesHoraires,
  sansRepriseDesSitesWeb,
  sansRepriseDuTelephone,
  sansRetraitDePublication,
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

const COURRIELS_DESORDONNES = ['zoe@exemple.fr', 'ana@exemple.fr']

const COURRIELS_RANGES = ['ana@exemple.fr', 'zoe@exemple.fr']

const TELEPHONE_DU_REGISTRE = '+33123456789'

const RNA = 'W751234567'

const RESUME_TROP_LONG = 'x'.repeat(281)

// L'adresse que la Base Adresse Nationale rend pour les lieux semés. Les
// scénarios ne sortent pas sur le réseau : le géocodeur se passe en port, et
// sans réponse conforme chaque lieu paraîtrait au relevé pour son adresse.
const ADRESSE_BAN = {
  type: 'housenumber',
  score: 0.96,
  banId: '17299_2380_00012',
  voie: '12 Quai du Port',
  commune: 'Rochefort',
  codePostal: '17300',
  codeInsee: '17299',
  latitude: 45.941_23,
  longitude: -0.960_45,
  libelle: '12 Quai du Port 17300 Rochefort',
}

const banRend: { adresse: AdresseGeocodee } = { adresse: ADRESSE_BAN }

const banRetrouve: { adresse: AdresseRetrouvee | null } = { adresse: null }

const retrouverParLesCoordonnees: RetrouverParLesCoordonnees = async (
  points,
) =>
  banRetrouve.adresse == null
    ? new Map()
    : new Map(points.map(({ lieuId }) => [lieuId, banRetrouve.adresse!]))

const geocoderLesAdresses: GeocoderLesAdresses = async (adresses) =>
  new Map(adresses.map(({ lieuId }) => [lieuId, banRend.adresse]))

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
  readonly courriels?: readonly string[]
  readonly rna?: string
  readonly resume?: string
  readonly publie?: boolean
  readonly sansService?: boolean
}): Promise<void> => {
  const lieu = await prismaClient.lieuInclusion.create({
    data: {
      nom: `Lieu à reprendre ${v4()}`,
      adresse: ADRESSE_BAN.voie,
      commune: ADRESSE_BAN.commune,
      codePostal: ADRESSE_BAN.codePostal,
      codeInsee: ADRESSE_BAN.codeInsee,
      banId: ADRESSE_BAN.banId,
      latitude: ADRESSE_BAN.latitude,
      longitude: ADRESSE_BAN.longitude,
      services:
        champs.sansService === true
          ? []
          : [...(champs.services ?? SERVICES_TRIES)],
      rna: champs.rna ?? null,
      presentationResume: champs.resume ?? null,
      visiblePourCartographieNationale: champs.publie ?? false,
      horaires: champs.horaires ?? null,
      presentationDetail: champs.description ?? null,
      telephone: champs.telephone ?? null,
      siteWeb: [...(champs.siteWeb ?? [])],
      courriels: [...(champs.courriels ?? [])],
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

Given('un lieu publié qui n’annonce aucun service', async () => {
  await semerUnLieu({ publie: true, sansService: true })
})

Given('un lieu qui porte un RNA', async () => {
  await semerUnLieu({ rna: RNA })
})

Given('un lieu dont le résumé dépasse la longueur admise', async () => {
  await semerUnLieu({ resume: RESUME_TROP_LONG })
})

Given('un lieu dont les courriels sont désordonnés', async () => {
  await semerUnLieu({ courriels: COURRIELS_DESORDONNES })
})

Given('un lieu dont un site web n’a pas de domaine', async () => {
  await semerUnLieu({ siteWeb: [SITE_WEB_VALIDE, SITE_WEB_SANS_DOMAINE] })
})

Given(
  'un lieu dont l’adresse diffère de celle de la Base Adresse Nationale',
  async () => {
    await semerUnLieu({})
    await prismaClient.lieuInclusion.update({
      where: { id: lieuSeme() },
      data: { adresse: '12 QUAI DU PORT', banId: null, latitude: null },
    })
  },
)

Given('un lieu dont la voie ne nomme aucune voie', async () => {
  await semerUnLieu({})
  await prismaClient.lieuInclusion.update({
    where: { id: lieuSeme() },
    data: { adresse: 'Le Bourg', banId: null, latitude: null },
  })
})

Then('la voie du lieu n’a pas bougé', async () => {
  const { adresse } = await prismaClient.lieuInclusion.findUniqueOrThrow({
    where: { id: lieuSeme() },
    select: { adresse: true },
  })

  assert.strictEqual(adresse, 'Le Bourg')
})

Given('la Base Adresse Nationale ne reconnaît pas la voie', () => {
  banRend.adresse = { ...ADRESSE_BAN, type: 'municipality' }
})

Given('elle retrouve une adresse au point du lieu', () => {
  banRetrouve.adresse = { ...ADRESSE_BAN, distance: 4 }
})

Given('elle retrouve une adresse trop loin du point du lieu', () => {
  banRetrouve.adresse = { ...ADRESSE_BAN, distance: 240 }
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

Given(
  'son inscription au registre porte un téléphone que la coop n’a pas',
  async () => {
    await prismaClient.lieuInclusionRegistreMain.create({
      data: {
        nom: 'Lieu à reprendre',
        structureCoopId: lieuSeme(),
        contact: { telephone: TELEPHONE_DU_REGISTRE },
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
        repriseDesCourriels(reprendreLesCourriels),
        repriseDuPivot(effacerLeRna),
        repriseDuResume(descendreLeResume),
        repriseDeLaPublication(retirerLaPublication),
        repriseDeLAdresse(
          geocoderLesAdresses,
          retrouverParLesCoordonnees,
          reprendreLAdresse,
        ),
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
        repriseDesCourriels(sansRepriseDesCourriels),
        repriseDuPivot(sansEffacementDuRna),
        repriseDuResume(sansDescenteDuResume),
        repriseDeLaPublication(sansRetraitDePublication),
        repriseDeLAdresse(
          geocoderLesAdresses,
          retrouverParLesCoordonnees,
          sansRepriseDeLAdresse,
        ),
      ],
      ports: {
        lireLesLieux: lireLesLieuxDuScenario,
        deposerLeReleve,
        journal: () => undefined,
      },
    })
  ).releve
})

Then('le relevé compte ce lieu dans la colonne {string}', (colonne: string) => {
  assert.notStrictEqual(
    celluleDe(colonne),
    undefined,
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

Then('les courriels du lieu sont rangés', async () => {
  const { courriels } = await prismaClient.lieuInclusion.findUniqueOrThrow({
    where: { id: lieuSeme() },
    select: { courriels: true },
  })

  assert.deepStrictEqual(courriels, COURRIELS_RANGES)
})

const contactDuRegistre = async (): Promise<Record<string, unknown>> => {
  const { contact } =
    await prismaClient.lieuInclusionRegistreMain.findFirstOrThrow({
      where: { structureCoopId: lieuSeme() },
      select: { contact: true },
    })

  return typeof contact === 'object' &&
    contact !== null &&
    !Array.isArray(contact)
    ? contact
    : {}
}

Then('son inscription au registre garde ce téléphone', async () => {
  assert.strictEqual(
    (await contactDuRegistre()).telephone,
    TELEPHONE_DU_REGISTRE,
  )
})

Then('ses courriels au registre sont rangés', async () => {
  const courriels = (await contactDuRegistre()).courriels

  assert.deepStrictEqual(courriels, {
    email: COURRIELS_RANGES.join('|'),
  })
})

Then('le lieu ne paraît plus sur la cartographie', async () => {
  const { visiblePourCartographieNationale } =
    await prismaClient.lieuInclusion.findUniqueOrThrow({
      where: { id: lieuSeme() },
      select: { visiblePourCartographieNationale: true },
    })

  assert.strictEqual(visiblePourCartographieNationale, false)
})

Then('le relevé montre le RNA effacé', () => {
  assert.strictEqual(celluleDe('rna'), RNA)
})

Then('le lieu ne porte plus de RNA', async () => {
  const { rna } = await prismaClient.lieuInclusion.findUniqueOrThrow({
    where: { id: lieuSeme() },
    select: { rna: true },
  })

  assert.strictEqual(rna, null)
})

Then('le résumé du lieu descend dans sa description', async () => {
  const { presentationResume, presentationDetail } =
    await prismaClient.lieuInclusion.findUniqueOrThrow({
      where: { id: lieuSeme() },
      select: { presentationResume: true, presentationDetail: true },
    })

  assert.strictEqual(presentationResume, null)
  assert.strictEqual(presentationDetail, RESUME_TROP_LONG)
})

Then(
  'l’adresse du lieu est celle que la Base Adresse Nationale rend',
  async () => {
    const lieu = await prismaClient.lieuInclusion.findUniqueOrThrow({
      where: { id: lieuSeme() },
      select: {
        adresse: true,
        commune: true,
        codePostal: true,
        codeInsee: true,
        banId: true,
        latitude: true,
        longitude: true,
      },
    })

    assert.deepStrictEqual(lieu, {
      adresse: ADRESSE_BAN.voie,
      commune: ADRESSE_BAN.commune,
      codePostal: ADRESSE_BAN.codePostal,
      codeInsee: ADRESSE_BAN.codeInsee,
      banId: ADRESSE_BAN.banId,
      latitude: ADRESSE_BAN.latitude,
      longitude: ADRESSE_BAN.longitude,
    })
  },
)

Then('l’inscription au registre pointe vers une adresse', async () => {
  const { adresseId } =
    await prismaClient.lieuInclusionRegistreMain.findFirstOrThrow({
      where: { structureCoopId: lieuSeme() },
      select: { adresseId: true },
    })

  assert.notStrictEqual(adresseId, null)
})

Then('l’adresse du lieu n’a pas bougé', async () => {
  const { adresse, banId } = await prismaClient.lieuInclusion.findUniqueOrThrow(
    {
      where: { id: lieuSeme() },
      select: { adresse: true, banId: true },
    },
  )

  assert.strictEqual(adresse, '12 QUAI DU PORT')
  assert.strictEqual(banId, null)
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
  banRend.adresse = ADRESSE_BAN
  banRetrouve.adresse = null

  if (lieuId == null) return

  await prismaClient.lieuInclusionRegistreMain.deleteMany({
    where: { structureCoopId: lieuId },
  })
  await prismaClient.lieuInclusion.deleteMany({ where: { id: lieuId } })
})
