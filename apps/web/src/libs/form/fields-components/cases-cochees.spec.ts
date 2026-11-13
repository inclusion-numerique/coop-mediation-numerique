import { casesCochees } from './cases-cochees'

describe('cases cochées', () => {
  it('ajoute la case cochée aux précédentes', () => {
    expect(casesCochees(['Ordinateur'], 'Telephone', [])).toEqual([
      'Ordinateur',
      'Telephone',
    ])
  })

  it('ne garde que la case exclusive quand on la coche', () => {
    expect(
      casesCochees(['Ordinateur', 'Telephone'], 'Aucun', ['Aucun']),
    ).toEqual(['Aucun'])
  })

  it('retire la case exclusive quand on coche une autre case', () => {
    expect(casesCochees(['Aucun'], 'Tablette', ['Aucun'])).toEqual(['Tablette'])
  })

  it('garde les cases ordinaires quand aucune exclusive n’est cochée', () => {
    expect(casesCochees(['Ordinateur'], 'Autre', ['Aucun'])).toEqual([
      'Ordinateur',
      'Autre',
    ])
  })
})
