import { describe, expect, it } from 'vitest'
import {
  EtapeDInscription,
  ProfilInscription,
  UtilisateurId,
} from '@/features/inscription/domain'
import type { DispositifInscription } from './dispositif-inscription'
import { initialiserInscription } from './initialiser-inscription'

const userId = UtilisateurId('550e8400-e29b-41d4-a716-446655440000')

const initialiser = ({
  dispositif,
  profil,
  hasLieuxActivite,
}: {
  readonly dispositif: DispositifInscription
  readonly profil: ProfilInscription | null
  readonly hasLieuxActivite: boolean
}) =>
  initialiserInscription(
    { userId },
    {
      appliquerDispositif: async () => dispositif,
      importerStructureDepuisSiret: async () => undefined,
      lireEtatPourEtapeSuivante: async () => ({ profil, hasLieuxActivite }),
    },
  )

describe('initialiserInscription', () => {
  it.each<{
    cas: string
    dispositif: DispositifInscription
    profil: ProfilInscription | null
    hasLieuxActivite: boolean
    attendu: EtapeDInscription
  }>([
    {
      cas: 'une personne inconnue du dispositif choisit son rôle',
      dispositif: { connue: false, estConseillerNumerique: false },
      profil: null,
      hasLieuxActivite: false,
      attendu: EtapeDInscription('choisir-role'),
    },
    {
      cas: 'une personne connue mais non conseillère numérique choisit son rôle',
      dispositif: { connue: true, estConseillerNumerique: false },
      profil: ProfilInscription('Mediateur'),
      hasLieuxActivite: false,
      attendu: EtapeDInscription('choisir-role'),
    },
    {
      cas: 'un conseiller numérique sans lieu vérifie ses informations',
      dispositif: { connue: true, estConseillerNumerique: true },
      profil: ProfilInscription('ConseillerNumerique'),
      hasLieuxActivite: false,
      attendu: EtapeDInscription('verifier-informations'),
    },
    {
      cas: 'un conseiller numérique avec lieu arrive au récapitulatif',
      dispositif: { connue: true, estConseillerNumerique: true },
      profil: ProfilInscription('ConseillerNumerique'),
      hasLieuxActivite: true,
      attendu: EtapeDInscription('recapitulatif'),
    },
    {
      cas: 'un coordinateur conseiller numérique arrive au récapitulatif',
      dispositif: { connue: true, estConseillerNumerique: true },
      profil: ProfilInscription('CoordinateurConseillerNumerique'),
      hasLieuxActivite: false,
      attendu: EtapeDInscription('recapitulatif'),
    },
  ])('$cas', async ({ dispositif, profil, hasLieuxActivite, attendu }) => {
    expect(await initialiser({ dispositif, profil, hasLieuxActivite })).toEqual(
      { nextStep: attendu },
    )
  })
})
