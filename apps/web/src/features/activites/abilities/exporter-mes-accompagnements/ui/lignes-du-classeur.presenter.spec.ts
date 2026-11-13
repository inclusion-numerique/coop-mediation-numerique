import {
  accompagnementAnonyme,
  collectifExporte,
  individuelExporte,
} from './fixtures-d-export'
import {
  entetesDuClasseur,
  lignesDuClasseur,
  nomAffiche,
  nombreDAccompagnementsExportes,
} from './lignes-du-classeur.presenter'

const PERSONNEL = { personnel: true, source: false }
const EQUIPE = { personnel: false, source: true }
const PARIS = 'Europe/Paris'

const ligneNommee = (
  colonnes: { personnel: boolean; source: boolean },
  ligne: readonly unknown[],
) =>
  Object.fromEntries(
    entetesDuClasseur(colonnes).map((entete, rang) => [entete, ligne[rang]]),
  )

describe('lignes du classeur des accompagnements', () => {
  it('nomme le bénéficiaire et ses notes dans un export personnel, sans colonnes de médiateur', () => {
    const entetes = entetesDuClasseur(PERSONNEL)
    expect(entetes).toContain('Bénéficiaire')
    expect(entetes).toContain('Notes supplémentaires')
    expect(entetes).not.toContain('Prénom du médiateur')
    expect(entetes).not.toContain('Source de la donnée')
  })

  it('décrit le médiateur et la source dans un export d’équipe, sans nom ni notes de bénéficiaire', () => {
    const entetes = entetesDuClasseur(EQUIPE)
    expect(entetes.slice(3, 7)).toEqual([
      'Prénom du médiateur',
      'Nom du médiateur',
      'Rôle',
      'ID - Conum',
    ])
    expect(entetes).not.toContain('Bénéficiaire')
    expect(entetes).not.toContain('Notes supplémentaires')
    expect(entetes.at(-2)).toBe('Source de la donnée')
    expect(entetes.at(-1)).toBe('ID CRA')
  })

  it('présente un accompagnement individuel cellule par cellule', () => {
    const [ligne] = lignesDuClasseur([individuelExporte], PERSONNEL, PARIS)
    expect(ligneNommee(PERSONNEL, ligne ?? [])).toEqual({
      Date: new Date('2026-03-09T00:00:00.000Z'),
      'Enregistré le': '09/03/2026 à 11:00',
      'Dernière modification le': '',
      Type: 'Accompagnement individuel',
      Participants: 1,
      Bénéficiaire: 'Marie Curie',
      'Canaux d’accompagnement': 'Lieu d’activité',
      'Nom du lieu': 'Médiathèque',
      Adresse: '1 rue de la République',
      Commune: 'Lyon',
      'Code postal': '69002',
      'Code Insee': '69382',
      'Durée (min)': 45,
      'Nom de l’atelier': '',
      'Matériel numérique utilisé': 'Ordinateur\nTéléphone',
      'Thématique(s) d’accompagnement': expect.stringContaining('\n'),
      Tags: 'Rentrée\nQuartier',
      'Nom de la démarche administrative': 'Carte grise',
      'Niveau d’autonomie (ou de l’atelier)': '2/3',
      'Bénéficiaire réorienté': 'Oui',
      'Structure de redirection': 'Administration (mairie, préfecture…)',
      'Commune du bénéficiaire': 'Orléans',
      'Code postal du bénéficiaire': '45100,45000',
      'Code Insee du bénéficiaire': '45234',
      'Genre du bénéficiaire': 'Féminin',
      'Tranche d’âge du bénéficiaire': '70 ans et plus',
      'Statut du bénéficiaire': 'Retraité',
      'Premier accompagnement': 'Oui',
      'Notes supplémentaires': 'Revenir avec le justificatif',
      'ID CRA': individuelExporte.id,
    })
  })

  it('numérote les participants d’un atelier et ne répète pas ses notes', () => {
    const lignes = lignesDuClasseur(
      [collectifExporte],
      { personnel: true, source: true },
      PARIS,
    )
    const nommees = lignes.map((ligne) =>
      ligneNommee({ personnel: true, source: true }, ligne),
    )
    expect(nommees.map((ligne) => ligne.Participants)).toEqual(['1/2', '2/2'])
    expect(nommees.map((ligne) => ligne.Bénéficiaire)).toEqual([
      'Marie Curie',
      'Bénéficiaire anonyme',
    ])
    expect(nommees.map((ligne) => ligne['Notes supplémentaires'])).toEqual([
      'Atelier complet',
      '',
    ])
    expect(nommees[0]).toMatchObject({
      Type: 'Atelier collectif',
      'Nom de l’atelier': 'Découvrir les réseaux sociaux',
      'Matériel numérique utilisé': 'Pas de matériel',
      'Niveau d’autonomie (ou de l’atelier)': '1/3',
      'Bénéficiaire réorienté': '',
      'Structure de redirection': '',
      'Source de la donnée': 'Espace coop (V1)',
      'Dernière modification le': '06/03/2026 à 15:15',
    })
    expect(nommees[1]).toMatchObject({
      'Commune du bénéficiaire': '',
      'Genre du bénéficiaire': 'Non communiqué',
      'Statut du bénéficiaire': 'Non communiqué ou hétérogène',
      'Premier accompagnement': 'Non',
    })
  })

  it('décrit le médiateur dans un export d’équipe', () => {
    const [conseiller] = lignesDuClasseur([individuelExporte], EQUIPE, PARIS)
    const [mediateur] = lignesDuClasseur([collectifExporte], EQUIPE, PARIS)
    expect(ligneNommee(EQUIPE, conseiller ?? [])).toMatchObject({
      'Prénom du médiateur': 'Edith',
      'Nom du médiateur': 'Piaf',
      Rôle: 'Conseiller Numérique',
      'ID - Conum': true,
      'Source de la donnée': 'La Coop de la médiation numérique (V2)',
    })
    expect(ligneNommee(EQUIPE, mediateur ?? [])).toMatchObject({
      Rôle: 'Médiateur',
      'ID - Conum': false,
    })
  })

  it('date l’enregistrement dans le fuseau du demandeur', () => {
    const [ligne] = lignesDuClasseur(
      [individuelExporte],
      PERSONNEL,
      'America/Cayenne',
    )

    expect(ligneNommee(PERSONNEL, ligne ?? [])['Enregistré le']).toBe(
      '09/03/2026 à 07:00',
    )
  })

  it('compte une ligne par accompagnement', () => {
    expect(
      nombreDAccompagnementsExportes([individuelExporte, collectifExporte]),
    ).toBe(3)
    expect(lignesDuClasseur([], PERSONNEL, PARIS)).toEqual([])
  })

  it('nomme un bénéficiaire sans prénom ni nom « Bénéficiaire anonyme »', () => {
    expect(nomAffiche(accompagnementAnonyme.beneficiaire)).toBe(
      'Bénéficiaire anonyme',
    )
  })
})
