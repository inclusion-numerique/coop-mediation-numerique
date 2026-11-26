import { describe, expect, it } from 'vitest'
import { UtilisateurId } from '@/features/inscription/domain'
import type { AdresseBanData } from '@/libraries/adresse'
import { failure, success } from '@/libraries/result'
import { ajouterStructureEmployeuseEnLieu } from './ajouter-structure-employeuse-en-lieu'
import type {
  AjouterStructureEmployeuseEnLieuPorts,
  EmployeuseLue,
} from './ports'

const userId = UtilisateurId('550e8400-e29b-41d4-a716-446655440000')

const maintenant = new Date('2026-02-02T09:00:00.000Z')

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
  nom: '4 Rue de la Rue',
  commune: 'Lyon',
  codePostal: '69001',
  codeInsee: '69381',
  contexte: '69, Rhône, Auvergne-Rhône-Alpes',
  latitude: 45.767,
  longitude: 4.834,
}

const trace = { userId, structureId: 42 }

const ports: AjouterStructureEmployeuseEnLieuPorts = {
  consulterEmployeuseActuelle: async () => ({ employeuse: employeuseAdressee }),
  lireLAdresseDeLEmployeuse: async () => ({
    adresse: '4 rue de la Rue',
    codePostal: '69001',
    commune: 'Lyon',
    codeInsee: '69381',
  }),
  geocoderLAdresse: async () => ({
    _tag: 'AdresseReconnue',
    adresse: adresseBan,
  }),
  rattacherAuLieuDecrit: async () => undefined,
  detacherDuLieuDecrit: async () => undefined,
}

describe('ajouter la structure employeuse en lieu d’activité', () => {
  it('rattache l’employeuse comme lieu à son adresse reconnue, avec son référent et un SIRET synchronisé à l’instant', async () => {
    expect(
      await ajouterStructureEmployeuseEnLieu(ports)({
        userId,
        estLieuActivite: true,
        maintenant,
      }),
    ).toEqual(
      success({
        _tag: 'RattacheeCommeLieu',
        trace,
        lieu: {
          nom: 'Association du numérique',
          adresse: '4 Rue de la Rue',
          commune: 'Lyon',
          codePostal: '69001',
          codeInsee: '69381',
          banId: '69381_1234_00004',
          latitude: 45.767,
          longitude: 4.834,
          complementAdresse: null,
          siret: '13002526500013',
          synchronisationSiret: maintenant,
          rna: 'W691234567',
          nomReferent: 'Camille Martin',
          courrielReferent: 'camille.martin@example.fr',
          telephoneReferent: '+33612345678',
        },
      }),
    )
  })

  it('retire des lieux d’activité l’employeuse qui n’en est pas un, décrite à son adresse connue', async () => {
    expect(
      await ajouterStructureEmployeuseEnLieu(ports)({
        userId,
        estLieuActivite: false,
        maintenant,
      }),
    ).toEqual(
      success({
        _tag: 'DetacheeDesLieux',
        trace,
        lieu: {
          nom: 'Association du numérique',
          adresse: '4 rue de la Rue',
          commune: 'Lyon',
          codePostal: '69001',
          codeInsee: '69381',
          complementAdresse: null,
          siret: '13002526500013',
          synchronisationSiret: maintenant,
          rna: 'W691234567',
          nomReferent: 'Camille Martin',
          courrielReferent: 'camille.martin@example.fr',
          telephoneReferent: '+33612345678',
        },
      }),
    )
  })

  it('retire des lieux d’activité une employeuse sans nom, sans adresse ni SIRET ni référent', async () => {
    expect(
      await ajouterStructureEmployeuseEnLieu({
        ...ports,
        consulterEmployeuseActuelle: async () => ({
          employeuse: employeuseSansAdresse,
        }),
      })({ userId, estLieuActivite: false, maintenant }),
    ).toEqual(
      success({
        _tag: 'DetacheeDesLieux',
        trace,
        lieu: {
          nom: '',
          adresse: '',
          commune: '',
          codePostal: '',
          codeInsee: null,
          complementAdresse: null,
          siret: null,
          synchronisationSiret: null,
          rna: null,
          nomReferent: null,
          courrielReferent: null,
          telephoneReferent: null,
        },
      }),
    )
  })

  it('décrit sans voie le lieu d’une employeuse dont l’adresse n’en a pas', async () => {
    expect(
      await ajouterStructureEmployeuseEnLieu({
        ...ports,
        consulterEmployeuseActuelle: async () => ({
          employeuse: {
            ...employeuseSansAdresse,
            adresse: {
              voie: null,
              commune: 'Lyon',
              codePostal: '69001',
              codeInsee: '69381',
            },
          },
        }),
      })({ userId, estLieuActivite: false, maintenant }),
    ).toEqual(
      success({
        _tag: 'DetacheeDesLieux',
        trace,
        lieu: {
          nom: '',
          adresse: '',
          commune: 'Lyon',
          codePostal: '69001',
          codeInsee: '69381',
          complementAdresse: null,
          siret: null,
          synchronisationSiret: null,
          rna: null,
          nomReferent: null,
          courrielReferent: null,
          telephoneReferent: null,
        },
      }),
    )
  })

  it('refuse un utilisateur sans employeuse', async () => {
    expect(
      await ajouterStructureEmployeuseEnLieu({
        ...ports,
        consulterEmployeuseActuelle: async () => null,
      })({ userId, estLieuActivite: true, maintenant }),
    ).toEqual(failure({ _tag: 'EmployeuseIntrouvable', userId }))
  })

  it('refuse quand le service d’adresse est indisponible', async () => {
    expect(
      await ajouterStructureEmployeuseEnLieu({
        ...ports,
        geocoderLAdresse: async () => ({ _tag: 'ServiceIndisponible' }),
      })({ userId, estLieuActivite: true, maintenant }),
    ).toEqual(failure({ _tag: 'ServiceAdresseIndisponible', employeuseId: 42 }))
  })

  it('refuse quand l’adresse n’est pas reconnue', async () => {
    expect(
      await ajouterStructureEmployeuseEnLieu({
        ...ports,
        geocoderLAdresse: async () => ({ _tag: 'AdresseInconnue' }),
      })({ userId, estLieuActivite: true, maintenant }),
    ).toEqual(failure({ _tag: 'AdresseNonReconnue', employeuseId: 42 }))
  })

  it('refuse quand l’employeuse n’a pas d’adresse à géocoder', async () => {
    expect(
      await ajouterStructureEmployeuseEnLieu({
        ...ports,
        lireLAdresseDeLEmployeuse: async () => null,
      })({ userId, estLieuActivite: true, maintenant }),
    ).toEqual(failure({ _tag: 'AdresseNonReconnue', employeuseId: 42 }))
  })
})
