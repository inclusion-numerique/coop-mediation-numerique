import { RdvId } from '@app/web/features/rdvsp/domain/rdv-id'
import { StatutPresence } from '@app/web/features/rdvsp/domain/statut-presence'
import type { Meta, StoryObj } from '@storybook/react'
import type {
  DonneesAccueilRdv,
  RdvEnUneLigne,
} from '../../domain/donnees-accueil-rdv'
import type { WidgetRdvAccueil } from '../../domain/widget-rdv'
import { RdvIntegrationErreurAlerte } from './RdvIntegrationErreurAlerte'
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

const alerte = <RdvIntegrationErreurAlerte />

const avecDonnees = (
  surcharge: Partial<DonneesAccueilRdv>,
): WidgetRdvAccueil => ({ _tag: 'donnees', donnees: donnees(surcharge) })

export const AvecRendezVous: Story = {
  args: {
    user,
    synchroniserAuChargement: false,
    alerte,
    widget: avecDonnees({
      aVenir: 3,
      prochain: rdv(dans(2)),
      passes: 4,
      honores: 2,
      dernier: rdv(dans(-3)),
    }),
  },
}

export const AucunRendezVous: Story = {
  args: {
    user,
    synchroniserAuChargement: false,
    alerte,
    widget: avecDonnees({}),
  },
}

export const AtelierCollectif: Story = {
  args: {
    user,
    synchroniserAuChargement: false,
    alerte,
    widget: avecDonnees({
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
    alerte,
    widget: avecDonnees({
      aVenir: 1,
      prochain: rdv(dans(1), { premierParticipant: null }),
    }),
  },
}

/**
 * Les deux états que le bloc pouvait déjà porter, mais que le composant ne
 * savait pas rendre : le rendu initial les traitait dans la page.
 */
export const Alerte: Story = {
  args: {
    user,
    synchroniserAuChargement: false,
    alerte,
    widget: { _tag: 'alerte' },
  },
}

export const Masque: Story = {
  args: {
    user,
    synchroniserAuChargement: false,
    alerte,
    widget: { _tag: 'masque' },
  },
}
