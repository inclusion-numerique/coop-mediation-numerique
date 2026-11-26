import { describe, expect, it } from 'vitest'
import { UtilisateurId } from '@/features/inscription/domain'
import type { AdresseBanData } from '@/libraries/adresse'
import {
  type AjouterStructureEmployeuseEnLieuPorts,
  ajouterStructureEmployeuseEnLieu,
} from './ajouter-structure-employeuse-en-lieu'
import type { EmployeuseLue, Geocodage } from './ports'

const userId = UtilisateurId('550e8400-e29b-41d4-a716-446655440000')

const employeuseSansAdresse: EmployeuseLue = {
  id: 42,
  denomination: null,
  siret: null,
  rna: null,
  adresse: null,
  contactReferent: { _tag: 'nonRenseigne' },
}

const employeuseAdressee: EmployeuseLue = {
  id: 42,
  denomination: 'Association du numérique',
  siret: '13002526500013',
  rna: 'W691234567',
  adresse: {
    voie: '4 rue de la Rue',
    commune: 'Lyon',
    codePostal: '69001',
    codeInsee: '69381',
  },
  contactReferent: {
    _tag: 'renseigne',
    nom: 'Camille Martin',
    courriel: 'camille.martin@example.fr',
    telephone: '+33612345678',
  },
}

const adresseBan: AdresseBanData = {
  id: '69381_1234_00004',
  nom: '4 rue de la Rue',
  commune: 'Lyon',
  codePostal: '69001',
  codeInsee: '69381',
  contexte: '69, Rhône, Auvergne-Rhône-Alpes',
  latitude: 45.767,
  longitude: 4.834,
}

const adresseAGeocoder = {
  adresse: '4 rue de la Rue',
  codePostal: '69001',
  commune: 'Lyon',
  codeInsee: '69381',
}

const ports = ({
  actuelle,
  adresse,
  geocodage,
}: {
  readonly actuelle: { readonly employeuse: EmployeuseLue } | null
  readonly adresse: typeof adresseAGeocoder | null
  readonly geocodage: Geocodage
}): AjouterStructureEmployeuseEnLieuPorts => ({
  consulterEmployeuseActuelle: async () => actuelle,
  lireLAdresseDeLEmployeuse: async () => adresse,
  geocoderLAdresse: async () => geocodage,
  rattacherAuLieuDecrit: async () => undefined,
  detacherDuLieuDecrit: async () => undefined,
})

describe('ajouterStructureEmployeuseEnLieu', () => {
  it('refuse un utilisateur sans employeuse', async () => {
    const ajouter = ajouterStructureEmployeuseEnLieu(
      ports({
        actuelle: null,
        adresse: adresseAGeocoder,
        geocodage: { _tag: 'AdresseReconnue', adresse: adresseBan },
      }),
    )

    expect(await ajouter({ userId, estLieuActivite: true })).toEqual({
      success: false,
      error: { _tag: 'EmployeuseIntrouvable', userId },
    })
  })

  it('retire l’employeuse des lieux d’activité quand elle n’en est pas un', async () => {
    const ajouter = ajouterStructureEmployeuseEnLieu(
      ports({
        actuelle: { employeuse: employeuseSansAdresse },
        adresse: null,
        geocodage: { _tag: 'AdresseInconnue' },
      }),
    )

    expect(await ajouter({ userId, estLieuActivite: false })).toEqual({
      success: true,
      data: undefined,
    })
  })

  it('rattache l’employeuse comme lieu d’activité quand son adresse est reconnue', async () => {
    const ajouter = ajouterStructureEmployeuseEnLieu(
      ports({
        actuelle: { employeuse: employeuseAdressee },
        adresse: adresseAGeocoder,
        geocodage: { _tag: 'AdresseReconnue', adresse: adresseBan },
      }),
    )

    expect(await ajouter({ userId, estLieuActivite: true })).toEqual({
      success: true,
      data: undefined,
    })
  })

  it('refuse quand le service d’adresse est indisponible', async () => {
    const ajouter = ajouterStructureEmployeuseEnLieu(
      ports({
        actuelle: { employeuse: employeuseAdressee },
        adresse: adresseAGeocoder,
        geocodage: { _tag: 'ServiceIndisponible' },
      }),
    )

    expect(await ajouter({ userId, estLieuActivite: true })).toEqual({
      success: false,
      error: { _tag: 'ServiceAdresseIndisponible', employeuseId: 42 },
    })
  })

  it('refuse quand l’adresse n’est pas reconnue', async () => {
    const ajouter = ajouterStructureEmployeuseEnLieu(
      ports({
        actuelle: { employeuse: employeuseAdressee },
        adresse: adresseAGeocoder,
        geocodage: { _tag: 'AdresseInconnue' },
      }),
    )

    expect(await ajouter({ userId, estLieuActivite: true })).toEqual({
      success: false,
      error: { _tag: 'AdresseNonReconnue', employeuseId: 42 },
    })
  })

  it('refuse quand l’employeuse n’a pas d’adresse à géocoder', async () => {
    const ajouter = ajouterStructureEmployeuseEnLieu(
      ports({
        actuelle: { employeuse: employeuseSansAdresse },
        adresse: null,
        geocodage: { _tag: 'AdresseReconnue', adresse: adresseBan },
      }),
    )

    expect(await ajouter({ userId, estLieuActivite: true })).toEqual({
      success: false,
      error: { _tag: 'AdresseNonReconnue', employeuseId: 42 },
    })
  })
})
