import type { Meta, StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'
import BeneficiaireConsultationLayout from '@/features/beneficiaire/abilities/consulter-beneficiaire/ui/layouts/BeneficiaireConsultationLayout'
import ViewBeneficiaireAccompagnementsPage from '@/features/beneficiaire/abilities/consulter-beneficiaire/ui/pages/ViewBeneficiaireAccompagnementsPage'

const beneficiaireMinimaleMediateurAvecActivite = {
  id: 'f4dbca97-6fe8-4be1-97be-bdf5e66b9ea8',
  prenom: 'Jeanne',
  nom: 'Minimale',
  anneeNaissance: null,
}

const beneficiaireMaximaleMediateurAvecActivite = {
  id: '36929ed7-3b6f-4ed3-9924-b5e1a6c27096',
  prenom: 'Jean',
  nom: 'Maximal',
  anneeNaissance: 1980,
}

type Accompagnements = ComponentProps<
  typeof ViewBeneficiaireAccompagnementsPage
>

const Template = ({
  beneficiaire,
  accompagnements,
}: {
  beneficiaire: {
    prenom: string | null
    nom: string | null
    anneeNaissance: number | null
  }
  accompagnements: Accompagnements
}) => (
  <BeneficiaireConsultationLayout
    beneficiaire={beneficiaire}
    hasDuplicates={false}
    hasRdvIntegration={false}
  >
    <ViewBeneficiaireAccompagnementsPage {...accompagnements} />
  </BeneficiaireConsultationLayout>
)

const meta: Meta<typeof ViewBeneficiaireAccompagnementsPage> = {
  title: 'Mes bénéficiaires/Consultation/Accompagnements',
  component: ViewBeneficiaireAccompagnementsPage,
}

export default meta

type Story = StoryObj<typeof ViewBeneficiaireAccompagnementsPage>

const historique = (
  <div className="fr-border-radius--8 fr-border fr-p-8v fr-mt-6v fr-text--center">
    <p className="fr-text--sm fr-mb-0">
      Historique des activités et des rendez-vous, fourni par la route
    </p>
  </div>
)

export const SansAccompagnements: Story = {
  name: 'Sans accompagnements',
  render: (args) => (
    <Template
      beneficiaire={beneficiaireMinimaleMediateurAvecActivite}
      accompagnements={args}
    />
  ),
  args: {
    beneficiaireId: beneficiaireMinimaleMediateurAvecActivite.id,
    nombreDAccompagnements: 0,
    accompagnements: historique,
  },
}

export const AvecAccompagnements: Story = {
  name: 'Avec accompagnements',
  render: (args) => (
    <Template
      beneficiaire={beneficiaireMaximaleMediateurAvecActivite}
      accompagnements={args}
    />
  ),
  args: {
    beneficiaireId: beneficiaireMaximaleMediateurAvecActivite.id,
    nombreDAccompagnements: 9,
    accompagnements: historique,
  },
}
