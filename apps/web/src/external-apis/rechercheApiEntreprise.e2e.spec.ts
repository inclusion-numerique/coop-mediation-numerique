import { previewBranchAuthFallbacks } from '@app/web/auth/previewBranchAuthFallbacks'
import { rechercheApiEntrepriseE2e } from './rechercheApiEntreprise.e2e'

describe('doublure e2e de la recherche d’entreprises', () => {
  it('résout le SIRET que portent les utilisateurs d’inscription', () => {
    const { results, total_results } = rechercheApiEntrepriseE2e({
      q: previewBranchAuthFallbacks.anctSiret,
      page: 1,
      per_page: 1,
    })

    expect(total_results).toBe(1)
    expect(results.at(0)?.nom_raison_sociale).toBe(
      'AGENCE NATIONALE DE LA COHESION DES TERRITOIRES',
    )
  })

  it('expose l’établissement correspondant au SIRET demandé', () => {
    const { results } = rechercheApiEntrepriseE2e({
      q: previewBranchAuthFallbacks.anctSiret,
      page: 1,
      per_page: 1,
    })

    const etablissement = results
      .at(0)
      ?.matching_etablissements.find(
        ({ siret }) => siret === previewBranchAuthFallbacks.anctSiret,
      )

    expect(etablissement?.etat_administratif).toBe('A')
    expect(etablissement?.libelle_commune).toBe('PARIS')
  })

  // La structure employeuse de fixture est choisie à la main pendant
  // l'inscription : son SIRET doit se résoudre comme celui de l'ANCT.
  it('résout aussi le SIRET de la structure employeuse de fixture', () => {
    expect(
      rechercheApiEntrepriseE2e({ q: '13002526500013', page: 1, per_page: 1 })
        .total_results,
    ).toBe(1)
  })

  // « Introuvable » est un cas que les parcours doivent tenir : la doublure le
  // rend comme l'API, par zéro résultat et non par une erreur.
  it('rend zéro résultat pour un SIRET inconnu, sans lever', () => {
    const { results, total_results } = rechercheApiEntrepriseE2e({
      q: '00000000000000',
      page: 1,
      per_page: 1,
    })

    expect(total_results).toBe(0)
    expect(results).toEqual([])
  })
})
