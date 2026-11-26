import { describe, expect, it } from 'vitest'
import { Genre } from '@/features/beneficiaire/domain/genre'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { Nom } from '@/features/beneficiaire/domain/nom'
import { Prenom } from '@/features/beneficiaire/domain/prenom'
import { StatutSocial } from '@/features/beneficiaire/domain/statut-social'
import { TrancheAge } from '@/features/beneficiaire/domain/tranche-age'
import {
  type BeneficiaireExportRow,
  exporterBeneficiaires,
} from './exporter-beneficiaires'

const lea: BeneficiaireExportRow = {
  nom: Nom('Martin'),
  prenom: Prenom('Léa'),
  email: null,
  creation: new Date('2026-01-15T10:00:00.000Z'),
  accompagnementsCount: 3,
  notes: null,
  telephone: null,
  anneeNaissance: null,
  trancheAge: TrancheAge('NonCommunique'),
  genre: Genre('Feminin'),
  statutSocial: StatutSocial('NonCommunique'),
  communeResidence: null,
}

describe('exporter les bénéficiaires', () => {
  it('construit le classeur avec tous les bénéficiaires du médiateur et leur nombre', async () => {
    const exporter = exporterBeneficiaires({
      listerBeneficiaires: async () => ({ items: [lea], totalItems: 1 }),
      construireLeClasseur: (classeur) => classeur,
    })

    expect(
      await exporter({
        mediateurId: MediateurId('8a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d'),
        filters: {},
        auteur: 'Camille Martin',
      }),
    ).toEqual({
      beneficiaires: [lea],
      filters: {},
      matchesCount: 1,
      auteur: 'Camille Martin',
    })
  })

  it('reporte la recherche demandée dans le classeur', async () => {
    const exporter = exporterBeneficiaires({
      listerBeneficiaires: async () => ({ items: [lea], totalItems: 1 }),
      construireLeClasseur: (classeur) => classeur,
    })

    expect(
      await exporter({
        mediateurId: MediateurId('8a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d'),
        filters: { recherche: 'Léa' },
        auteur: 'Camille Martin',
      }),
    ).toEqual({
      beneficiaires: [lea],
      filters: { recherche: 'Léa' },
      matchesCount: 1,
      auteur: 'Camille Martin',
    })
  })
})
