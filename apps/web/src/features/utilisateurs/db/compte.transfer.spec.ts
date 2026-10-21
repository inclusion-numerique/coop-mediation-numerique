import {
  AdresseCourriel,
  CoordinateurId,
  CourrielHash,
  identiteAnonyme,
  MediateurId,
  RoleUtilisateur,
  UtilisateurId,
} from '../domain'
import {
  type CompteASupprimerRow,
  compteASupprimerToDomain,
  identiteAnonymeFromDomain,
} from './compte.transfer'

const UTILISATEUR = '0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f'
const MEDIATEUR = '1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8'
const COORDINATEUR = '2b3c4d5e-6f70-4819-92a3-b4c5d6e7f809'

const row = (
  surcharge: Partial<CompteASupprimerRow> = {},
): CompteASupprimerRow => ({
  id: UTILISATEUR,
  email: 'jean.dupont@example.com',
  role: 'User',
  deleted: null,
  mediateur: null,
  coordinateur: null,
  ...surcharge,
})

describe('compteASupprimerToDomain', () => {
  it('lit le compte minimal : actif, sans rattachement', () => {
    const compte = compteASupprimerToDomain(row())

    expect(compte.id).toBe(UtilisateurId(UTILISATEUR))
    expect(compte.courriel).toBe(AdresseCourriel('jean.dupont@example.com'))
    expect(compte.role).toBe(RoleUtilisateur('User'))
    expect(compte.etat).toEqual({ _tag: 'actif' })
    expect(compte.rattachements).toEqual({ _tag: 'aucun' })
  })

  it('lit le compte maximal : supprimé, double rôle', () => {
    const depuis = new Date('2026-08-01T10:00:00.000Z')

    const compte = compteASupprimerToDomain(
      row({
        deleted: depuis,
        mediateur: { id: MEDIATEUR },
        coordinateur: { id: COORDINATEUR },
      }),
    )

    expect(compte.etat).toEqual({ _tag: 'supprime', depuis })
    expect(compte.rattachements).toEqual({
      _tag: 'mediateurEtCoordinateur',
      mediateur: MediateurId(MEDIATEUR),
      coordinateur: CoordinateurId(COORDINATEUR),
    })
  })

  it.each([
    ['aucun', null, null],
    ['mediateur', { id: MEDIATEUR }, null],
    ['coordinateur', null, { id: COORDINATEUR }],
    ['mediateurEtCoordinateur', { id: MEDIATEUR }, { id: COORDINATEUR }],
  ])('reconnaît le rattachement %s', (attendu, mediateur, coordinateur) => {
    expect(
      compteASupprimerToDomain(row({ mediateur, coordinateur })).rattachements
        ._tag,
    ).toBe(attendu)
  })
})

describe('identiteAnonymeFromDomain', () => {
  it("efface l'identité et ses résidus", () => {
    const supprimeLe = new Date('2026-08-31T12:00:00.000Z')
    const payload = identiteAnonymeFromDomain(
      identiteAnonyme(CourrielHash('abcdef012345')),
      supprimeLe,
    )

    expect(payload).toEqual({
      deleted: supprimeLe,
      email: 'deleted+abcdef012345@coop-numerique.anct.gouv.fr',
      firstName: 'Utilisateur',
      lastName: 'Supprimé',
      name: 'Utilisateur Supprimé',
      phone: null,
      siret: null,
      location: null,
      title: null,
      description: null,
      image: { disconnect: true },
    })
  })
})
