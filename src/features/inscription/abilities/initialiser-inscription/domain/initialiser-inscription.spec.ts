import { describe, expect, it } from 'vitest'
import {
  type DispositifPersonne,
  EtapeDInscription,
  ProfilInscription,
  UtilisateurId,
} from '@/features/inscription/domain'
import { Siret } from '@/libraries/insee'
import { failure, success } from '@/libraries/result'
import { initialiserInscription } from './initialiser-inscription'
import type { InscriptionInitialisee } from './inscription-initialisee'
import type { InitialiserInscriptionPorts } from './ports'

const userId = UtilisateurId('550e8400-e29b-41d4-a716-446655440000')

const inconnu: DispositifPersonne = {
  connue: false,
  estConseillerNumerique: false,
  estCoordinateur: false,
}

const ports: InitialiserInscriptionPorts<string, string> = {
  lireLeDispositif: async () => inconnu,
  enregistrerLeProfil: async () => undefined,
  garantirLeRoleCoordinateur: async () => success({ _tag: 'HorsDuDispositif' }),
  garantirLeMediateur: async () => undefined,
  lireLeSiretARattacher: async () => ({ siret: null, aUneEmployeuse: false }),
  rattacherDepuisSiret: async () =>
    success('Rattachée à l’employeuse du SIRET'),
  lireEtatPourEtapeSuivante: async () => ({
    profil: null,
    hasLieuxActivite: false,
  }),
}

