import assert from 'node:assert'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import type {
  EmployeuseLue,
  Geocodage,
  GeocoderLAdresse,
} from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/domain'
import {
  seedEmployeuseMain,
  utilisateurDeLInscriptionEnCours,
} from '@/features/inscription/inscription.cucumber'
import type { AdresseBanData } from '@/libraries/adresse'
import { success } from '@/libraries/result'
import { ajouterStructureEmployeuseEnLieu } from './domain/ajouter-structure-employeuse-en-lieu'
import { lireLAdresseDeLEmployeuse } from './implementations/prisma/adresse-de-l-employeuse.query'

const nomEmployeuse = 'Employeuse lieu d’activité'

const ADRESSE_RECONNUE: AdresseBanData = {
  id: '75101_7038_00001',
  label: '1 Rue de la Paix 75001 Paris',
  nom: '1 Rue de la Paix',
  commune: 'Paris',
  codePostal: '75001',
  codeInsee: '75101',
  contexte: '75, Paris, Île-de-France',
  latitude: 48.869_36,
  longitude: 2.331_08,
}

const ADRESSE_RECONNUE_PAR_LA_BAN: Geocodage = {
  _tag: 'AdresseReconnue',
  adresse: ADRESSE_RECONNUE,
}

type LieuConfie = {
  readonly nom: string
  readonly adresse: string
  readonly banId?: string
  readonly latitude?: number
  readonly longitude?: number
}

const etat: {
  geocodage: Geocodage
  employeuse?: EmployeuseLue
  refus: string | null
  rattaches: LieuConfie[]
  detaches: LieuConfie[]
} = {
  geocodage: ADRESSE_RECONNUE_PAR_LA_BAN,
  refus: null,
  rattaches: [],
  detaches: [],
}

const geocoderLAdresse: GeocoderLAdresse = async () => etat.geocodage

const consulterEmployeuseActuelle = async () =>
  etat.employeuse === undefined ? null : { employeuse: etat.employeuse }

const declarer = async (estLieuActivite: boolean) => {
  const resultat = await ajouterStructureEmployeuseEnLieu({
    lireLAdresseDeLEmployeuse,
    geocoderLAdresse,
    consulterEmployeuseActuelle,
    destinationDuLieuDecrit: async ({ lieu }) => success(lieu),
    rattacherAuLieuDecrit: async ({ destination }) => {
      etat.rattaches.push(destination)
      return { _tag: 'Rattaches' }
    },
    lieuCorreleAuLieuDecrit: async ({ lieu }) => {
      etat.detaches.push(lieu)
      return success(null)
    },
    detacherDuLieu: async () => undefined,
  })({
    userId: utilisateurDeLInscriptionEnCours(),
    estLieuActivite,
    maintenant: new Date(),
  })
  etat.refus = resultat.success ? null : resultat.error._tag
}

Given('je suis médiateur', async () => {
  await prismaClient.mediateur.create({
    data: { id: v4(), userId: utilisateurDeLInscriptionEnCours() },
  })
})

Given('j’ai une structure employeuse', async () => {
  const id = await seedEmployeuseMain({ nom: nomEmployeuse })
  etat.employeuse = {
    id,
    denomination: nomEmployeuse,
    siret: null,
    rna: null,
    adresse: {
      voie: '1 rue de la Paix',
      commune: 'Paris',
      codePostal: '75001',
      codeInsee: '75101',
    },
    contactReferent: { _tag: 'nonRenseigne' },
  }
})

Given('la Base Adresse Nationale ne reconnaît pas son adresse', () => {
  etat.geocodage = { _tag: 'AdresseInconnue' }
})

Given('le service d’adresse est indisponible', () => {
  etat.geocodage = { _tag: 'ServiceIndisponible' }
})

When(
  'je déclare que ma structure employeuse est un lieu d’activité',
  async () => {
    await declarer(true)
  },
)

When(
  'je déclare que ma structure employeuse n’est pas un lieu d’activité',
  async () => {
    await declarer(false)
  },
)

Then('ma structure employeuse est confiée au rattachement', () => {
  assert.deepStrictEqual(
    etat.rattaches.map(({ nom }) => nom),
    [nomEmployeuse],
  )
})

Then('ma structure employeuse est confiée au détachement', () => {
  assert.deepStrictEqual(
    etat.detaches.map(({ nom }) => nom),
    [nomEmployeuse],
  )
})

Then('rien n’est confié au rattachement', () => {
  assert.deepStrictEqual(etat.rattaches, [])
})

Then('la déclaration m’est refusée faute d’adresse reconnue', () => {
  assert.strictEqual(etat.refus, 'AdresseNonReconnue')
})

Then('la déclaration m’est refusée faute de service d’adresse', () => {
  assert.strictEqual(etat.refus, 'ServiceAdresseIndisponible')
})

Then('le lieu confié porte l’adresse de la Base Adresse Nationale', () => {
  const [lieu] = etat.rattaches
  assert.ok(lieu, 'Aucun lieu n’a été confié au rattachement')
  assert.strictEqual(lieu.adresse, ADRESSE_RECONNUE.nom)
  assert.strictEqual(lieu.banId, ADRESSE_RECONNUE.id)
  assert.strictEqual(lieu.latitude, ADRESSE_RECONNUE.latitude)
  assert.strictEqual(lieu.longitude, ADRESSE_RECONNUE.longitude)
})

After(() => {
  etat.geocodage = ADRESSE_RECONNUE_PAR_LA_BAN
  delete etat.employeuse
  etat.refus = null
  etat.rattaches = []
  etat.detaches = []
})
