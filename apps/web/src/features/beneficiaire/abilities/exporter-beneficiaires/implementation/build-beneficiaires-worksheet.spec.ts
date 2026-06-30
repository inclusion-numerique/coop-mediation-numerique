import { AnneeNaissance } from '@app/web/features/beneficiaire/domain/annee-naissance'
import { CommuneResidence } from '@app/web/features/beneficiaire/domain/commune-residence'
import { Email } from '@app/web/features/beneficiaire/domain/email'
import { Genre, sexLabels } from '@app/web/features/beneficiaire/domain/genre'
import { Nom } from '@app/web/features/beneficiaire/domain/nom'
import { Prenom } from '@app/web/features/beneficiaire/domain/prenom'
import {
  StatutSocial,
  statutSocialLabels,
} from '@app/web/features/beneficiaire/domain/statut-social'
import { Telephone } from '@app/web/features/beneficiaire/domain/telephone'
import {
  TrancheAge,
  trancheAgeLabels,
} from '@app/web/features/beneficiaire/domain/tranche-age'
import type { WorksheetUser } from '@app/web/libs/worksheet/addExportMetadata'
import type { BeneficiaireExportRow } from '../domain/exporter-beneficiaires'
import { buildBeneficiairesWorksheet } from './build-beneficiaires-worksheet'

const user: WorksheetUser = {
  id: '00000000-0000-0000-0000-000000000000',
  firstName: 'Marie',
  lastName: 'Médiatrice',
  role: 'User',
  coordinateur: null,
  emplois: [],
  isConseillerNumerique: false,
  mediateur: { id: '00000000-0000-0000-0000-000000000001' },
}

const beneficiaire: BeneficiaireExportRow = {
  nom: Nom('Dupont'),
  prenom: Prenom('Jean'),
  email: Email('jean@example.com'),
  creation: new Date('2024-01-01'),
  accompagnementsCount: 3,
  notes: null,
  telephone: Telephone('0102030405'),
  anneeNaissance: AnneeNaissance(1990),
  trancheAge: TrancheAge('VingtCinqTrenteNeuf'),
  genre: Genre('Masculin'),
  statutSocial: StatutSocial('EnEmploi'),
  communeResidence: CommuneResidence({
    commune: 'Paris',
    codePostal: '75001',
    codeInsee: '75101',
  }),
}

const cellValues = (worksheetName: string) => {
  const workbook = buildBeneficiairesWorksheet({
    beneficiaires: [beneficiaire],
    filters: { recherche: 'Dupont' },
    matchesCount: 1,
    user,
    worksheetGenerationDate: new Date('2024-06-01T10:00:00.000Z'),
  })
  const worksheet = workbook.getWorksheet(worksheetName)
  const values: string[] = []
  worksheet?.eachRow((row) => {
    row.eachCell((cell) => values.push(String(cell.value)))
  })
  return { worksheet, values }
}

describe('buildBeneficiairesWorksheet', () => {
  it('produces a "Bénéficiaires" worksheet', () => {
    const { worksheet } = cellValues('Bénéficiaires')
    expect(worksheet).toBeDefined()
  })

  it('writes the beneficiaire identity and commune', () => {
    const { values } = cellValues('Bénéficiaires')
    expect(values).toEqual(
      expect.arrayContaining(['Dupont', 'Jean', 'Paris', '75001', '75101']),
    )
  })

  it('maps the demographic enums to their labels', () => {
    const { values } = cellValues('Bénéficiaires')
    expect(values).toEqual(
      expect.arrayContaining([
        sexLabels.Masculin,
        trancheAgeLabels.VingtCinqTrenteNeuf,
        statutSocialLabels.EnEmploi,
      ]),
    )
  })

  it('echoes the applied search filter', () => {
    const { values } = cellValues('Bénéficiaires')
    expect(values).toContain('Dupont')
    expect(values).toContain('Recherche')
  })
})
