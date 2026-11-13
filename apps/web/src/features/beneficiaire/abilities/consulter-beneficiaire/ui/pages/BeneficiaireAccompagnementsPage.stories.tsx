import {
  beneficiaireMaximaleMediateurAvecActivite,
  beneficiaireMinimaleMediateurAvecActivite,
} from '@app/fixtures/beneficiaires'
import BeneficiaireConsultationLayout from '@app/web/features/beneficiaire/abilities/consulter-beneficiaire/ui/components/BeneficiaireConsultationLayout'
import ViewBeneficiaireAccompagnementsPage from '@app/web/features/beneficiaire/abilities/consulter-beneficiaire/ui/pages/ViewBeneficiaireAccompagnementsPage'
import type { Meta, StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

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
