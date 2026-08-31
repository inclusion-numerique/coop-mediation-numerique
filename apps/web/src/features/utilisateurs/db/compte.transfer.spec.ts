import {
  AdresseCourriel,
  CoordinateurId,
  EmpreinteCourriel,
  identiteAnonyme,
  MediateurId,
  RoleUtilisateur,
  UtilisateurId,
} from '../domain'
import {
  type CompteASupprimerRow,
  compteASupprimerToDomain,
  identiteAnonymeFromDomain,
  liaisonRevoqueeFromDomain,
} from './compte.transfer'

const UTILISATEUR = '0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f'
const MEDIATEUR = '1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8'
const COORDINATEUR = '2b3c4d5e-6f70-4819-92a3-b4c5d6e7f809'

const liaisonRow = (
  jetons: Partial<CompteASupprimerRow['accounts'][number]> = {},
): CompteASupprimerRow['accounts'][number] => ({
  provider: 'proconnect',
  providerAccountId: 'sub-123',
  access_token: null,
  refresh_token: null,
  id_token: null,
  expires_at: null,
  session_state: null,
  ...jetons,
})

const row = (
  surcharge: Partial<CompteASupprimerRow> = {},
): CompteASupprimerRow => ({
  id: UTILISATEUR,
  email: 'jean.dupont@example.com',
  role: 'User',
  deleted: null,
  mediateur: null,
  coordinateur: null,
  accounts: [],
  ...surcharge,
})

describe('compteASupprimerToDomain', () => {
  it('lit le compte minimal : actif, sans rattachement, sans liaison', () => {
    const compte = compteASupprimerToDomain(row())

    expect(compte.id).toBe(UtilisateurId(UTILISATEUR))
    expect(compte.courriel).toBe(AdresseCourriel('jean.dupont@example.com'))
    expect(compte.role).toBe(RoleUtilisateur('User'))
    expect(compte.etat).toEqual({ _tag: 'actif' })
    expect(compte.rattachements).toEqual({ _tag: 'aucun' })
    expect(compte.liaisons).toEqual([])
  })

  it('lit le compte maximal : supprimé, double rôle, deux liaisons', () => {
    const depuis = new Date('2026-08-01T10:00:00.000Z')

    const compte = compteASupprimerToDomain(
      row({
        deleted: depuis,
        mediateur: { id: MEDIATEUR },
        coordinateur: { id: COORDINATEUR },
        accounts: [
          liaisonRow({ access_token: 'vivant' }),
          liaisonRow({ provider: 'email', providerAccountId: 'sub-456' }),
        ],
      }),
    )

    expect(compte.etat).toEqual({ _tag: 'supprime', depuis })
    expect(compte.rattachements).toEqual({
      _tag: 'mediateurEtCoordinateur',
      mediateurId: MediateurId(MEDIATEUR),
      coordinateurId: CoordinateurId(COORDINATEUR),
    })
    expect(compte.liaisons.map(({ acces }) => acces._tag)).toEqual([
      'actif',
      'revoque',
    ])
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

  it.each([
    ['access_token', { access_token: 'x' }],
    ['refresh_token', { refresh_token: 'x' }],
    ['id_token', { id_token: 'x' }],
    ['expires_at', { expires_at: 42 }],
    ['session_state', { session_state: 'x' }],
  ])('tient la liaison pour active si %s survit', (_, jeton) => {
    const [liaison] = compteASupprimerToDomain(
      row({ accounts: [liaisonRow(jeton)] }),
    ).liaisons

    expect(liaison?.acces).toEqual({ _tag: 'actif' })
  })
})

describe('identiteAnonymeFromDomain', () => {
  it("efface l'identité et ses résidus", () => {
    const supprimeLe = new Date('2026-08-31T12:00:00.000Z')
    const payload = identiteAnonymeFromDomain(
      identiteAnonyme(EmpreinteCourriel('abcdef012345')),
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

describe('liaisonRevoqueeFromDomain', () => {
  // Le test qui protège le contrat de résurrection : si quelqu'un ajoute un
  // jour `provider` ou `providerAccountId` à ce payload, une reconnexion
  // ProConnect ne retrouverait plus jamais le compte.
  it('ne touche que les jetons, jamais la clé du fournisseur', () => {
    const payload = liaisonRevoqueeFromDomain()

    expect(payload).toEqual({
      access_token: null,
      refresh_token: null,
      id_token: null,
      expires_at: null,
      session_state: null,
    })
    expect(Object.keys(payload)).not.toContain('provider')
    expect(Object.keys(payload)).not.toContain('providerAccountId')
  })
})
