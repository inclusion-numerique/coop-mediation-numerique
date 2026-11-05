import type { ApercuDeLaSynchronisation } from '@app/web/libraries/registre-personne'
import {
  aQuelqueChoseADire,
  type CompteAuReleve,
  comptesParColonne,
  estAMasquer,
  estEnAttenteDArbitrage,
  ligneDuReleve,
  releveEnCsv,
} from './releve'

const maintenant = new Date('2026-11-05T12:00:00.000Z')
const ilYADeuxAns = new Date('2024-11-05T12:00:00.000Z')
const ilYAUnMois = new Date('2026-10-05T12:00:00.000Z')

const compte = (surcharge: Partial<CompteAuReleve> = {}): CompteAuReleve => ({
  id: 'compte-1',
  deleted: null,
  lastLogin: ilYAUnMois,
  mediateur: { id: 'mediateur-1', isVisible: true, aUnLieuActif: true },
  ...surcharge,
})

const ligne = {
  nom: 'MARTIN',
  prenom: 'Camille',
  contact: {
    coop: { email: 'camille@example.org', telephone: '+33612345678' },
  },
  cnPgId: null,
  conseillerNumeriqueId: null,
  aidantConnectId: null,
  isMediateur: true,
  isCoordinateur: false,
  isVisible: true,
  deletedAt: null,
  deletedBy: null,
}

const apercu = (
  surcharge: Partial<ApercuDeLaSynchronisation> = {},
): ApercuDeLaSynchronisation => ({
  lien: 'reliee',
  ligne,
  personneId: 12,
  alignement: null,
  ...surcharge,
})

const signature = { editedBy: 'coop', updatedAtCoop: maintenant }

const sansSignalement = {
  courrielDUnAutreCompte: false,
  nomSansRapport: false,
}

const releve = (
  surchargeApercu: Partial<ApercuDeLaSynchronisation> = {},
  surchargeCompte: Partial<CompteAuReleve> = {},
  signalements = sansSignalement,
) =>
  ligneDuReleve({
    compte: compte(surchargeCompte),
    apercu: apercu(surchargeApercu),
    signalements,
    maintenant,
  })

describe('relevé de l’alignement du registre', () => {
  it('ne dit rien d’un compte déjà aligné', () => {
    expect(aQuelqueChoseADire(releve())).toBe(false)
  })

  it('signale les colonnes à corriger', () => {
    const cellules = releve({
      alignement: { ...signature, nom: 'DURAND', isMediateur: true },
    })

    expect(cellules.nom).toBe('à corriger')
    expect(cellules.is_mediateur).toBe('à corriger')
    expect(cellules.prenom).toBe('')
    expect(aQuelqueChoseADire(cellules)).toBe(true)
  })

  it('distingue le courriel du téléphone dans le contact', () => {
    const cellules = releve({
      alignement: {
        ...signature,
        contact: {
          coop: { email: 'nouveau@example.org', telephone: '+33612345678' },
        },
      },
    })

    expect(cellules.courriel).toBe('à corriger')
    expect(cellules.telephone).toBe('')
  })

  it('donne la valeur effacée quand le téléphone est retiré', () => {
    const cellules = releve({
      alignement: {
        ...signature,
        contact: { coop: { email: 'camille@example.org' } },
      },
    })

    expect(cellules.telephone).toBe('+33612345678')
    expect(cellules.courriel).toBe('')
  })

  it('nomme ce qui arrive au lien', () => {
    expect(releve({ lien: 'a-creer', personneId: null }).lien).toBe(
      'ligne à créer',
    )
    expect(releve({ lien: 'a-lier' }).lien).toBe('ligne à lier')
  })

  it('renvoie une ligne occupée vers un traitement à la main', () => {
    const cellules = releve({ lien: 'occupee', personneId: null })

    expect(cellules.a_traiter_a_la_main).toBe(
      'comptes à fusionner ou à vérifier',
    )
  })

  it('reporte les signalements', () => {
    expect(
      releve({}, {}, { courrielDUnAutreCompte: true, nomSansRapport: true })
        .a_traiter_a_la_main,
    ).toBe(
      'courriel d’un autre compte vivant ; nom sans rapport avec le compte',
    )
  })

  it('dit quels comptes apparaîtraient sur la carte', () => {
    expect(releve({ lien: 'a-creer' }).carte).toBe('apparaîtrait sur la carte')
    expect(releve().carte).toBe('')
    expect(
      releve(
        { lien: 'a-creer' },
        {
          mediateur: {
            id: 'mediateur-1',
            isVisible: true,
            aUnLieuActif: false,
          },
        },
      ).carte,
    ).toBe('')
  })

  it('compte les lignes par colonne, identifiants exclus', () => {
    const lignes = [
      releve({ alignement: { ...signature, nom: 'DURAND' } }),
      releve({ alignement: { ...signature, nom: 'LEROY', prenom: 'Alex' } }),
    ]

    expect(comptesParColonne(lignes)).toMatchObject({ nom: 2, prenom: 1 })
    expect(comptesParColonne(lignes)).not.toHaveProperty('compte_id')
  })

  it('écrit un CSV au séparateur point-virgule, cellules entre guillemets', () => {
    const csv = releveEnCsv([
      releve({ alignement: { ...signature, nom: 'DURAND' } }),
    ])

    expect(csv.split('\n')[0]).toMatch(/^compte_id;personne_id;lien;nom;/)
    expect(csv.split('\n')[1]).toMatch(
      /^"compte-1";"12";;"à corriger";;;;;;;;;$/,
    )
  })
})

