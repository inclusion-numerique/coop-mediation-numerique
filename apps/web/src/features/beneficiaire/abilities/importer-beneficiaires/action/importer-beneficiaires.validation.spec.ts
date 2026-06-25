import type { ParsedBeneficiaireRow } from '@app/web/beneficiaire/import/analyseImportBeneficiairesExcel'
import { ImporterBeneficiairesValidation } from './importer-beneficiaires.validation'

const row = (
  values: Partial<ParsedBeneficiaireRow['values']>,
  parsed: Partial<ParsedBeneficiaireRow['parsed']> = {},
): ParsedBeneficiaireRow => ({
  values,
  parsed: { commune: null, anneeNaissance: null, genre: null, ...parsed },
  errors: null,
})

const importe = (rows: ParsedBeneficiaireRow[]) =>
  ImporterBeneficiairesValidation.parse({ rows, status: 'ok' }).beneficiaires

describe('ImporterBeneficiairesValidation', () => {
  it('projette une ligne valide en bénéficiaire à importer', () => {
    expect(importe([row({ prenom: 'Jean', nom: 'Dupont' })])).toEqual([
      {
        prenom: 'Jean',
        nom: 'Dupont',
        contactTelephone: { _tag: 'nonRenseigne' },
        email: null,
        anneeNaissance: null,
        communeResidence: null,
        genre: 'NonCommunique',
        statutSocial: 'NonCommunique',
        notes: null,
      },
    ])
  })

  it('ignore une ligne sans prénom ou sans nom', () => {
    expect(
      importe([
        row({ prenom: 'Jean' }),
        row({ nom: 'Dupont' }),
        row({ prenom: 'Ada', nom: 'Lovelace' }),
      ]),
    ).toHaveLength(1)
  })

  it('normalise le téléphone et l’e-mail', () => {
    const [beneficiaire] = importe([
      row({
        prenom: 'Jean',
        nom: 'Dupont',
        numeroTelephone: '0102030405',
        email: 'JEAN@Example.COM',
      }),
    ])

    expect(beneficiaire.contactTelephone).toEqual({
      _tag: 'disponible',
      numero: '+33102030405',
    })
    expect(beneficiaire.email).toBe('jean@example.com')
  })

  it('tolère un e-mail invalide en l’ignorant', () => {
    const [beneficiaire] = importe([
      row({ prenom: 'Jean', nom: 'Dupont', email: 'pas-un-email' }),
    ])

    expect(beneficiaire.email).toBeNull()
  })

  it('reprend la commune et le genre déjà analysés', () => {
    const [beneficiaire] = importe([
      row(
        { prenom: 'Jean', nom: 'Dupont' },
        {
          commune: { nom: 'Lyon', codePostal: '69001', codeInsee: '69381' },
          genre: 'Masculin',
        },
      ),
    ])

    expect(beneficiaire.communeResidence).toEqual({
      commune: 'Lyon',
      codePostal: '69001',
      codeInsee: '69381',
    })
    expect(beneficiaire.genre).toBe('Masculin')
  })
})
