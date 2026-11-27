import { describe, expect, it } from 'vitest'
import { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import { TrancheAge } from '@/features/beneficiaire/domain/tranche-age'
import { trancheAgeAffichee } from './tranche-age-affichee.presenter'

const maintenant = new Date('2026-06-15T12:00:00.000Z')

describe('tranche d’âge affichée sur la fiche', () => {
  it.each<{
    cas: string
    anneeNaissance: AnneeNaissance | null
    trancheAge: TrancheAge | null
    affichee: string
  }>([
    {
      cas: 'déduit la tranche de l’année de naissance',
      anneeNaissance: AnneeNaissance(maintenant)(1996),
      trancheAge: TrancheAge('SoixanteDixPlus'),
      affichee: '25 - 39 ans',
    },
    {
      cas: 'affiche la tranche saisie sans année de naissance',
      anneeNaissance: null,
      trancheAge: TrancheAge('DouzeDixHuit'),
      affichee: '12 - 17 ans',
    },
    {
      cas: 'affiche un tiret sans année ni tranche',
      anneeNaissance: null,
      trancheAge: null,
      affichee: '-',
    },
  ])('$cas', ({ anneeNaissance, trancheAge, affichee }) => {
    expect(trancheAgeAffichee({ anneeNaissance, trancheAge }, maintenant)).toBe(
      affichee,
    )
  })
})