describe('masquer un compte inactif qui entre au registre', () => {
  it('masque un compte sans connexion depuis plus d’un an', () => {
    expect(
      estAMasquer(compte({ lastLogin: ilYADeuxAns }), 'a-creer', maintenant),
    ).toBe(true)
  })

  it('masque un compte jamais connecté', () => {
    expect(estAMasquer(compte({ lastLogin: null }), 'a-lier', maintenant)).toBe(
      true,
    )
  })

  it('laisse un compte récemment connecté', () => {
    expect(estAMasquer(compte(), 'a-creer', maintenant)).toBe(false)
  })

  it('ne touche pas à un compte qui a déjà sa ligne', () => {
    expect(
      estAMasquer(compte({ lastLogin: ilYADeuxAns }), 'reliee', maintenant),
    ).toBe(false)
  })

  it('ne touche pas à un médiateur déjà masqué ni à un compte sans médiateur', () => {
    expect(
      estAMasquer(
        compte({
          lastLogin: ilYADeuxAns,
          mediateur: {
            id: 'mediateur-1',
            isVisible: false,
            aUnLieuActif: true,
          },
        }),
        'a-creer',
        maintenant,
      ),
    ).toBe(false)
    expect(
      estAMasquer(
        compte({ lastLogin: ilYADeuxAns, mediateur: null }),
        'a-creer',
        maintenant,
      ),
    ).toBe(false)
  })
})

describe('compte supprimé sur une ligne à plusieurs sources', () => {
  const multiSources = {
    ...ligne,
    contact: { idposte: { mail_pro: 'camille@structure.fr' } },
  }

  it('attend l’arbitrage', () => {
    const supprime = compte({ deleted: maintenant })

    expect(
      estEnAttenteDArbitrage(supprime, apercu({ ligne: multiSources })),
    ).toBe(true)
    expect(
      releve({ ligne: multiSources }, { deleted: maintenant }).suppression,
    ).toBe('en attente d’arbitrage')
  })

  it('n’attend rien d’une ligne purement Coop ni d’un compte vivant', () => {
    expect(
      estEnAttenteDArbitrage(compte({ deleted: maintenant }), apercu()),
    ).toBe(false)
    expect(
      estEnAttenteDArbitrage(compte(), apercu({ ligne: multiSources })),
    ).toBe(false)
  })
})
