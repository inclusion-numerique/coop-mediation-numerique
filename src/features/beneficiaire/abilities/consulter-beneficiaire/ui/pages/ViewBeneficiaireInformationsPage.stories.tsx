import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from 'storybook/test'
import BeneficiaireConsultationLayout from '@/features/beneficiaire/abilities/consulter-beneficiaire/ui/layouts/BeneficiaireConsultationLayout'
import { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { Email } from '@/features/beneficiaire/domain/email'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { Nom } from '@/features/beneficiaire/domain/nom'
import { Notes } from '@/features/beneficiaire/domain/notes'
import { Prenom } from '@/features/beneficiaire/domain/prenom'
import { Telephone } from '@/libraries/telephone'
import ViewBeneficiaireInformationsPage, {
  type BeneficiaireInformationsPageData,
} from './ViewBeneficiaireInformationsPage'

const Template = ({
  data,
  rdvIntegration,
}: {
  data: BeneficiaireInformationsPageData
  rdvIntegration?: boolean
}) => (
  <BeneficiaireConsultationLayout
    beneficiaire={data.beneficiaire}
    hasDuplicates={false}
    hasRdvIntegration={!!rdvIntegration}
  >
    <ViewBeneficiaireInformationsPage data={data} />
  </BeneficiaireConsultationLayout>
)

const meta: Meta<typeof ViewBeneficiaireInformationsPage> = {
  title: 'Mes bénéficiaires/Consultation/Informations',
  component: ViewBeneficiaireInformationsPage,
}

export default meta

type Story = StoryObj<typeof ViewBeneficiaireInformationsPage>

const beneficiaireSansInformations = {
  id: BeneficiaireId('f4dbca97-6fe8-4be1-97be-bdf5e66b9ea8'),
  mediateurId: MediateurId('303381cc-3da7-433d-a553-1a5f76465989'),
  rdvUserId: null,
  rdvServicePublicId: null,
  prenom: Prenom('Jeanne'),
  nom: Nom('Minimale'),
  email: null,
  anneeNaissance: null,
  notes: null,
  genre: null,
  trancheAge: null,
  creation: new Date('2024-01-01'),
  adresse: null,
  telephone: null,
  pasDeTelephone: null,
  statutSocial: null,
  commune: null,
  communeCodePostal: null,
  communeCodeInsee: null,
  accompagnementsCount: 0,
} satisfies BeneficiaireInformationsPageData['beneficiaire']

const sansInformations = {
  beneficiaire: beneficiaireSansInformations,
  thematiquesAbordees: [],
  totalActivitesCount: 0,
  trancheAgeAffichee: '-',
} satisfies BeneficiaireInformationsPageData

export const SansInformations: Story = {
  name: 'Sans informations',
  render: (args) => <Template {...args} />,
  args: {
    data: sansInformations,
  },
}

const beneficiaireAvecInformations = {
  id: BeneficiaireId('36929ed7-3b6f-4ed3-9924-b5e1a6c27096'),
  mediateurId: MediateurId('303381cc-3da7-433d-a553-1a5f76465989'),
  rdvUserId: null,
  rdvServicePublicId: 42,
  prenom: Prenom('Jean'),
  nom: Nom('Maximal'),
  email: Email('jean.maximal@coop-numerique.incubateur.anct.gouv.fr'),
  anneeNaissance: AnneeNaissance(new Date('2024-01-01'))(1987),
  notes: Notes('Notes de Jean Maximal'),
  genre: 'Masculin',
  trancheAge: 'QuaranteCinquanteNeuf',
  creation: new Date('2024-01-01'),
  adresse: '1 rue de la Paix',
  telephone: Telephone('0123456789'),
  pasDeTelephone: false,
  statutSocial: 'EnEmploi',
  commune: 'Paris',
  communeCodePostal: '75001',
  communeCodeInsee: '75101',
  accompagnementsCount: 6,
} satisfies BeneficiaireInformationsPageData['beneficiaire']

const avecInformations = {
  beneficiaire: beneficiaireAvecInformations,
  thematiquesAbordees: [
    {
      thematique: 'BanqueEtAchatsEnLigne',
      libelle: 'Banque et achats en ligne',
      nombre: 3,
    },
    {
      thematique: 'CultureNumerique',
      libelle: 'Culture numérique',
      nombre: 1,
    },
    {
      thematique: 'Entrepreneuriat',
      libelle: 'Entrepreneuriat',
      nombre: 1,
    },
    {
      thematique: 'ArgentImpots',
      libelle: 'Argent et impôts',
      nombre: 1,
    },
  ],
  totalActivitesCount: 6,
  trancheAgeAffichee: '25 - 39 ans',
} satisfies BeneficiaireInformationsPageData

export const AvecInformations: Story = {
  name: 'Avec informations',
  render: (args) => <Template {...args} rdvIntegration />,
  args: {
    data: avecInformations,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByText('Culture numérique', { selector: '.fr-tag' }),
    ).toBeInTheDocument()

    await expect(
      canvas.getByText(
        (_, element) =>
          element?.textContent === 'Banque et achats en ligne · 3',
        { selector: '.fr-tag' },
      ),
    ).toBeInTheDocument()
  },
}
