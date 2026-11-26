import { describe, expect, it } from 'vitest'
import {
  AdresseCourriel,
  type CompteASupprimer,
  type CoordinateurId,
  CourrielHash,
  Dispositif,
  type MediateurId,
  RoleUtilisateur,
  rattachements,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import type { SupprimerCompteDependances } from './ports'
import { supprimerUnInscritJamaisActif } from './supprimer-un-inscrit-jamais-actif'

const maintenant = new Date('2026-11-26T08:00:00.000Z')

const utilisateurId = UtilisateurId('0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f')

const inscrit: CompteASupprimer = {
  id: utilisateurId,
  courriel: AdresseCourriel('jean.dupont@example.com'),
  role: RoleUtilisateur('User'),
  etat: { _tag: 'actif' },
  rattachements: rattachements<MediateurId, CoordinateurId>(null, null),
  dispositif: Dispositif('HorsDispositif'),
}

const dependances = (
  compte: CompteASupprimer | null,
): SupprimerCompteDependances => ({
  lireLeCompteASupprimer: async () => compte,
  couperLAcces: async () => undefined,
  journaliserLEffacement: () => undefined,
  hash: () => CourrielHash('abcdefghijkl'),
  anonymiserPortefeuille: async () => ({ anonymises: 0 }),
  effacerEmpreinteRdv: async () => ({
    compteDelie: false,
    rdvsExpurges: 0,
    usagersSupprimes: 0,
  }),
  effacerNotes: async () => ({ effacees: 0 }),
  retirerLesTagsDUnCompte: async () => ({ transferes: 0, supprimes: 0 }),
  detacherDesEquipes: async () => ({
    invitationsSupprimees: 0,
    appartenancesRetirees: 0,
  }),
  retirerDesLieux: async () => ({ rattachementsSupprimes: 0 }),
  revoquerPartageStatistiques: async () => ({ partagesRevoques: 0 }),
  retirerDesListesDeDiffusion: async () => false,
})

describe('supprimer un inscrit jamais actif', () => {
  it('supprime le compte de l’inscrit', async () => {
    expect(
      await supprimerUnInscritJamaisActif(
        dependances(inscrit),
        maintenant,
      )(utilisateurId),
    ).toEqual({ success: true, data: undefined })
  })

  it('rapporte le refus de la suppression', async () => {
    expect(
      await supprimerUnInscritJamaisActif(
        dependances(null),
        maintenant,
      )(utilisateurId),
    ).toEqual({
      success: false,
      error: { _tag: 'CompteIntrouvable', utilisateurId },
    })
  })
})
