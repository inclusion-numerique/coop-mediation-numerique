import type { EmploiEmployeuseAffichage } from '@app/web/features/employeuse'
// Import direct du presenter, PAS du barrel `features/employeuse` : celui-ci
// réexporte l'implémentation Prisma de l'ability, qui n'a rien à faire dans un
// bundle client.
import { adresseCompleteAffichage } from '@app/web/features/employeuse/abilities/consulter-employeuse-a-une-date/ui/employeuse-emploi.presenter'
import type { Meta, StoryObj } from '@storybook/react'
import ActeurStructureEmployeuse from './ActeurStructureEmployeuse'

// Les fixtures composent leur adresse par le presenter plutôt que de la
// recopier : les stories exercent ainsi la vraie mise en forme.
const structure = (
  valeurs: Omit<EmploiEmployeuseAffichage, 'adresseComplete'>,
): EmploiEmployeuseAffichage => ({
  ...valeurs,
  adresseComplete: adresseCompleteAffichage(valeurs),
})

const meta = {
  title: 'Structure/Structure employeuse',
  component: ActeurStructureEmployeuse,
  tags: ['autodocs'],
} satisfies Meta<typeof ActeurStructureEmployeuse>

export default meta
type Story = StoryObj<typeof meta>

export const Complet: Story = {
  args: {
    emploi: {
      structure: structure({
        id: 1,
        nom: 'Anonymal',
        adresse: '12 bis rue du Général Leclerc',
        complementAdresse: '4e étage',
        commune: 'Reims',
        codePostal: '51100',
        codeInsee: '51454',
        siret: '43493312300029',
        rna: '1234567890',
        nomReferent: 'John Doe',
        courrielReferent: 'john.doe@example.com',
        telephoneReferent: '0123456789',
      }),
    },
    showIsLieuActiviteNotice: true,
    showReferentStructure: true,
    showReferentStructureConseillerNumeriqueSupportNotice: true,
    canUpdateStructure: true,
  },
}

export const Minimal: Story = {
  args: {
    emploi: {
      structure: structure({
        id: 1,
        nom: 'Anonymal',
        adresse: '12 bis rue du Général Leclerc',
        commune: 'Reims',
        codePostal: '51100',
        codeInsee: '51454',
        complementAdresse: null,
        siret: null,
        rna: null,
        nomReferent: null,
        courrielReferent: null,
        telephoneReferent: null,
      }),
    },
    showIsLieuActiviteNotice: false,
    showReferentStructure: false,
    showReferentStructureConseillerNumeriqueSupportNotice: false,
    canUpdateStructure: false,
  },
}

export const MinimalAvecSiret: Story = {
  args: {
    emploi: {
      structure: structure({
        id: 1,
        nom: 'Anonymal',
        adresse: '12 bis rue du Général Leclerc',
        commune: 'Reims',
        codePostal: '51100',
        codeInsee: '51454',
        complementAdresse: null,
        siret: '43493312300029',
        rna: null,
        nomReferent: null,
        courrielReferent: null,
        telephoneReferent: null,
      }),
    },
    showIsLieuActiviteNotice: false,
    showReferentStructure: false,
    showReferentStructureConseillerNumeriqueSupportNotice: false,
    canUpdateStructure: false,
  },
}

export const MinimalAvecTypologies: Story = {
  args: {
    emploi: {
      structure: structure({
        id: 1,
        nom: 'Anonymal',
        adresse: '12 bis rue du Général Leclerc',
        commune: 'Reims',
        codePostal: '51100',
        codeInsee: '51454',
        complementAdresse: null,
        siret: null,
        rna: null,
        nomReferent: null,
        courrielReferent: null,
        telephoneReferent: null,
      }),
    },
    showIsLieuActiviteNotice: false,
    showReferentStructure: false,
    showReferentStructureConseillerNumeriqueSupportNotice: false,
    canUpdateStructure: false,
  },
}
