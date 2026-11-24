import type { Meta, StoryObj } from '@storybook/react'
import { RECHERCHER_LES_LIEUX_DES_STATISTIQUES_ACTION_KEY } from '@/features/statistiques/action/rechercher-les-lieux-des-statistiques.key'
import {
  impressionDesStatistiques,
  sectionActivites,
  sectionBeneficiaires,
  sectionGenerale,
} from '@/features/statistiques/ui/slots/SectionsDesStatistiques.slot'
import { ServerActionSuccess } from '@/libraries/nextjs/action/result'
import { provide } from '@/libraries/nextjs/injection/client'
import { MesStatistiquesPage } from './MesStatistiquesPage'

const Emplacement = ({ nom }: { nom: string }) => (
  <div className="fr-p-4v fr-background-alt--grey fr-border-radius--8">
    {nom}
  </div>
)

const emplacement = (nom: string) => <Emplacement nom={nom} />

export default {
  title: 'Mes statistiques',
  component: MesStatistiquesPage,
  decorators: [
    (Story) => {
      provide(RECHERCHER_LES_LIEUX_DES_STATISTIQUES_ACTION_KEY, async () =>
        ServerActionSuccess([]),
      )
      return <Story />
    },
  ],
} satisfies Meta<typeof MesStatistiquesPage>

type Story = StoryObj<typeof MesStatistiquesPage>

export const Statistiques: Story = {
  name: 'Statistiques',
  args: {
    barreDeFiltres: (actions) => actions,
    filtres: { libelles: [], requete: '' },
    user: { coordinateur: null, mediateur: null, emplois: [] },
    hasCrasV1: false,
    accompagnementsCount: Promise.resolve(420),
    partage: null,
    impression: impressionDesStatistiques({
      libelles: [],
      statistiques: null,
      imprimees: () => ({
        generale: {
          chiffresCles: <Emplacement nom="Chiffres clés" />,
          graphiques: <Emplacement nom="Graphiques" />,
        },
        activites: {
          types: <Emplacement nom="Types d’activité" />,
          thematiques: <Emplacement nom="Thématiques" />,
          demarches: <Emplacement nom="Démarches" />,
          tags: <Emplacement nom="Tags" />,
          materiels: <Emplacement nom="Matériels" />,
          canaux: <Emplacement nom="Canaux" />,
          durees: <Emplacement nom="Durées" />,
          lieux: <Emplacement nom="Lieux" />,
        },
        beneficiaires: {
          profil: <Emplacement nom="Profil" />,
          communes: <Emplacement nom="Communes de résidence" />,
        },
      }),
    }),
    generale: sectionGenerale({
      chiffresCles: emplacement('Chiffres clés'),
      graphique: emplacement('Graphique des accompagnements'),
    }),
    activites: sectionActivites(
      {
        types: emplacement('Types d’activité'),
        thematiques: emplacement('Thématiques'),
        demarches: emplacement('Démarches'),
        tags: emplacement('Tags'),
        materiels: emplacement('Matériels'),
        canauxEtDurees: emplacement('Canaux et durées'),
        lieux: emplacement('Lieux'),
        communes: emplacement('Communes'),
      },
      { canManageTags: true },
    ),
    beneficiaires: sectionBeneficiaires({
      profil: emplacement('Profil des bénéficiaires'),
      communes: emplacement('Communes de résidence'),
    }),
  },
}
