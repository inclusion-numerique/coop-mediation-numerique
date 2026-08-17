import { RdvId } from '@app/web/features/rdvsp/domain/rdv-id'
import { StatutPresence } from '@app/web/features/rdvsp/domain/statut-presence'
import type { Meta, StoryObj } from '@storybook/react'
import type {
  DonneesAccueilRdv,
  RdvEnUneLigne,
} from '../../domain/donnees-accueil-rdv'
import RdvsAccueil from './RdvsAccueil'

export default {
  title: 'Coop/Accueil/RdvsAccueil',
  component: RdvsAccueil,
} as Meta<typeof RdvsAccueil>

type Story = StoryObj<typeof RdvsAccueil>

const rdv = (
  debut: Date,
  surcharge: Partial<RdvEnUneLigne> = {},
): RdvEnUneLigne => ({
  id: RdvId(1),
  debut,
  fin: new Date(debut.getTime() + 30 * 60 * 1000),
  collectif: false,
  nombreParticipants: 1,
  premierParticipant: { prenom: 'Jean', nom: 'Dupont' },
  statutPresence: StatutPresence('unknown'),
  ...surcharge,
})

const dans = (jours: number) =>
  new Date(Date.now() + jours * 24 * 60 * 60 * 1000)

const donnees = (surcharge: Partial<DonneesAccueilRdv>): DonneesAccueilRdv => ({
  aVenir: 0,
  prochain: null,
  passes: 0,
  honores: 0,
  dernier: null,
  organisationPrincipale: null,
  ...surcharge,
})

const user = { timezone: 'Europe/Paris' }

export const AvecRendezVous: Story = {
  args: {
    user,
    synchroniserAuChargement: false,
    donnees: donnees({
      aVenir: 3,
      prochain: rdv(dans(2)),
      passes: 4,
      honores: 2,
      dernier: rdv(dans(-3)),
    }),
  },
}

export const AucunRendezVous: Story = {
  args: { user, synchroniserAuChargement: false, donnees: donnees({}) },
}

export const AtelierCollectif: Story = {
  args: {
    user,
    synchroniserAuChargement: false,
    donnees: donnees({
      aVenir: 1,
      prochain: rdv(dans(1), {
        collectif: true,
        nombreParticipants: 8,
        premierParticipant: null,
      }),
    }),
  },
}

export const ParticipantInconnu: Story = {
  args: {
    user,
    synchroniserAuChargement: false,
    donnees: donnees({
      aVenir: 1,
      prochain: rdv(dans(1), { premierParticipant: null }),
    }),
  },
}
