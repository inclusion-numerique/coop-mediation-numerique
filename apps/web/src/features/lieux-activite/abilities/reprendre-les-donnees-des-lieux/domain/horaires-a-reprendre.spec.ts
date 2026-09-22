import {
  descriptionAvecLaNote,
  horairesAReprendre,
  horairesNormalises,
} from './horaires-a-reprendre'
import { lieuAReprendre } from './lieu-a-reprendre.fixture'

const verdict = (horaires: string | null) =>
  horairesAReprendre(lieuAReprendre({ horaires }))

describe('la normalisation des horaires', () => {
  it('guillemette le commentaire collé à la dernière règle', () => {
    expect(horairesNormalises('We 09:00-12:00 Mercredis semaines paires')).toBe(
      'We 09:00-12:00 "Mercredis semaines paires"',
    )
  })

  it('guillemette le commentaire pris pour une règle de plus', () => {
    expect(
      horairesNormalises(
        'Tu 13:00-19:00;Sa 10:00-18:00; Les RDV peuvent être pris en dehors',
      ),
    ).toBe(
      'Tu 13:00-19:00; Sa 10:00-18:00 "Les RDV peuvent être pris en dehors"',
    )
  })

  it('ôte le point-virgule qui traîne en fin de chaîne', () => {
    expect(horairesNormalises('Mo 08:30-12:00;Sa 08:30-12:00;')).toBe(
      'Mo 08:30-12:00; Sa 08:30-12:00',
    )
  })

  it('écrit la fermeture « off » là où la base dit « closed »', () => {
    expect(horairesNormalises('Mo 09:00-12:30; PH closed')).toBe(
      'Mo 09:00-12:30; PH off',
    )
  })

  it('ôte les deux-points entre le jour et ses plages', () => {
    expect(horairesNormalises('Mo: 08:30-12:00 ,13:30-17:00')).toBe(
      'Mo 08:30-12:00,13:30-17:00',
    )
  })

  it('réunit en un seul commentaire celui qui traîne et celui déjà guillemeté', () => {
    expect(
      horairesNormalises(
        'Mo 09:00-12:00 une semaine sur deux "sur rendez-vous"',
      ),
    ).toBe('Mo 09:00-12:00 "une semaine sur deux sur rendez-vous"')
  })

  it('espace les règles de la même façon partout', () => {
    expect(horairesNormalises('Mo 09:00-17:00;Tu 09:00-17:00')).toBe(
      'Mo 09:00-17:00; Tu 09:00-17:00',
    )
  })

  it('ne rend rien d’une note qui ne porte aucun horaire', () => {
    expect(horairesNormalises('"Sur rendez-vous uniquement"')).toBeNull()
  })
})

describe('le verdict sur les horaires d’un lieu', () => {
  it('ne reproche rien à des horaires déjà sous leur forme normale', () => {
    expect(verdict('Mo 09:00-12:00; Tu 09:00-12:00')).toBeNull()
  })

  it('ne reproche rien à un lieu sans horaires', () => {
    expect(verdict(null)).toBeNull()
  })

  it('corrige des horaires que le modèle refusait', () => {
    expect(verdict('We 09:00-12:00 Mercredis semaines paires')).toEqual({
      verdict: 'a-corriger',
      corriges: 'We 09:00-12:00 "Mercredis semaines paires"',
    })
  })

  it('corrige la forme d’horaires que le modèle acceptait déjà', () => {
    expect(verdict('Mo 09:00-17:00;Tu 09:00-17:00')).toEqual({
      verdict: 'a-corriger',
      corriges: 'Mo 09:00-17:00; Tu 09:00-17:00',
    })
  })

  it('déplace une note qui ne porte aucun horaire, en gardant la chaîne', () => {
    expect(verdict(' "Sur rendez-vous uniquement"')).toEqual({
      verdict: 'a-deplacer',
      valeur: '"Sur rendez-vous uniquement"',
      note: 'Sur rendez-vous uniquement',
    })
  })

  it('efface une suite de créneaux que rien ne rattrape', () => {
    expect(
      verdict('We-Fr 09:00-14:00-19:00; Mo,Tu 09:00-12:30,14:00-19:00'),
    ).toEqual({
      verdict: 'a-effacer',
      valeur: 'We-Fr 09:00-14:00-19:00; Mo,Tu 09:00-12:30,14:00-19:00',
    })
  })

  it('déplace une précision qui parle d’heures sans en écrire', () => {
    expect(
      verdict(
        '"Accueil sans rendez-vous : du lundi au vendredi de 9 h à 12 h."',
      ),
    ).toEqual({
      verdict: 'a-deplacer',
      valeur:
        '"Accueil sans rendez-vous : du lundi au vendredi de 9 h à 12 h."',
      note: 'Accueil sans rendez-vous : du lundi au vendredi de 9 h à 12 h.',
    })
  })

  it('ne touche jamais à des horaires que le modèle accepte', () => {
    expect(verdict('24/7')).toBeNull()
    expect(verdict('week 1-53/2 Mo 09:00-12:00')).toBeNull()
  })
})

describe('la description augmentée d’une note', () => {
  it('devient la note quand la description est vide', () => {
    expect(descriptionAvecLaNote(null, 'Sur rendez-vous')).toBe(
      'Sur rendez-vous',
    )
  })

  it('accueille la note après la description déjà écrite', () => {
    expect(descriptionAvecLaNote('Un espace ouvert.', 'Sur rendez-vous')).toBe(
      'Un espace ouvert.\n\nSur rendez-vous',
    )
  })

  it('ne redit pas une note que la description porte déjà', () => {
    expect(
      descriptionAvecLaNote('Ouvert sur rendez-vous.', 'sur rendez-vous'),
    ).toBe('Ouvert sur rendez-vous.')
  })

  it('renonce plutôt que de dépasser la longueur du détail', () => {
    expect(
      descriptionAvecLaNote('x'.repeat(10_000), 'Sur rendez-vous'),
    ).toBeNull()
  })
})
