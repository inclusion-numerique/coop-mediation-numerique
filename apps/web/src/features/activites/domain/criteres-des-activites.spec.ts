import {
  criteresDesActivites,
  estFiltre,
  parametresDe,
} from './criteres-des-activites'

const LIEU = 'a0000000-0000-4000-8000-000000000001'
const MEDIATEUR = 'b0000000-0000-4000-8000-000000000001'
const BENEFICIAIRE = 'c0000000-0000-4000-8000-000000000001'
const TAG = 'd0000000-0000-4000-8000-000000000001'

const parametresComplets = {
  du: '2026-01-01',
  au: '2026-03-31',
  types: 'individuel,collectif',
  rdvs: 'past,seen,unknown,revoked,excused,noshow',
  mediateurs: MEDIATEUR,
  beneficiaires: BENEFICIAIRE,
  communes: '69123,2A004',
  departements: '69,2A',
  lieux: LIEU,
  conseiller_numerique: '1',
  demarches_administratives: '0',
  thematiqueNonAdministratives: 'Email,AideAuxDemarchesAdministratives',
  thematiqueAdministratives: 'SocialSante',
  tags: TAG,
  structuresEmployeuses: '42,7',
  rdv: '1',
  source: 'v1',
}

describe('critères des activités', () => {
  it('ne filtre rien sans paramètre', () => {
    expect(estFiltre(criteresDesActivites({}))).toBe(false)
  })

  it('relit à l’identique les paramètres qu’il a écrits', () => {
    expect(parametresDe(criteresDesActivites(parametresComplets))).toEqual(
      parametresComplets,
    )
  })

  it('traduit le vocabulaire de l’URL dans celui du domaine', () => {
    const criteres = criteresDesActivites(parametresComplets)
    expect(criteres).toMatchObject({
      types: ['Individuel', 'Collectif'],
      statutsDeRendezVous: [
        'Passe',
        'Honore',
        'AVenir',
        'Annule',
        'AnnuleParLeBeneficiaire',
        'Absent',
      ],
      demarche: 'Sans',
      dispositif: 'ConseillersNumeriques',
      origine: 'RendezVous',
      source: 'ImportV1',
      employeuses: [42, 7],
      thematiques: ['Email', 'AideAuxDemarchesAdministratives', 'SocialSante'],
    })
  })

  it.each([
    ['types', 'individuel,inconnu', { types: ['Individuel'] }],
    ['lieux', `${LIEU}') OR 1=1 --`, { lieux: [] }],
    ['mediateurs', `${MEDIATEUR},pas-un-uuid`, { mediateurs: [MEDIATEUR] }],
    ['communes', "69123,0'; DROP TABLE activites; --", { communes: ['69123'] }],
    ['departements', "69%' OR '1'='1", { departements: [] }],
    ['tags', '', { tags: [] }],
    ['beneficiaires', ',,', { beneficiaires: [] }],
    ['structuresEmployeuses', '42,abc,-3', { employeuses: [42] }],
    ['thematiqueAdministratives', "Email'--", { thematiques: [] }],
    ['rdv', '2', { origine: null }],
    ['source', '', { source: null }],
  ])('écarte les valeurs invalides de %s', (cle, valeur, attendu) => {
    expect(criteresDesActivites({ [cle]: valeur })).toMatchObject(attendu)
  })

  it('lit un paramètre répété comme une liste', () => {
    expect(
      criteresDesActivites({ types: ['individuel', 'collectif'] }).types,
    ).toEqual(['Individuel', 'Collectif'])
  })
})
