import { AdresseCourriel } from './adresse-courriel'
import {
  contactASynchroniser,
  type InscritDeLaListe,
  rolesBrevoDe,
  type SituationDansLeDispositif,
  situationDansLeDispositif,
} from './contact-brevo'
import { CoordinateurId } from './coordinateur-id'
import { Dispositif } from './dispositif'
import { MediateurId } from './mediateur-id'
import {
  type RattachementsDuCompte,
  rattachements as rattachementsDe,
} from './rattachements'
import { UtilisateurId } from './utilisateur-id'

const mediateur = MediateurId('1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8')
const coordinateur = CoordinateurId('0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f')

const rattachements = (
  m: MediateurId | null,
  c: CoordinateurId | null,
): RattachementsDuCompte => rattachementsDe(m, c)

const hors = situationDansLeDispositif(Dispositif('HorsDispositif'), false)
const conseiller = situationDansLeDispositif(
  Dispositif('ConseillerNumerique'),
  false,
)
const coordinateurDuDispositif = situationDansLeDispositif(
  Dispositif('ConseillerNumerique'),
  true,
)

const inscrit = (
  rattache: RattachementsDuCompte,
  dispositif: SituationDansLeDispositif,
): InscritDeLaListe => ({
  id: UtilisateurId('3c4d5e6f-7a8b-4c9d-8e0f-1a2b3c4d5e6f'),
  courriel: AdresseCourriel('jeanne@example.com'),
  prenom: null,
  nom: null,
  telephone: null,
  rattachements: rattache,
  dispositif,
})

describe('rôles Brevo d’un inscrit', () => {
  it('ignore une déclaration de coordinateur hors dispositif', () => {
    expect(situationDansLeDispositif(Dispositif('HorsDispositif'), true)).toBe(
      'HorsDispositif',
    )
  })

  it.each([
    [rattachements(mediateur, null), hors, ['Mediateur']],
    [
      rattachements(mediateur, null),
      conseiller,
      ['Mediateur', 'ConseillerNumerique'],
    ],
    [rattachements(null, coordinateur), hors, ['Coordinateur']],
    [
      rattachements(null, null),
      coordinateurDuDispositif,
      ['ConseillerNumerique', 'Coordinateur'],
    ],
    [
      rattachements(mediateur, coordinateur),
      coordinateurDuDispositif,
      ['Mediateur', 'ConseillerNumerique', 'Coordinateur'],
    ],
    [rattachements(null, null), hors, []],
  ])('%o en %s donne %o', (rattache, dispositif, attendus) => {
    expect(rolesBrevoDe({ rattachements: rattache, dispositif })).toEqual(
      attendus,
    )
  })

  it('importe un inscrit qui a un rôle', () => {
    expect(
      contactASynchroniser(inscrit(rattachements(mediateur, null), hors)),
    ).toEqual({
      _tag: 'AImporter',
      contact: expect.objectContaining({ roles: ['Mediateur'] }),
    })
  })

  it('retire un inscrit sans rôle', () => {
    expect(
      contactASynchroniser(inscrit(rattachements(null, null), hors)),
    ).toEqual({ _tag: 'ARetirer', courriel: 'jeanne@example.com' })
  })
})
