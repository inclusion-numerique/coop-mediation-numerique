import assert from 'node:assert'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import type {
  AdresseGeocodee,
  EmployeuseLue,
  Geocodage,
} from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/domain'
import { BanId } from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/domain/ban-id'
import {
  seedEmployeuseMain,
  utilisateurDeLInscriptionEnCours,
} from '@/features/inscription/inscription.cucumber'
import { CodePostal } from '@/libraries/code-postal'
import { CodeInsee } from '@/libraries/insee'
import { success } from '@/libraries/result'
import { ajouterStructureEmployeuseEnLieu } from './domain/ajouter-structure-employeuse-en-lieu'
import { EmployeuseId } from './domain/employeuse-id'
import { lireLAdresseDeLEmployeuse } from './implementations/prisma/adresse-de-l-employeuse.query'

const nomEmployeuse = 'Employeuse lieu d’activité'

const ADRESSE_RECONNUE: AdresseGeocodee = {
  id: BanId('75101_7038_00001'),
  nom: '1 Rue de la Paix',
  commune: 'Paris',
  codePostal: CodePostal('75001'),
  codeInsee: CodeInsee('75101'),
  latitude: 48.869_36,
  longitude: 2.331_08,
}

const ADRESSE_RECONNUE_PAR_LA_BAN: Geocodage = {
  _tag: 'AdresseReconnue',
  adresse: ADRESSE_RECONNUE,
}

const etat: {
  geocodage: Geocodage
  employeuse: { readonly employeuse: EmployeuseLue } | null
  resultat: Awaited<ReturnType<ReturnType<typeof declarerAvec>>> | null
} = {
  geocodage: ADRESSE_RECONNUE_PAR_LA_BAN,
  employeuse: null,
  resultat: null,
}

const declarerAvec = (
  geocodage: Geocodage,
  consultation: { readonly employeuse: EmployeuseLue } | null,
) =>
  ajouterStructureEmployeuseEnLieu({
    lireLAdresseDeLEmployeuse,
    geocoderLAdresse: async () => geocodage,
    consulterEmployeuseActuelle: async () => consultation,
    destinationDuLieuDecrit: async ({ lieu }) => success(lieu),
    rattacherAuLieuDecrit: async () => ({ _tag: 'Rattaches' }),
    lieuCorreleAuLieuDecrit: async () => success(null),
    detacherDuLieu: async () => undefined,
  })

const declarer = async (estLieuActivite: boolean) => {
  etat.resultat = await declarerAvec(
    etat.geocodage,
    etat.employeuse,
  )({
    userId: utilisateurDeLInscriptionEnCours(),
    estLieuActivite,
    maintenant: new Date(),
  })
}

const lieuRattache = () => {
  assert.ok(
    etat.resultat?.success && etat.resultat.data._tag === 'RattacheeCommeLieu',
    'Aucun lieu n’a été confié au rattachement',
  )
  return etat.resultat.data.destination
}

const refus = (): string | null =>
  etat.resultat && !etat.resultat.success ? etat.resultat.error._tag : null

Given('je suis médiateur', async () => {
  await prismaClient.mediateur.create({
    data: { id: v4(), userId: utilisateurDeLInscriptionEnCours() },
  })
})

Given('j’ai une structure employeuse', async () => {
  const id = await seedEmployeuseMain({ nom: nomEmployeuse })
  etat.employeuse = {
    employeuse: {
      id: EmployeuseId(id),
      denomination: Nom(nomEmployeuse),
      siret: null,
      rna: null,
      adresse: {
        voie: '1 rue de la Paix',
        commune: 'Paris',
        codePostal: CodePostal('75001'),
        codeInsee: CodeInsee('75101'),
      },
      contactReferent: { _tag: 'nonRenseigne' },
    },
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
  assert.strictEqual(lieuRattache().nom, nomEmployeuse)
})

Then('ma structure employeuse est confiée au détachement', () => {
  assert.ok(
    etat.resultat?.success && etat.resultat.data._tag === 'DetacheeDesLieux',
    'La structure employeuse n’a pas été confiée au détachement',
  )
  assert.strictEqual(etat.resultat.data.lieu?.nom, nomEmployeuse)
})

Then('rien n’est confié au rattachement', () => {
  assert.ok(
    etat.resultat && !etat.resultat.success,
    'La déclaration aurait dû être refusée',
  )
})

Then('la déclaration m’est refusée faute d’adresse reconnue', () => {
  assert.strictEqual(refus(), 'AdresseNonReconnue')
})

Then('la déclaration m’est refusée faute de service d’adresse', () => {
  assert.strictEqual(refus(), 'ServiceAdresseIndisponible')
})

Then('le lieu confié porte l’adresse de la Base Adresse Nationale', () => {
  const { adresse } = lieuRattache()
  assert.strictEqual(adresse.voie, ADRESSE_RECONNUE.nom)
  assert.strictEqual(adresse.banId, ADRESSE_RECONNUE.id)
  assert.strictEqual(adresse.latitude, ADRESSE_RECONNUE.latitude)
  assert.strictEqual(adresse.longitude, ADRESSE_RECONNUE.longitude)
})

After(() => {
  etat.geocodage = ADRESSE_RECONNUE_PAR_LA_BAN
  etat.employeuse = null
  etat.resultat = null
})
