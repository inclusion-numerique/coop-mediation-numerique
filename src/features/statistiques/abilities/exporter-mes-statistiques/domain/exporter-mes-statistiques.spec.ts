import { describe, expect, it } from 'vitest'
import { MediateurId } from '../../../domain/mediateur-id'
import type { DemandeurDeLExport } from './demandeur-de-l-export'
import { exporterMesStatistiques } from './exporter-mes-statistiques'

const moi = MediateurId('a0000000-0000-4000-8000-000000000001')
const coordonne = MediateurId('a0000000-0000-4000-8000-000000000002')
const ancien = MediateurId('a0000000-0000-4000-8000-000000000003')
const autre = MediateurId('a0000000-0000-4000-8000-000000000004')

const mediateurCoordinateur: DemandeurDeLExport = {
  _tag: 'MediateurEtCoordinateur',
  mediateurId: moi,
  coordonnes: [coordonne, ancien],
}

const coordinateurSeul: DemandeurDeLExport = {
  _tag: 'Coordinateur',
  coordonnes: [coordonne, ancien],
}

const mediateurSeul: DemandeurDeLExport = {
  _tag: 'Mediateur',
  mediateurId: moi,
}

const perimetre = 'périmètre du demandeur'

const exporter = exporterMesStatistiques({
  preparerLExport: async (perimetreExporte: string) => perimetreExporte,
})

const prepare = { success: true, data: perimetre }

const nonAutorise = { success: false, error: { _tag: 'ExportNonAutorise' } }

const dUnAutre = {
  success: false,
  error: { _tag: 'ExportDUnAutreMediateur' },
}

describe('exporter mes statistiques', () => {
  it.each<{
    cas: string
    demandeur: DemandeurDeLExport
    mediateursExportes: readonly MediateurId[]
    attendu: unknown
  }>([
    {
      cas: 'sans médiateur demandé',
      demandeur: mediateurCoordinateur,
      mediateursExportes: [],
      attendu: prepare,
    },
    {
      cas: 'de ses propres statistiques',
      demandeur: mediateurCoordinateur,
      mediateursExportes: [moi],
      attendu: prepare,
    },
    {
      cas: 'd’un médiateur coordonné',
      demandeur: mediateurCoordinateur,
      mediateursExportes: [coordonne],
      attendu: prepare,
    },
    {
      cas: 'd’un ancien médiateur coordonné',
      demandeur: mediateurCoordinateur,
      mediateursExportes: [ancien],
      attendu: prepare,
    },
    {
      cas: 'd’un autre médiateur',
      demandeur: mediateurCoordinateur,
      mediateursExportes: [autre],
      attendu: dUnAutre,
    },
    {
      cas: 'qui mêle un médiateur autorisé et un autre',
      demandeur: mediateurCoordinateur,
      mediateursExportes: [coordonne, autre],
      attendu: dUnAutre,
    },
    {
      cas: 'de ses statistiques par un médiateur sans coordination',
      demandeur: mediateurSeul,
      mediateursExportes: [moi],
      attendu: prepare,
    },
    {
      cas: 'd’un autre médiateur par un médiateur sans coordination',
      demandeur: mediateurSeul,
      mediateursExportes: [coordonne],
      attendu: dUnAutre,
    },
    {
      cas: 'd’un médiateur coordonné par un coordinateur',
      demandeur: coordinateurSeul,
      mediateursExportes: [coordonne],
      attendu: prepare,
    },
    {
      cas: 'd’un médiateur hors de son équipe par un coordinateur',
      demandeur: coordinateurSeul,
      mediateursExportes: [autre],
      attendu: dUnAutre,
    },
  ])(
    'décide de l’export $cas',
    async ({ demandeur, mediateursExportes, attendu }) => {
      expect(
        await exporter({ demandeur, perimetre, mediateursExportes }),
      ).toEqual(attendu)
    },
  )

  it('refuse un compte ni médiateur ni coordinateur', async () => {
    expect(
      await exporter({
        demandeur: null,
        perimetre: null,
        mediateursExportes: [],
      }),
    ).toEqual(nonAutorise)
  })

  it('refuse un compte sans périmètre de statistiques', async () => {
    expect(
      await exporter({
        demandeur: mediateurSeul,
        perimetre: null,
        mediateursExportes: [],
      }),
    ).toEqual(nonAutorise)
  })
})
