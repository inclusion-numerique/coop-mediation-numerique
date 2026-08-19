import { type CompteRdv, MessageErreurCompte } from './compte-rdv'
import { JetonAcces, type JetonsOAuth } from './jetons-oauth'
import { RdvAgentId } from './rdv-agent-id'
import { santeDuCompte, statutIntegration } from './sante-compte'
import { UtilisateurCoopId } from './utilisateur-coop-id'

const maintenant = new Date('2026-08-17T12:00:00.000Z')

const jetons = (expiration: Date | null): JetonsOAuth => ({
  acces: JetonAcces('jeton-acces'),
  rafraichissement: null,
  expiration,
  portee: null,
})

const base = {
  agentId: RdvAgentId(4242),
  utilisateurId: UtilisateurCoopId('d10844c6-b6de-402a-a68d-f8328b1d1b0c'),
  organisationIds: [],
  organisationIdsSansWebhook: [],
  synchroniserDepuis: null,
  derniereSynchro: null,
  inclureRdvsDansActivites: false,
} as const

describe('santeDuCompte', () => {
  it('tient pour opérationnel un compte lié dont le jeton court encore', () => {
    const compte: CompteRdv = {
      ...base,
      _tag: 'lie',
      jetons: jetons(new Date('2026-08-17T18:00:00.000Z')),
    }

    expect(santeDuCompte(compte, maintenant)._tag).toBe('operationnel')
  })

  it('tient pour opérationnel un compte sans expiration connue', () => {
    const compte: CompteRdv = { ...base, _tag: 'lie', jetons: jetons(null) }

    expect(santeDuCompte(compte, maintenant)._tag).toBe('operationnel')
  })

  it('signale un jeton expiré à part, sans le confondre avec une panne', () => {
    const expiration = new Date('2026-08-17T06:00:00.000Z')
    const compte: CompteRdv = {
      ...base,
      _tag: 'lie',
      jetons: jetons(expiration),
    }

    expect(santeDuCompte(compte, maintenant)).toEqual({
      _tag: 'jetonExpire',
      depuis: expiration,
    })
  })

  it('remonte le message d’un compte en erreur', () => {
    const compte: CompteRdv = {
      ...base,
      _tag: 'enErreur',
      jetons: jetons(null),
      erreur: MessageErreurCompte('invalid_grant'),
    }

    expect(santeDuCompte(compte, maintenant)).toEqual({
      _tag: 'enErreur',
      message: 'invalid_grant',
    })
  })

  it('distingue un compte jamais lié', () => {
    expect(santeDuCompte({ ...base, _tag: 'nonLie' }, maintenant)._tag).toBe(
      'jamaisLie',
    )
  })

  it('distingue une déconnexion décidée par l’utilisateur', () => {
    const quand = new Date('2026-07-08T00:00:00.000Z')

    expect(
      santeDuCompte(
        { ...base, _tag: 'deconnecte', deconnexion: quand },
        maintenant,
      ),
    ).toEqual({ _tag: 'deconnecteParUtilisateur', quand })
  })
})

describe('statutIntegration', () => {
  it.each([
    ['operationnel', 'connecte'],
    ['jetonExpire', 'connecte'],
    ['enErreur', 'enPanne'],
    ['jamaisLie', 'enPanne'],
    ['deconnecteParUtilisateur', 'deconnecte'],
  ] as const)('pour un compte « %s » : %s', (tag, attendu) => {
    const sante =
      tag === 'enErreur'
        ? ({ _tag: 'enErreur', message: 'x' } as const)
        : tag === 'jetonExpire'
          ? ({ _tag: 'jetonExpire', depuis: maintenant } as const)
          : tag === 'deconnecteParUtilisateur'
            ? ({ _tag: 'deconnecteParUtilisateur', quand: maintenant } as const)
            : ({ _tag: tag } as const)

    expect(statutIntegration(sante)).toBe(attendu)
  })

  it('ne signale pas en panne un compte que l’utilisateur a débranché lui-même', () => {
    const compte: CompteRdv = {
      ...base,
      _tag: 'deconnecte',
      deconnexion: new Date('2026-08-01T10:00:00.000Z'),
    }

    expect(statutIntegration(santeDuCompte(compte, maintenant))).toBe(
      'deconnecte',
    )
  })

  it('ne confond pas une déconnexion voulue avec une absence d’intégration', () => {
    const compte: CompteRdv = {
      ...base,
      _tag: 'deconnecte',
      deconnexion: new Date('2026-08-01T10:00:00.000Z'),
    }

    // « jamaisConnecte » ne sort jamais de la dérivation : c'est la valeur que
    // prennent les écrans quand aucun compte n'existe. La confusion des deux
    // faisait passer pour neuf un outil que le médiateur venait de débrancher.
    expect(statutIntegration(santeDuCompte(compte, maintenant))).not.toBe(
      'jamaisConnecte',
    )
  })
})
