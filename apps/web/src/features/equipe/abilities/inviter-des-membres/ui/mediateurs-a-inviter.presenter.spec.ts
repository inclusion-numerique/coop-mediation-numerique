import { Email, MediateurId } from '../../../domain'
import {
  issueDeLInvitation,
  messagesDe,
  rechercheTropCourte,
  suggestionsDe,
} from './mediateurs-a-inviter.presenter'

const mediateur = {
  mediateurId: MediateurId('1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8'),
  nom: 'Edith Piaf',
  email: Email('edith@piaf.com'),
  conseillerNumerique: true,
}

describe('rechercheTropCourte', () => {
  it('exige au moins 3 caractères hors espaces', () => {
    expect(rechercheTropCourte(' ed ')).toBe(true)
    expect(rechercheTropCourte('edi')).toBe(false)
  })
})

describe('suggestionsDe', () => {
  const aucun = { mediateurs: [], total: 0 }

  it('propose les médiateurs trouvés', () => {
    expect(
      suggestionsDe({
        recherche: 'edith',
        trouves: { mediateurs: [mediateur], total: 1 },
        dejaChoisis: [],
      }).items,
    ).toEqual([{ _tag: 'Mediateur', ...mediateur }])
  })

  it('propose aussi la saisie quand elle est un email', () => {
    expect(
      suggestionsDe({
        recherche: ' Leo@Med.fr ',
        trouves: aucun,
        dejaChoisis: [],
      }).items,
    ).toEqual([{ _tag: 'Email', email: 'leo@med.fr' }])
  })

  it("ne propose pas une saisie qui n'est pas un email", () => {
    expect(
      suggestionsDe({ recherche: 'leo', trouves: aucun, dejaChoisis: [] })
        .items,
    ).toEqual([])
  })

  it("ne propose pas la saisie quand elle est l'email d'un médiateur trouvé", () => {
    expect(
      suggestionsDe({
        recherche: 'Edith@Piaf.com',
        trouves: { mediateurs: [mediateur], total: 1 },
        dejaChoisis: [],
      }).items,
    ).toEqual([{ _tag: 'Mediateur', ...mediateur }])
  })

  it('ne propose ni ne compte les personnes déjà choisies', () => {
    expect(
      suggestionsDe({
        recherche: 'edith',
        trouves: { mediateurs: [mediateur], total: 1 },
        dejaChoisis: [{ _tag: 'Email', email: Email('edith@piaf.com') }],
      }),
    ).toMatchObject({ items: [], total: 0, affiches: 0 })
  })

  it('garde la saisie libre quand la recherche est indisponible', () => {
    expect(
      suggestionsDe({
        recherche: 'leo@med.fr',
        trouves: null,
        dejaChoisis: [],
      }),
    ).toMatchObject({
      items: [{ _tag: 'Email', email: 'leo@med.fr' }],
      enEchec: true,
    })
  })

  it("ne tient pas pour un échec une recherche qu'on n'a pas lancée", () => {
    expect(
      suggestionsDe({ recherche: 'le', trouves: null, dejaChoisis: [] })
        .enEchec,
    ).toBe(false)
  })
})

describe('messagesDe', () => {
  const etat = {
    recherche: 'edith',
    enCours: false,
    enEchec: false,
    total: 0,
    affiches: 0,
  }

  it('se tait pendant la recherche', () => {
    expect(messagesDe({ ...etat, enCours: true })).toEqual([])
  })

  it('demande au moins 3 caractères', () => {
    expect(messagesDe({ ...etat, recherche: 'ed' })).toEqual([
      'La recherche doit contenir au moins 3 caractères',
    ])
  })

  it('signale une recherche indisponible', () => {
    expect(messagesDe({ ...etat, enEchec: true })).toEqual([
      'La recherche est indisponible, veuillez réessayer',
    ])
  })

  it('accorde zéro médiateur trouvé au singulier', () => {
    expect(messagesDe(etat)).toEqual(['0 médiateur trouvé'])
  })

  it('signale les médiateurs au-delà de la page', () => {
    expect(messagesDe({ ...etat, total: 12, affiches: 10 })).toEqual([
      '12 médiateurs trouvés',
      'Veuillez préciser votre recherche - 2 médiateurs ne sont pas affichés',
    ])
  })
})

describe('issueDeLInvitation', () => {
  const sansEchec = { envoyees: [], ecartees: [], echecs: [] }

  it('nomme la personne invitée seule', () => {
    expect(
      issueDeLInvitation([{ _tag: 'Mediateur', ...mediateur }], sansEchec),
    ).toEqual({
      priority: 'success',
      message: 'Un email d’invitation a été envoyé à Edith Piaf',
    })
  })

  it('reste général pour plusieurs personnes', () => {
    expect(
      issueDeLInvitation(
        [
          { _tag: 'Mediateur', ...mediateur },
          { _tag: 'Email', email: Email('leo@med.fr') },
        ],
        sansEchec,
      ),
    ).toEqual({
      priority: 'success',
      message:
        'Un email d’invitation a été envoyé aux membres que vous souhaitez ajouter à votre équipe',
    })
  })

  it('avertit des emails qui ne sont pas partis', () => {
    expect(
      issueDeLInvitation([{ _tag: 'Mediateur', ...mediateur }], {
        ...sansEchec,
        echecs: [Email('edith@piaf.com')],
      }),
    ).toEqual({
      priority: 'warning',
      message:
        'L’invitation est enregistrée, mais l’email n’a pas pu être envoyé à edith@piaf.com : vous pourrez la relancer depuis votre équipe.',
    })
  })
})
