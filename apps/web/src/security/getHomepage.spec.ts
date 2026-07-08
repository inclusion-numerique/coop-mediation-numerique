import { getHomepage, getLoginRedirectUrl } from './getHomepage'

const utilisateur = ({
  role = 'User' as const,
  inscriptionValidee = null,
  mediateur = null,
  coordinateur = null,
}: {
  role?: 'Admin' | 'Support' | 'User'
  inscriptionValidee?: Date | null
  mediateur?: { id: string } | null
  coordinateur?: { id: string } | null
} = {}) => ({ role, inscriptionValidee, mediateur, coordinateur })

describe('getHomepage', () => {
  it('renvoie la landing sans utilisateur', () => {
    expect(getHomepage(null)).toBe('/')
  })

  it('renvoie l’administration pour un admin', () => {
    expect(getHomepage(utilisateur({ role: 'Admin' }))).toBe('/administration')
  })

  it('renvoie l’inscription quand elle n’est pas validée', () => {
    expect(getHomepage(utilisateur())).toBe('/inscription')
  })

  it('renvoie l’inscription quand elle est validée sans aucun profil de rôle', () => {
    expect(getHomepage(utilisateur({ inscriptionValidee: new Date() }))).toBe(
      '/inscription',
    )
  })

  it('renvoie la coop pour un médiateur inscrit', () => {
    expect(
      getHomepage(
        utilisateur({
          inscriptionValidee: new Date(),
          mediateur: { id: 'mediateur-id' },
        }),
      ),
    ).toBe('/coop')
  })

  it('renvoie la coop pour un coordinateur inscrit', () => {
    expect(
      getHomepage(
        utilisateur({
          inscriptionValidee: new Date(),
          coordinateur: { id: 'coordinateur-id' },
        }),
      ),
    ).toBe('/coop')
  })
})

describe('getLoginRedirectUrl', () => {
  it('renvoie la connexion sans utilisateur', () => {
    expect(getLoginRedirectUrl(null)).toBe('/connexion')
  })

  it('renvoie les utilisateurs de l’administration pour un admin', () => {
    expect(getLoginRedirectUrl(utilisateur({ role: 'Admin' }))).toBe(
      '/administration/utilisateurs',
    )
  })

  it('renvoie les utilisateurs de l’administration pour le support', () => {
    expect(getLoginRedirectUrl(utilisateur({ role: 'Support' }))).toBe(
      '/administration/utilisateurs',
    )
  })

  it('renvoie l’inscription quand elle n’est pas validée', () => {
    expect(getLoginRedirectUrl(utilisateur())).toBe('/inscription')
  })

  it('renvoie l’inscription quand elle est validée sans aucun profil de rôle', () => {
    expect(
      getLoginRedirectUrl(utilisateur({ inscriptionValidee: new Date() })),
    ).toBe('/inscription')
  })

  it('renvoie la coop pour un médiateur inscrit', () => {
    expect(
      getLoginRedirectUrl(
        utilisateur({
          inscriptionValidee: new Date(),
          mediateur: { id: 'mediateur-id' },
        }),
      ),
    ).toBe('/coop')
  })

  it('renvoie la coop pour un coordinateur inscrit', () => {
    expect(
      getLoginRedirectUrl(
        utilisateur({
          inscriptionValidee: new Date(),
          coordinateur: { id: 'coordinateur-id' },
        }),
      ),
    ).toBe('/coop')
  })
})
