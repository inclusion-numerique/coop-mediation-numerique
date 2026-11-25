import { Page, PageSize, type Paginated } from '@arckit/resultset'
import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from 'storybook/test'
import { SUPPRIMER_DES_BENEFICIAIRES_KEY } from '@/features/beneficiaire/abilities/lister-beneficiaires/action/supprimer-des-beneficiaires.key'
import type { BeneficiaireListItem } from '@/features/beneficiaire/abilities/lister-beneficiaires/domain/lister-beneficiaires'
import { presentMesBeneficiaires } from '@/features/beneficiaire/abilities/lister-beneficiaires/ui/presenters/lister-beneficiaires.presenter'
import { beneficiaireListItem } from '@/features/beneficiaire/fixtures/beneficiaire-list-item'
import { provide } from '@/libraries/nextjs/injection'
import { liensDeLaListe } from '../filtres/liste-des-beneficiaires.filtre'
import { MesBeneficiairesListePage } from './MesBeneficiairesListePage'

const paginated = (
  items: BeneficiaireListItem[],
  totalItems: number,
): Paginated<BeneficiaireListItem> => ({
  items,
  totalItems,
  currentPage: Page(1),
  pageSize: PageSize(20),
})

const items = [
  beneficiaireListItem({
    index: 1,
    prenom: 'Ada',
    nom: 'Lovelace',
    anneeNaissance: 1990,
    accompagnementsCount: 3,
  }),
  beneficiaireListItem({
    index: 2,
    prenom: 'Alan',
    nom: 'Turing',
    anneeNaissance: 1985,
    accompagnementsCount: 0,
  }),
  beneficiaireListItem({
    index: 3,
    prenom: 'Grace',
    nom: 'Hopper',
    anneeNaissance: null,
    accompagnementsCount: 12,
  }),
]

// La page reçoit la suppression par clé : les stories fournissent une doublure
// plutôt que la vraie server action, qui tirerait tout le graphe serveur dans le
// bundle du navigateur.
const supprimerBeneficiaires = async () => ({
  success: true as const,
  data: undefined,
})

const meta: Meta<typeof MesBeneficiairesListePage> = {
  title: 'Mes bénéficiaires/Liste',
  component: MesBeneficiairesListePage,
  decorators: [
    (Story) => {
      provide(SUPPRIMER_DES_BENEFICIAIRES_KEY, supprimerBeneficiaires)
      return <div className="fr-container fr-py-4v">{Story()}</div>
    },
  ],
}

export default meta

type Story = StoryObj<typeof MesBeneficiairesListePage>

export const AvecBeneficiaires: Story = {
  name: 'Avec bénéficiaires',
  args: {
    view: presentMesBeneficiaires(paginated(items, 42)),
    liens: liensDeLaListe({}, paginated(items, 42)),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Lovelace')).toBeInTheDocument()
    await expect(canvas.getByText('42 bénéficiaires')).toBeInTheDocument()
  },
}

export const AucunResultat: Story = {
  name: 'Aucun résultat',
  args: {
    view: presentMesBeneficiaires(paginated([], 0), 'zzz'),
    liens: liensDeLaListe({ recherche: 'zzz' }, paginated([], 0)),
  },
}

export const Vide: Story = {
  name: 'Vide',
  args: {
    view: presentMesBeneficiaires(paginated([], 0)),
    liens: liensDeLaListe({}, paginated([], 0)),
  },
}
