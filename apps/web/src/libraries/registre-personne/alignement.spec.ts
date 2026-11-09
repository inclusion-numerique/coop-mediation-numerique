import {
  alignementDe,
  aUneAutreSource,
  type CompteCoop,
  type LigneDuRegistre,
} from './alignement'

const maintenant = new Date('2026-11-05T12:00:00.000Z')
const supprimeLe = new Date('2026-11-01T12:00:00.000Z')

const compte = (surcharge: Partial<CompteCoop> = {}): CompteCoop => ({
  email: 'camille@example.org',
  firstName: 'Camille',
  lastName: 'Martin',
  phone: '+33612345678',
  deleted: null,
  mediateur: {},
  coordinateur: null,
  ...surcharge,
})

const ligneAlignee = (surcharge: Partial<LigneDuRegistre> = {}) => ({
  nom: 'MARTIN',
  prenom: 'Camille',
  contact: {
    coop: { email: 'camille@example.org', telephone: '+33612345678' },
  },
  cnPgId: null,
  conseillerNumeriqueId: null,
  aidantConnectId: null,
  aUneAffectationIdposte: false,
  isMediateur: true,
  isCoordinateur: false,
  deletedAt: null,
  deletedBy: null,
  ...surcharge,
})

const aligner = (
  surchargeCompte: Partial<CompteCoop>,
  surchargeLigne: Partial<LigneDuRegistre>,
) =>
  alignementDe({
    compte: compte(surchargeCompte),
    ligne: ligneAlignee(surchargeLigne),
    maintenant,
  })

const contactIdposte = { idposte: { mail_pro: 'camille@structure.fr' } }

