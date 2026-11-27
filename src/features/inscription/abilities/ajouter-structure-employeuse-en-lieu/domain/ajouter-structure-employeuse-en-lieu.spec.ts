import { Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { describe, expect, it } from 'vitest'
import { BanId } from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/domain/ban-id'
import { LieuId, UtilisateurId } from '@/features/inscription/domain'
import { CodePostal } from '@/libraries/code-postal'
import { CodeInsee, Siret } from '@/libraries/insee'
import { failure, success } from '@/libraries/result'
import { ajouterStructureEmployeuseEnLieu } from './ajouter-structure-employeuse-en-lieu'
import { EmployeuseId } from './employeuse-id'
import type {
  AdresseGeocodee,
  AjouterStructureEmployeuseEnLieuPorts,
  EmployeuseLue,
} from './ports'

const userId = UtilisateurId('550e8400-e29b-41d4-a716-446655440000')

const maintenant = new Date('2026-02-02T09:00:00.000Z')

const employeuseId = EmployeuseId(42)

const lieuCorrele = LieuId('7c9e6679-7425-40de-944b-e07fc1f90ae7')

const employeuseSansAdresse: EmployeuseLue = {
  id: employeuseId,
  denomination: null,
  siret: null,
  rna: null,
  adresse: null,
  contactReferent: { _tag: 'nonRenseigne' },
}

const employeuseAdressee: EmployeuseLue = {
  id: employeuseId,
  denomination: Nom('Association du numérique'),
  siret: Siret('13002526500013'),
  rna: 'W691234567',
  adresse: {
    voie: '4 rue de la Rue',
    commune: 'Lyon',
    codePostal: CodePostal('69001'),
    codeInsee: CodeInsee('69381'),
  },
  contactReferent: {
    _tag: 'renseigne',
    nom: 'Camille Martin',
    courriel: 'camille.martin@example.fr',
    telephone: '+33612345678',
  },
}

const adresseBan: AdresseGeocodee = {
  id: BanId('69381_1234_00004'),
  nom: '4 Rue de la Rue',
  commune: 'Lyon',
  codePostal: CodePostal('69001'),
  codeInsee: CodeInsee('69381'),
  latitude: 45.767,
  longitude: 4.834,
}

const trace = { userId, structureId: employeuseId }

const ports: AjouterStructureEmployeuseEnLieuPorts<string> = {
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
  destinationDuLieuDecrit: async () => success('destination-1'),
  rattacherAuLieuDecrit: async () => ({ _tag: 'Rattaches' }),
  lieuCorreleAuLieuDecrit: async () => success(null),
  detacherDuLieu: async () => undefined,
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
        destination: 'destination-1',
        lieu: {
          nom: 'Association du numérique',
          adresse: {
            _tag: 'AdresseGeocodee',
            voie: '4 Rue de la Rue',
            commune: 'Lyon',
            codePostal: CodePostal('69001'),
            codeInsee: CodeInsee('69381'),
            banId: '69381_1234_00004',
            latitude: 45.767,
            longitude: 4.834,
          },
          siret: Siret('13002526500013'),
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
        lieuDetache: null,
        lieu: {
          nom: 'Association du numérique',
          adresse: {
            _tag: 'AdresseDeclaree',
            voie: '4 rue de la Rue',
            commune: 'Lyon',
            codePostal: CodePostal('69001'),
            codeInsee: CodeInsee('69381'),
          },
          siret: Siret('13002526500013'),
          synchronisationSiret: maintenant,
          rna: 'W691234567',
          nomReferent: 'Camille Martin',
          courrielReferent: 'camille.martin@example.fr',
          telephoneReferent: '+33612345678',
        },
      }),
    )
  })

  it('ne cherche aucun lieu à retirer pour une employeuse sans adresse', async () => {
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
        lieuDetache: null,
        lieu: null,
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
            denomination: Nom('Association du numérique'),
            adresse: {
              voie: null,
              commune: 'Lyon',
              codePostal: CodePostal('69001'),
              codeInsee: CodeInsee('69381'),
            },
          },
        }),
      })({ userId, estLieuActivite: false, maintenant }),
    ).toEqual(
      success({
        _tag: 'DetacheeDesLieux',
        trace,
        lieuDetache: null,
        lieu: {
          nom: 'Association du numérique',
          adresse: {
            _tag: 'AdresseDeclaree',
            voie: null,
            commune: 'Lyon',
            codePostal: CodePostal('69001'),
            codeInsee: CodeInsee('69381'),
          },
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

  it('ne cherche aucun lieu à retirer pour une employeuse sans dénomination', async () => {
    expect(
      await ajouterStructureEmployeuseEnLieu({
        ...ports,
        consulterEmployeuseActuelle: async () => ({
          employeuse: { ...employeuseAdressee, denomination: null },
        }),
      })({ userId, estLieuActivite: false, maintenant }),
    ).toEqual(
      success({
        _tag: 'DetacheeDesLieux',
        trace,
        lieuDetache: null,
        lieu: null,
      }),
    )
  })

  it('refuse de faire un lieu d’une employeuse sans dénomination', async () => {
    expect(
      await ajouterStructureEmployeuseEnLieu({
        ...ports,
        consulterEmployeuseActuelle: async () => ({
          employeuse: { ...employeuseAdressee, denomination: null },
        }),
      })({ userId, estLieuActivite: true, maintenant }),
    ).toEqual(failure({ _tag: 'EmployeuseSansDenomination', employeuseId }))
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
    ).toEqual(failure({ _tag: 'ServiceAdresseIndisponible', employeuseId }))
  })

  it('refuse quand l’adresse n’est pas reconnue', async () => {
    expect(
      await ajouterStructureEmployeuseEnLieu({
        ...ports,
        geocoderLAdresse: async () => ({ _tag: 'AdresseInconnue' }),
      })({ userId, estLieuActivite: true, maintenant }),
    ).toEqual(failure({ _tag: 'AdresseNonReconnue', employeuseId }))
  })

  it('refuse quand l’employeuse n’a pas d’adresse à géocoder', async () => {
    expect(
      await ajouterStructureEmployeuseEnLieu({
        ...ports,
        lireLAdresseDeLEmployeuse: async () => null,
      })({ userId, estLieuActivite: true, maintenant }),
    ).toEqual(failure({ _tag: 'AdresseNonReconnue', employeuseId }))
  })

  it('détache le médiateur du lieu de la coop corrélé à son employeuse', async () => {
    expect(
      await ajouterStructureEmployeuseEnLieu({
        ...ports,
        lieuCorreleAuLieuDecrit: async () => success(lieuCorrele),
      })({ userId, estLieuActivite: false, maintenant }),
    ).toMatchObject(
      success({ _tag: 'DetacheeDesLieux', lieuDetache: lieuCorrele }),
    )
  })

  it('refuse quand le lieu visé a disparu avant le rattachement', async () => {
    expect(
      await ajouterStructureEmployeuseEnLieu({
        ...ports,
        rattacherAuLieuDecrit: async () => ({
          _tag: 'LieuDisparu',
          lieuId: lieuCorrele,
        }),
      })({ userId, estLieuActivite: true, maintenant }),
    ).toEqual(failure({ _tag: 'LieuIntrouvable', lieuId: lieuCorrele }))
  })
})
