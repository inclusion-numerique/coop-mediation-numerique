import { AdresseCourriel } from './adresse-courriel'
import {
  type CompteARelancer,
  deroulerLesRelances,
  type PortsDeRelance,
} from './derouler-les-relances'
import { Relance } from './relance'
import { UtilisateurId } from './utilisateur-id'

const MAINTENANT = new Date('2026-10-21T00:00:00.000Z')
const UN_JOUR = 24 * 60 * 60 * 1000

const compte = (
  id: string,
  jours: number,
  relance: Parameters<typeof Relance>[0],
): CompteARelancer => ({
  utilisateurId: UtilisateurId(id),
  courriel: AdresseCourriel(`${id.slice(0, 4)}@example.com`),
  prenom: 'Jeanne',
  estMediateur: true,
  estCoordinateur: false,
  situation: {
    phase: 'Inscription',
    depuis: new Date(MAINTENANT.getTime() - jours * UN_JOUR),
    relance: Relance(relance),
    aProduit: false,
  },
})

const UN = '0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f'
const DEUX = '1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8'

const journal = () => {
  const etat: { evenements: readonly string[] } = { evenements: [] }
  const consigner = (evenement: string) => {
    etat.evenements = [...etat.evenements, evenement]
  }
  const ports: PortsDeRelance = {
    relancer: async (destinataire, palier) => {
      if (destinataire.utilisateurId === UN)
        throw new Error('SMTP indisponible')
      consigner(`relance ${palier}`)
    },
    avertir: async () => consigner('avertissement'),
    effacer: async () => consigner('effacement'),
    noter: async (_, relance) => consigner(`note ${relance}`),
  }
  return { etat, ports }
}

describe('dérouler les relances', () => {
  it('poursuit après l’échec d’un compte et le signale', async () => {
    const { etat, ports } = journal()

    const rapports = await deroulerLesRelances(
      [compte(UN, 8, 'Aucune'), compte(DEUX, 8, 'Aucune')],
      ports,
      MAINTENANT,
    )

    expect(rapports).toEqual([
      {
        utilisateurId: UN,
        action: 'Relancer',
        issue: 'echec',
        cause: 'SMTP indisponible',
      },
      { utilisateurId: DEUX, action: 'Relancer', issue: 'fait' },
    ])
    expect(etat.evenements).toEqual(['relance 7', 'note J7'])
  })

  it('ne note pas de relance après un effacement', async () => {
    const { etat, ports } = journal()

    await deroulerLesRelances(
      [compte(DEUX, 106, 'AvertissementJ90')],
      ports,
      MAINTENANT,
    )

    expect(etat.evenements).toEqual(['effacement'])
  })

  it('ignore les comptes qui n’ont rien à recevoir', async () => {
    const { ports } = journal()

    expect(
      await deroulerLesRelances([compte(DEUX, 3, 'Aucune')], ports, MAINTENANT),
    ).toEqual([])
  })
})