describe('alignement d’une ligne du registre sur son compte Coop', () => {
  it('n’écrit rien sur une ligne déjà alignée', () => {
    expect(aligner({}, {})).toBeNull()
  })

  it('signe toute écriture au nom de la Coop', () => {
    expect(aligner({ lastName: 'Durand' }, {})).toEqual({
      nom: 'DURAND',
      editedBy: 'coop',
      updatedAtCoop: maintenant,
    })
  })

  describe('le nom et le prénom', () => {
    it('renseigne une identité vide, normalisée', () => {
      expect(
        aligner(
          { firstName: 'jean-luc', lastName: 'Martin' },
          { nom: null, prenom: null },
        ),
      ).toMatchObject({ nom: 'MARTIN', prenom: 'Jean-Luc' })
    })

    it('ne voit pas d’écart dans une simple différence de casse', () => {
      expect(
        aligner({ firstName: 'CAMILLE', lastName: 'martin' }, {}),
      ).toBeNull()
    })

    it('ne touche pas à la colonne quand la Coop n’a pas de valeur valable', () => {
      expect(
        aligner({ lastName: null, firstName: 'a'.repeat(51) }, {}),
      ).toBeNull()
    })

    it.each([
      [
        'bloc idposte',
        {
          contact: {
            ...contactIdposte,
            coop: { email: 'camille@example.org', telephone: '+33612345678' },
          },
        },
      ],
      ['identifiant CN', { cnPgId: 12 }],
      ['ancien identifiant CN', { conseillerNumeriqueId: 'abc' }],
      ['affectation idposte', { aUneAffectationIdposte: true }],
    ])(
      'n’écrase pas l’identité d’une ligne venue d’idposte, mais la complète : %s',
      (_, surcharge) => {
        expect(
          aligner(
            { firstName: 'Alex', lastName: 'Durand' },
            { nom: 'LEROY', prenom: 'Sacha', ...surcharge },
          ),
        ).toBeNull()
        expect(
          aligner(
            { firstName: 'Alex', lastName: 'Durand' },
            { nom: null, prenom: 'Sacha', ...surcharge },
          ),
        ).toMatchObject({ nom: 'DURAND' })
        expect(
          aligner(
            { firstName: 'Alex', lastName: 'Durand' },
            { nom: null, prenom: 'Sacha', ...surcharge },
          ),
        ).not.toHaveProperty('prenom')
      },
    )

    it('reprend l’identité d’une ligne venue seulement d’Aidants Connect', () => {
      expect(
        aligner(
          { firstName: 'Camille Andrée' },
          { prenom: 'Camille', aidantConnectId: 34 },
        ),
      ).toMatchObject({ prenom: 'Camille Andrée' })
    })
  })

  describe('le contact', () => {
    it('corrige le courriel à partir du compte relié', () => {
      expect(aligner({ email: 'nouveau@example.org' }, {})).toMatchObject({
        contact: {
          coop: { email: 'nouveau@example.org', telephone: '+33612345678' },
        },
      })
    })

    it('reporte un téléphone modifié', () => {
      expect(aligner({ phone: '+33698765432' }, {})).toMatchObject({
        contact: {
          coop: { email: 'camille@example.org', telephone: '+33698765432' },
        },
      })
    })

    it('retire un téléphone supprimé', () => {
      expect(aligner({ phone: null }, {})?.contact).toEqual({
        coop: { email: 'camille@example.org' },
      })
    })

    it('préserve les blocs des autres sources', () => {
      expect(
        aligner(
          { email: 'nouveau@example.org', phone: null },
          { contact: { ...contactIdposte, telephone: '+33100000000' } },
        )?.contact,
      ).toEqual({
        ...contactIdposte,
        telephone: '+33100000000',
        coop: { email: 'nouveau@example.org' },
      })
    })

    it('crée le bloc coop d’une ligne sans contact', () => {
      expect(aligner({ phone: null }, { contact: null })?.contact).toEqual({
        coop: { email: 'camille@example.org' },
      })
    })
  })

  describe('les rôles', () => {
    it('reporte le rôle médiateur', () => {
      expect(aligner({}, { isMediateur: null })).toMatchObject({
        isMediateur: true,
      })
    })

    it('tient un coordinateur pour médiateur', () => {
      expect(
        aligner(
          { mediateur: null, coordinateur: {} },
          { isMediateur: null, isCoordinateur: null },
        ),
      ).toMatchObject({ isMediateur: true, isCoordinateur: true })
    })

    it('retire un rôle perdu sur une ligne purement Coop', () => {
      expect(
        aligner(
          { mediateur: null },
          { isMediateur: true, isCoordinateur: true },
        ),
      ).toMatchObject({ isMediateur: false, isCoordinateur: false })
    })

    it('garde le rôle posé par le dispositif tant que la Coop ne l’a pas encore', () => {
      const alignement = aligner(
        { mediateur: null },
        {
          contact: {
            ...contactIdposte,
            coop: { email: 'camille@example.org', telephone: '+33612345678' },
          },
          isMediateur: true,
          isCoordinateur: true,
        },
      )

      expect(alignement).toBeNull()
    })
  })

  describe('la suppression du compte', () => {
    const anonyme = {
      email: 'deleted+abc@coop-numerique.anct.gouv.fr',
      firstName: 'Utilisateur',
      lastName: 'Supprimé',
      phone: null,
      deleted: supprimeLe,
    }

    it('recopie l’anonymisation sur une ligne purement Coop', () => {
      expect(aligner(anonyme, {})).toMatchObject({
        nom: 'SUPPRIMÉ',
        prenom: 'Utilisateur',
        contact: { coop: { email: anonyme.email } },
        deletedAt: supprimeLe,
        deletedBy: ['coop'],
      })
    })

    it('garde le nom d’une ligne qui a une autre source, mais anonymise le bloc coop', () => {
      const alignement = aligner(anonyme, {
        contact: { ...contactIdposte, coop: { email: 'camille@example.org' } },
      })

      expect(alignement).not.toHaveProperty('nom')
      expect(alignement).not.toHaveProperty('prenom')
      expect(alignement?.contact).toEqual({
        ...contactIdposte,
        coop: { email: anonyme.email },
      })
      expect(alignement).toMatchObject({
        deletedAt: supprimeLe,
        deletedBy: ['coop'],
      })
    })

    it('s’ajoute à la suppression d’une autre source sans reculer la date', () => {
      const plusRecent = new Date('2026-11-03T12:00:00.000Z')

      const alignement = aligner(anonyme, {
        deletedAt: plusRecent,
        deletedBy: ['aidants-connect'],
      })

      expect(alignement).toMatchObject({
        deletedBy: ['aidants-connect', 'coop'],
      })
      expect(alignement).not.toHaveProperty('deletedAt')
    })

    it('lève sa marque quand la ligne revient à un compte vivant', () => {
      expect(
        aligner({}, { deletedAt: supprimeLe, deletedBy: ['coop'] }),
      ).toMatchObject({ deletedAt: null, deletedBy: [] })
    })

    it('laisse la marque d’une autre source', () => {
      expect(
        aligner(
          {},
          {
            deletedAt: supprimeLe,
            deletedBy: ['aidants-connect', 'coop'],
          },
        ),
      ).toMatchObject({ deletedBy: ['aidants-connect'] })

      expect(
        aligner({}, { deletedAt: supprimeLe, deletedBy: ['aidants-connect'] }),
      ).toBeNull()
    })
  })
})

describe('une autre source que la Coop', () => {
  it.each([
    ['identifiant CN', { cnPgId: 12 }],
    ['ancien identifiant CN', { conseillerNumeriqueId: 'abc' }],
    ['identifiant Aidants Connect', { aidantConnectId: 34 }],
    ['bloc idposte', { contact: contactIdposte }],
    ['affectation idposte', { aUneAffectationIdposte: true }],
  ])('se lit dans : %s', (_, surcharge) => {
    expect(aUneAutreSource(ligneAlignee(surcharge))).toBe(true)
  })

  it('manque à une ligne purement Coop', () => {
    expect(aUneAutreSource(ligneAlignee())).toBe(false)
  })
})
