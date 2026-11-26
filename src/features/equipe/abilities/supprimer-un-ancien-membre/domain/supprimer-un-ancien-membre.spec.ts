import { describe, expect, it } from 'vitest'
import {
  type Adhesion,
  AdhesionId,
  CoordinateurId,
  type Gestionnaire,
  MediateurId,
  UtilisateurId,
} from '../../../domain'
import type { AdhesionActive, AdhesionArchivee } from '../../../domain/adhesion'
import { supprimerUnAncienMembre } from './supprimer-un-ancien-membre'

const coordinateurId = CoordinateurId('550e8400-e29b-41d4-a716-446655440001')

const mediateurId = MediateurId('550e8400-e29b-41d4-a716-446655440011')

const adhesionActive: AdhesionActive = {
  id: AdhesionId('550e8400-e29b-41d4-a716-446655440021'),
  mediateurId,
  coordinateurId,
  depuis: new Date('2026-02-01T09:00:00Z'),
  statut: 'Active',
}

const adhesionArchivee: AdhesionArchivee = {
  id: AdhesionId('550e8400-e29b-41d4-a716-446655440022'),
  mediateurId,
  coordinateurId,
  depuis: new Date('2025-02-01T09:00:00Z'),
  statut: 'Archivee',
  archiveeLe: new Date('2025-06-01T09:00:00Z'),
}

const gestionnaire: Gestionnaire = { type: 'Coordinateur', coordinateurId }

const auteurId = UtilisateurId('550e8400-e29b-41d4-a716-446655440041')

describe('supprimer définitivement un ancien membre', () => {
  it('supprime les archives d’un ancien membre', async () => {
    const supprimer = supprimerUnAncienMembre({
      lireLesAdhesionsDeLaPaire: async () => [adhesionArchivee],
      supprimerLesAdhesionsArchivees: async () => undefined,
    })

    expect(
      await supprimer({ mediateurId, coordinateurId, gestionnaire, auteurId }),
    ).toEqual({ success: true, data: undefined })
  })

  it('est refusé à qui ne gère pas l’équipe', async () => {
    const supprimer = supprimerUnAncienMembre({
      lireLesAdhesionsDeLaPaire: async () => [adhesionArchivee],
      supprimerLesAdhesionsArchivees: async () => undefined,
    })

    expect(
      await supprimer({
        mediateurId,
        coordinateurId,
        gestionnaire: { type: 'Autre' },
        auteurId,
      }),
    ).toEqual({ success: false, error: { _tag: 'ActionNonAutorisee' } })
  })

  it.each<{ cas: string; adhesions: readonly Adhesion[]; erreur: string }>([
    {
      cas: 'est refusé tant qu’il fait partie de l’équipe',
      adhesions: [adhesionArchivee, adhesionActive],
      erreur: 'ToujoursMembre',
    },
    {
      cas: 'est refusé à qui n’a jamais été membre',
      adhesions: [],
      erreur: 'PasAncienMembre',
    },
  ])('$cas', async ({ adhesions, erreur }) => {
    const supprimer = supprimerUnAncienMembre({
      lireLesAdhesionsDeLaPaire: async () => adhesions,
      supprimerLesAdhesionsArchivees: async () => undefined,
    })

    expect(
      await supprimer({ mediateurId, coordinateurId, gestionnaire, auteurId }),
    ).toEqual({ success: false, error: { _tag: erreur } })
  })
})
