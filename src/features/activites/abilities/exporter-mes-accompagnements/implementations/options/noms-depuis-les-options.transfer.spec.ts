import { describe, expect, it } from 'vitest'
import { CodeDepartement, CodeInsee } from '@/libraries/insee'
import { BeneficiaireId, LieuActiviteId } from '../../../../domain'
import { NomDeFiltre } from '../../domain'
import {
  beneficiairesDepuisLesOptions,
  communesEtDepartementsDepuisLesOptions,
  lieuxDepuisLesOptions,
} from './noms-depuis-les-options.transfer'

describe('noms des filtres lus dans les options des fournisseurs', () => {
  it('nomme les lieux et écarte une option illisible', () => {
    expect(
      lieuxDepuisLesOptions([
        { label: 'Médiathèque', value: 'd0000000-0000-4000-8000-000000000001' },
        { label: 'Illisible', value: 'pas-un-identifiant' },
      ]),
    ).toEqual([
      {
        id: LieuActiviteId('d0000000-0000-4000-8000-000000000001'),
        nom: NomDeFiltre('Médiathèque'),
      },
    ])
  })

  it('nomme les communes et les départements', () => {
    expect(
      communesEtDepartementsDepuisLesOptions({
        communesOptions: [{ label: 'Lyon', value: '69123' }],
        departementsOptions: [{ label: 'Rhône', value: '69' }],
      }),
    ).toEqual({
      communes: [{ codeInsee: CodeInsee('69123'), nom: NomDeFiltre('Lyon') }],
      departements: [
        { code: CodeDepartement('69'), nom: NomDeFiltre('Rhône') },
      ],
    })
  })

  it('nomme les bénéficiaires et écarte la ligne sans bénéficiaire', () => {
    expect(
      beneficiairesDepuisLesOptions([
        {
          label: 'Paul Durand',
          value: { id: 'b0000000-0000-4000-8000-000000000001' },
        },
        { label: 'Préciser la recherche', value: null },
      ]),
    ).toEqual([
      {
        id: BeneficiaireId('b0000000-0000-4000-8000-000000000001'),
        nom: NomDeFiltre('Paul Durand'),
      },
    ])
  })
})
