import type { Meta, StoryObj } from '@storybook/react'
import { RdvId } from '@/features/rdvsp/domain/identifiants/rdv-id'
import { StatutPresence } from '@/features/rdvsp/domain/rdv/statut-presence'
import { provide } from '@/libraries/nextjs/injection'
import { success } from '@/libraries/result'
import { RAFRAICHIR_ACCUEIL_RDV_ACTION_KEY } from '../../action/rafraichir-accueil-rdv.key'
import type {
  DonneesAccueilRdv,
  RdvEnUneLigne,
} from '../../domain/donnees-accueil-rdv'
import type { WidgetRdvAccueil } from '../../domain/widget-rdv'
import { RdvIntegrationErreurAlerte } from './RdvIntegrationErreurAlerte.slot'
import RdvsAccueil from './RdvsAccueil.slot'

export default {
  title: 'Coop/Accueil/RdvsAccueil',
  component: RdvsAccueil,
  decorators: [
    (Story) => {
      provide(RAFRAICHIR_ACCUEIL_RDV_ACTION_KEY, async () =>
        success({ _tag: 'inchange' }),
      )
      return <Story />
    },
  ],
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

const alerte = (
  <RdvIntegrationErreurAlerte lienDeConnexion="https://rdv.anct.gouv.fr/oauth/authorize" />
)

const liens = {
  tous: '/coop/mes-activites?rdvs=unknown,past,seen,revoked,excused,noshow&voir-rdvs=1',
  aVenir: '/coop/mes-activites?rdvs=unknown&voir-rdvs=1',
  passes: '/coop/mes-activites?rdvs=past,seen',
}

const avecDonnees = (
  surcharge: Partial<DonneesAccueilRdv>,
): WidgetRdvAccueil => ({ _tag: 'donnees', donnees: donnees(surcharge) })

export const AvecRendezVous: Story = {
  args: {
    user,
    synchroniserAuChargement: false,
    alerte,
    liens,
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
    liens,
    widget: avecDonnees({}),
  },
}

export const AtelierCollectif: Story = {
  args: {
    user,
    synchroniserAuChargement: false,
    alerte,
    liens,
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
    liens,
    widget: avecDonnees({
      aVenir: 1,
      prochain: rdv(dans(1), { premierParticipant: null }),
    }),
  },
}

export const Alerte: Story = {
  args: {
    user,
    synchroniserAuChargement: false,
    alerte,
    liens,
    widget: { _tag: 'alerte' },
  },
}

export const Masque: Story = {
  args: {
    user,
    synchroniserAuChargement: false,
    alerte,
    liens,
    widget: { _tag: 'masque' },
  },
}
