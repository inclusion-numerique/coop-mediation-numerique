import { describe, expect, it } from 'vitest'
import {
  type DispositifPersonne,
  EtapeDInscription,
  ProfilInscription,
  UtilisateurId,
} from '@/features/inscription/domain'
import { initialiserInscription } from './initialiser-inscription'

const userId = UtilisateurId('550e8400-e29b-41d4-a716-446655440000')

const initialiser = ({
  dispositif,
  profil,
  hasLieuxActivite,
}: {
  readonly dispositif: DispositifPersonne
  readonly profil: ProfilInscription | null
  readonly hasLieuxActivite: boolean
}) =>
  initialiserInscription(
    { userId },
    {
      lireLeDispositif: async () => dispositif,
      enregistrerLeProfil: async () => undefined,
      garantirLeRoleCoordinateur: async () => undefined,
      garantirLeMediateur: async () => undefined,
      importerStructureDepuisSiret: async () => undefined,
      lireEtatPourEtapeSuivante: async () => ({ profil, hasLieuxActivite }),
    },
  )

describe('initialiserInscription', () => {
  it.each<{
    cas: string
    dispositif: DispositifPersonne
    profil: ProfilInscription | null
    hasLieuxActivite: boolean
    attendu: EtapeDInscription
  }>([
    {
      cas: 'une personne inconnue du dispositif choisit son rôle',
      dispositif: {
        connue: false,
        estConseillerNumerique: false,
        estCoordinateur: false,
      },
      profil: null,
      hasLieuxActivite: false,
      attendu: EtapeDInscription('choisir-role'),
    },
    {
      cas: 'une personne connue mais non conseillère numérique choisit son rôle',
      dispositif: {
        connue: true,
        estConseillerNumerique: false,
        estCoordinateur: false,
      },
      profil: null,
      hasLieuxActivite: false,
      attendu: EtapeDInscription('choisir-role'),
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
      attendu: EtapeDInscription('choisir-role'),
    },
    {
      cas: 'un conseiller numérique sans lieu vérifie ses informations, profil déduit du dispositif',
      dispositif: {
        connue: true,
        estConseillerNumerique: true,
        estCoordinateur: false,
      },
      profil: null,
      hasLieuxActivite: false,
      attendu: EtapeDInscription('verifier-informations'),
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
      attendu: EtapeDInscription('recapitulatif'),
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
      attendu: EtapeDInscription('recapitulatif'),
    },
  ])('$cas', async ({ dispositif, profil, hasLieuxActivite, attendu }) => {
    expect(await initialiser({ dispositif, profil, hasLieuxActivite })).toEqual(
      { nextStep: attendu },
    )
  })
})
