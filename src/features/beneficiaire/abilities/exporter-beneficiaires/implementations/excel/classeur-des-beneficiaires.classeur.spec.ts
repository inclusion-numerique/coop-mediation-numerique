import { describe, expect, it } from 'vitest'
import { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import { CommuneResidence } from '@/features/beneficiaire/domain/commune-residence'
import { Email } from '@/features/beneficiaire/domain/email'
import { Genre, sexLabels } from '@/features/beneficiaire/domain/genre'
import { Nom } from '@/features/beneficiaire/domain/nom'
import { Prenom } from '@/features/beneficiaire/domain/prenom'
import {
  StatutSocial,
  statutSocialLabels,
} from '@/features/beneficiaire/domain/statut-social'
import {
  TrancheAge,
  trancheAgeLabels,
} from '@/features/beneficiaire/domain/tranche-age'
import type { AuteurDExport } from '@/libraries/tableur'
import { Telephone } from '@/libraries/telephone'
import type { BeneficiaireExportRow } from '../../domain/exporter-beneficiaires'
import { classeurDesBeneficiaires } from './classeur-des-beneficiaires.classeur'

const user: AuteurDExport = {
  nom: 'Médiatrice',
  prenom: 'Marie',
  role: 'Médiateur',
}

const beneficiaire: BeneficiaireExportRow = {
  nom: Nom('Dupont'),
  prenom: Prenom('Jean'),
  email: Email('jean@example.com'),
  creation: new Date('2024-01-01'),
  accompagnementsCount: 3,
  notes: null,
  telephone: Telephone('0102030405'),
  anneeNaissance: AnneeNaissance(new Date('2026-06-15T12:00:00.000Z'))(1990),
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
  const workbook = classeurDesBeneficiaires({
    beneficiaires: [beneficiaire],
    filters: { recherche: 'Dupont' },
    matchesCount: 1,
    auteur: user,
    worksheetGenerationDate: new Date('2024-06-01T10:00:00.000Z'),
  })
  const worksheet = workbook.getWorksheet(worksheetName)
  const values: string[] = []
  worksheet?.eachRow((row) => {
    row.eachCell((cell) => values.push(String(cell.value)))
  })
  return { worksheet, values }
}

describe('classeurDesBeneficiaires', () => {
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