describe('initialiser l’inscription', () => {
  it.each<{
    cas: string
    dispositif: DispositifPersonne
    profil: ProfilInscription | null
    hasLieuxActivite: boolean
    attendu: InscriptionInitialisee<string, string>
  }>([
    {
      cas: 'une personne inconnue du dispositif choisit son rôle, sans profil enregistré',
      dispositif: inconnu,
      profil: null,
      hasLieuxActivite: false,
      attendu: {
        profilEnregistre: null,
        roleCoordinateur: { _tag: 'HorsDuDispositif' },
        mediateurGaranti: false,
        rattachementParSiret: { _tag: 'SansSiret' },
        nextStep: EtapeDInscription('choisir-role'),
      },
    },
    {
      cas: 'une personne connue mais non conseillère numérique choisit son rôle, en médiatrice',
      dispositif: {
        connue: true,
        estConseillerNumerique: false,
        estCoordinateur: false,
      },
      profil: null,
      hasLieuxActivite: false,
      attendu: {
        profilEnregistre: ProfilInscription('Mediateur'),
        roleCoordinateur: { _tag: 'HorsDuDispositif' },
        mediateurGaranti: false,
        rattachementParSiret: { _tag: 'SansSiret' },
        nextStep: EtapeDInscription('choisir-role'),
      },
    },
    {
      cas: 'un coordinateur connu hors conseillers numériques choisit son rôle',
      dispositif: {
        connue: true,
        estConseillerNumerique: false,
        estCoordinateur: true,
      },
      profil: null,
      hasLieuxActivite: false,
      attendu: {
        profilEnregistre: ProfilInscription('Coordinateur'),
        roleCoordinateur: { _tag: 'HorsDuDispositif' },
        mediateurGaranti: false,
        rattachementParSiret: { _tag: 'SansSiret' },
        nextStep: EtapeDInscription('choisir-role'),
      },
    },
    {
      cas: 'un conseiller numérique sans lieu vérifie ses informations, médiateur garanti',
      dispositif: {
        connue: true,
        estConseillerNumerique: true,
        estCoordinateur: false,
      },
      profil: null,
      hasLieuxActivite: false,
      attendu: {
        profilEnregistre: ProfilInscription('ConseillerNumerique'),
        roleCoordinateur: { _tag: 'HorsDuDispositif' },
        mediateurGaranti: true,
        rattachementParSiret: { _tag: 'SansSiret' },
        nextStep: EtapeDInscription('verifier-informations'),
      },
    },
    {
      cas: 'un conseiller numérique avec lieu arrive au récapitulatif',
      dispositif: {
        connue: true,
        estConseillerNumerique: true,
        estCoordinateur: false,
      },
      profil: null,
      hasLieuxActivite: true,
      attendu: {
        profilEnregistre: ProfilInscription('ConseillerNumerique'),
        roleCoordinateur: { _tag: 'HorsDuDispositif' },
        mediateurGaranti: true,
        rattachementParSiret: { _tag: 'SansSiret' },
        nextStep: EtapeDInscription('recapitulatif'),
      },
    },
    {
      cas: 'un coordinateur conseiller numérique arrive au récapitulatif, profil déduit du dispositif',
      dispositif: {
        connue: true,
        estConseillerNumerique: true,
        estCoordinateur: true,
      },
      profil: ProfilInscription('ConseillerNumerique'),
      hasLieuxActivite: false,
      attendu: {
        profilEnregistre: ProfilInscription('CoordinateurConseillerNumerique'),
        roleCoordinateur: { _tag: 'HorsDuDispositif' },
        mediateurGaranti: false,
        rattachementParSiret: { _tag: 'SansSiret' },
        nextStep: EtapeDInscription('recapitulatif'),
      },
    },
  ])('$cas', async ({ dispositif, profil, hasLieuxActivite, attendu }) => {
    expect(
      await initialiserInscription({
        ...ports,
        lireLeDispositif: async () => dispositif,
        lireEtatPourEtapeSuivante: async () => ({ profil, hasLieuxActivite }),
      })({ userId }),
    ).toEqual(success(attendu))
  })

  it('reprend le profil déjà choisi d’une personne inconnue du dispositif', async () => {
    expect(
      await initialiserInscription({
        ...ports,
        lireEtatPourEtapeSuivante: async () => ({
          profil: ProfilInscription('Coordinateur'),
          hasLieuxActivite: false,
        }),
      })({ userId }),
    ).toEqual(
      success({
        profilEnregistre: null,
        roleCoordinateur: { _tag: 'HorsDuDispositif' },
        mediateurGaranti: false,
        rattachementParSiret: { _tag: 'SansSiret' },
        nextStep: EtapeDInscription('choisir-role'),
      }),
    )
  })

  it('rattache l’utilisateur à l’employeuse du SIRET de son compte quand il n’en a pas', async () => {
    expect(
      await initialiserInscription({
        ...ports,
        lireLeSiretARattacher: async () => ({
          siret: Siret('13002526500013'),
          aUneEmployeuse: false,
        }),
      })({ userId }),
    ).toEqual(
      success({
        profilEnregistre: null,
        roleCoordinateur: { _tag: 'HorsDuDispositif' },
        mediateurGaranti: false,
        rattachementParSiret: {
          _tag: 'Rattache',
          siret: Siret('13002526500013'),
          rattachement: 'Rattachée à l’employeuse du SIRET',
        },
        nextStep: EtapeDInscription('choisir-role'),
      }),
    )
  })

  it('poursuit l’initialisation quand le rattachement par SIRET échoue, et en porte l’échec', async () => {
    expect(
      await initialiserInscription({
        ...ports,
        lireLeSiretARattacher: async () => ({
          siret: Siret('13002526500013'),
          aUneEmployeuse: false,
        }),
        rattacherDepuisSiret: async () => failure('SIRENE indisponible'),
      })({ userId }),
    ).toEqual(
      success({
        profilEnregistre: null,
        roleCoordinateur: { _tag: 'HorsDuDispositif' },
        mediateurGaranti: false,
        rattachementParSiret: {
          _tag: 'NonRattache',
          siret: Siret('13002526500013'),
          echec: 'SIRENE indisponible',
        },
        nextStep: EtapeDInscription('choisir-role'),
      }),
    )
  })

  it('ne rattache pas par SIRET un utilisateur qui a déjà une employeuse', async () => {
    expect(
      await initialiserInscription({
        ...ports,
        lireLeSiretARattacher: async () => ({
          siret: Siret('13002526500013'),
          aUneEmployeuse: true,
        }),
      })({ userId }),
    ).toEqual(
      success({
        profilEnregistre: null,
        roleCoordinateur: { _tag: 'HorsDuDispositif' },
        mediateurGaranti: false,
        rattachementParSiret: { _tag: 'EmployeuseDejaConnue' },
        nextStep: EtapeDInscription('choisir-role'),
      }),
    )
  })

  it('porte la création du rôle de coordinateur du dispositif', async () => {
    expect(
      await initialiserInscription({
        ...ports,
        garantirLeRoleCoordinateur: async () => success({ _tag: 'RoleCree' }),
      })({ userId }),
    ).toEqual(
      success({
        profilEnregistre: null,
        roleCoordinateur: { _tag: 'RoleCree' },
        mediateurGaranti: false,
        rattachementParSiret: { _tag: 'SansSiret' },
        nextStep: EtapeDInscription('choisir-role'),
      }),
    )
  })
})
