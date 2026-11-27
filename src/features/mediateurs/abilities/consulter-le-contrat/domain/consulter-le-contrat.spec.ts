import { describe, expect, it } from 'vitest'
import { UtilisateurId } from '@/features/mediateurs/domain'
import { consulterLeContrat } from './consulter-le-contrat'
import type { LigneDeContrat } from './contrat'
import { EcheanceDuContrat } from './echeance-du-contrat'
import { TypeDeContrat } from './type-de-contrat'

const maintenant = new Date('2026-10-14')
const utilisateurId = UtilisateurId('a1b2c3d4-0000-4000-8000-000000000001')

const ligne: LigneDeContrat = {
  type: TypeDeContrat('CDD'),
  debut: new Date('2026-01-01'),
  fin: new Date('2027-12-31'),
  rupture: null,
}

const consulter = (lignes: readonly LigneDeContrat[]) =>
  consulterLeContrat({ lireLesContrats: async () => lignes })({
    utilisateurId,
    maintenant,
  })

describe('consulter le contrat', () => {
  it('ne trouve aucun contrat sans ligne', async () => {
    expect(await consulter([])).toEqual({
      success: false,
      error: { _tag: 'AucunContrat' },
    })
  })

  it('retient le contrat le plus récent', async () => {
    expect(
      await consulter([
        { ...ligne, debut: new Date('2022-01-01') },
        { ...ligne, type: TypeDeContrat('CDI'), debut: new Date('2025-01-01') },
      ]),
    ).toEqual({
      success: true,
      data: {
        type: 'CDI',
        debut: new Date('2025-01-01'),
        fin: new Date('2027-12-31'),
        echeance: 'EnCours',
      },
    })
  })

  it('ne trouve aucun contrat quand la rupture est passée', async () => {
    expect(
      await consulter([{ ...ligne, rupture: new Date('2026-06-30') }]),
    ).toEqual({ success: false, error: { _tag: 'AucunContrat' } })
  })

  it('termine le contrat à la rupture quand elle est à venir', async () => {
    expect(
      await consulter([{ ...ligne, rupture: new Date('2027-03-31') }]),
    ).toEqual({
      success: true,
      data: {
        type: 'CDD',
        debut: new Date('2026-01-01'),
        fin: new Date('2027-03-31'),
        echeance: 'EnCours',
      },
    })
  })

  it('garde le terme du contrat quand il précède la rupture', async () => {
    expect(
      await consulter([
        {
          ...ligne,
          fin: new Date('2027-03-31'),
          rupture: new Date('2027-06-30'),
        },
      ]),
    ).toEqual({
      success: true,
      data: {
        type: 'CDD',
        debut: new Date('2026-01-01'),
        fin: new Date('2027-03-31'),
        echeance: 'EnCours',
      },
    })
  })

  it.each<{
    cas: string
    fin: Date | null
    echeance: EcheanceDuContrat
  }>([
    { cas: 'sans terme', fin: null, echeance: EcheanceDuContrat('EnCours') },
    {
      cas: 'dont le terme est à plus de trois mois',
      fin: new Date('2027-12-31'),
      echeance: EcheanceDuContrat('EnCours'),
    },
    {
      cas: 'dont le terme est à moins de trois mois',
      fin: new Date('2026-12-31'),
      echeance: EcheanceDuContrat('FinProchaine'),
    },
    {
      cas: 'dont le terme est passé',
      fin: new Date('2026-06-30'),
      echeance: EcheanceDuContrat('Termine'),
    },
  ])('donne l’échéance d’un contrat $cas', async ({ fin, echeance }) => {
    expect(await consulter([{ ...ligne, fin }])).toEqual({
      success: true,
      data: { type: 'CDD', debut: new Date('2026-01-01'), fin, echeance },
    })
  })

  it('annonce la fin prochaine d’un contrat rompu dans moins de trois mois', async () => {
    expect(
      await consulter([{ ...ligne, rupture: new Date('2026-11-30') }]),
    ).toEqual({
      success: true,
      data: {
        type: 'CDD',
        debut: new Date('2026-01-01'),
        fin: new Date('2026-11-30'),
        echeance: 'FinProchaine',
      },
    })
  })

  it('préfère un contrat daté à ceux dont le début est inconnu', async () => {
    expect(
      await consulter([
        { ...ligne, type: TypeDeContrat('CDI'), debut: null },
        { ...ligne, debut: new Date('2022-01-01') },
        { ...ligne, type: TypeDeContrat('CDI'), debut: null },
      ]),
    ).toEqual({
      success: true,
      data: {
        type: 'CDD',
        debut: new Date('2022-01-01'),
        fin: new Date('2027-12-31'),
        echeance: 'EnCours',
      },
    })
  })
})
