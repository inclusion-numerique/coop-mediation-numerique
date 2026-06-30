import type { BeneficiaireListItem } from '@app/web/features/beneficiaire/abilities/lister-beneficiaires/domain/lister-beneficiaires'
import { beneficiaireListItem } from '@app/web/features/beneficiaire/abilities/lister-beneficiaires/ui/components/beneficiaire-list-item.fixture'
import { presentMesBeneficiaires } from '@app/web/features/beneficiaire/abilities/lister-beneficiaires/ui/components/lister-beneficiaires.presenter'
import { Page, PageSize, type Paginated } from '@arckit/resultset'
import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from '@storybook/test'
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

const meta: Meta<typeof MesBeneficiairesListePage> = {
  title: 'Mes bénéficiaires/Liste',
  component: MesBeneficiairesListePage,
  decorators: [
    (Story) => <div className="fr-container fr-py-4v">{Story()}</div>,
  ],
}

export default meta

type Story = StoryObj<typeof MesBeneficiairesListePage>

export const AvecBeneficiaires: Story = {
  name: 'Avec bénéficiaires',
  args: {
    view: presentMesBeneficiaires(paginated(items, 42)),
    searchParams: {},
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
    searchParams: { recherche: 'zzz' },
  },
}

export const Vide: Story = {
  name: 'Vide',
  args: {
    view: presentMesBeneficiaires(paginated([], 0)),
    searchParams: {},
  },
}
