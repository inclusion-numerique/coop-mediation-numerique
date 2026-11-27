import { describe, expect, it } from 'vitest'
import { MediateurId } from '../../../domain/mediateur-id'
import type { DemandeurDeLExport } from './demandeur-de-l-export'
import { exporterMesStatistiques } from './exporter-mes-statistiques'

const moi = MediateurId('a0000000-0000-4000-8000-000000000001')
const autre = MediateurId('a0000000-0000-4000-8000-000000000004')

const mediateur: DemandeurDeLExport = { _tag: 'Mediateur', mediateurId: moi }

const exporter = exporterMesStatistiques({
  preparerLExport: async (perimetre: string) => `classeur de ${perimetre}`,
})

describe('exporter mes statistiques', () => {
  it('prépare l’export du périmètre du demandeur', async () => {
    expect(
      await exporter({
        demandeur: mediateur,
        perimetre: 'Mediateur',
        mediateursExportes: [moi],
      }),
    ).toEqual({ success: true, data: 'classeur de Mediateur' })
  })

  it('refuse un compte ni médiateur ni coordinateur', async () => {
    expect(
      await exporter({
        demandeur: null,
        perimetre: null,
        mediateursExportes: [],
      }),
    ).toEqual({ success: false, error: { _tag: 'ExportNonAutorise' } })
  })

  it('refuse un compte sans périmètre de statistiques', async () => {
    expect(
      await exporter({
        demandeur: mediateur,
        perimetre: null,
        mediateursExportes: [],
      }),
    ).toEqual({ success: false, error: { _tag: 'ExportNonAutorise' } })
  })

  it('refuse l’export des statistiques d’un autre médiateur', async () => {
    expect(
      await exporter({
        demandeur: mediateur,
        perimetre: 'Mediateur',
        mediateursExportes: [autre],
      }),
    ).toEqual({ success: false, error: { _tag: 'ExportDUnAutreMediateur' } })
  })
})
