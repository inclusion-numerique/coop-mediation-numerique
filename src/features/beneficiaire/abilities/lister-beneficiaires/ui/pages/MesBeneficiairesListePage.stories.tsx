import { Page, PageSize, type Paginated } from '@arckit/resultset'
import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from 'storybook/test'
import { SUPPRIMER_DES_BENEFICIAIRES_KEY } from '@/features/beneficiaire/abilities/lister-beneficiaires/action/supprimer-des-beneficiaires.key'
import type { BeneficiaireListItem } from '@/features/beneficiaire/abilities/lister-beneficiaires/domain/lister-beneficiaires'
import { presentMesBeneficiaires } from '@/features/beneficiaire/abilities/lister-beneficiaires/ui/presenters/lister-beneficiaires.presenter'
import { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { Genre } from '@/features/beneficiaire/domain/genre'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { Nom } from '@/features/beneficiaire/domain/nom'
import { Prenom } from '@/features/beneficiaire/domain/prenom'
import { StatutSocial } from '@/features/beneficiaire/domain/statut-social'
import { TrancheAge } from '@/features/beneficiaire/domain/tranche-age'
import { provide } from '@/libraries/nextjs/injection'
import { liensDeLaListe } from '../filtres/liste-des-beneficiaires.filtre'
import { MesBeneficiairesListePage } from './MesBeneficiairesListePage'

const baseId = '00000000-0000-0000-0000-0000000000'

const beneficiaireListItem = (
  overrides: Partial<{
    index: number
    prenom: string
    nom: string
    anneeNaissance: number | null
    accompagnementsCount: number
  }> = {},
): BeneficiaireListItem => {
  const index = overrides.index ?? 1
  return {
    id: BeneficiaireId(`${baseId}${index.toString().padStart(2, '0')}`),
    mediateurId: MediateurId('00000000-0000-0000-0000-0000000000aa'),
    prenom: Prenom(overrides.prenom ?? 'Jean'),
    nom: Nom(overrides.nom ?? 'Dupont'),
    telephone: null,
    email: null,
    anneeNaissance:
      overrides.anneeNaissance === null
        ? null
        : AnneeNaissance(overrides.anneeNaissance ?? 1990),
    trancheAge: TrancheAge(null),
    genre: Genre(null),
    statutSocial: StatutSocial(null),
    communeResidence: null,
    creation: new Date('2024-01-01T00:00:00.000Z'),
    accompagnementsCount: overrides.accompagnementsCount ?? 0,
    notes: null,
  }
}

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
