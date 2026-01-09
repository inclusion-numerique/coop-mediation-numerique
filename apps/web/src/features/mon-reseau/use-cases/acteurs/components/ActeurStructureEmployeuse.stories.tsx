import type { Meta, StoryObj } from '@storybook/react'
import ActeurStructureEmployeuse from './ActeurStructureEmployeuse'

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
      id: '1',
      userId: '1',
      debut: new Date(),
      fin: null,
      creation: new Date(),
      structure: {
        id: '1',
        nom: 'Anonymal',
        adresse: '12 bis rue du Général Leclerc',
        complementAdresse: '4e étage',
        commune: 'Reims',
        codePostal: '51100',
        codeInsee: '51454',
        typologies: ['TIERS_LIEUX', 'ASSO'],
        siret: '43493312300029',
        rna: '1234567890',
        nomReferent: 'John Doe',
        courrielReferent: 'john.doe@example.com',
        telephoneReferent: '0123456789',
      },
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
      id: '1',
      userId: '1',
      debut: new Date(),
      fin: null,
      creation: new Date(),
      structure: {
        id: '1',
        nom: 'Anonymal',
        adresse: '12 bis rue du Général Leclerc',
        commune: 'Reims',
        codePostal: '51100',
        codeInsee: '51454',
        complementAdresse: null,
        siret: null,
        rna: null,
        typologies: [],
        nomReferent: null,
        courrielReferent: null,
        telephoneReferent: null,
      },
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
      id: '1',
      userId: '1',
      debut: new Date(),
      fin: null,
      creation: new Date(),
      structure: {
        id: '1',
        nom: 'Anonymal',
        adresse: '12 bis rue du Général Leclerc',
        commune: 'Reims',
        codePostal: '51100',
        codeInsee: '51454',
        complementAdresse: null,
        siret: '43493312300029',
        rna: null,
        typologies: [],
        nomReferent: null,
        courrielReferent: null,
        telephoneReferent: null,
      },
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
      id: '1',
      userId: '1',
      debut: new Date(),
      fin: null,
      creation: new Date(),
      structure: {
        id: '1',
        nom: 'Anonymal',
        adresse: '12 bis rue du Général Leclerc',
        commune: 'Reims',
        codePostal: '51100',
        codeInsee: '51454',
        complementAdresse: null,
        siret: null,
        rna: null,
        typologies: ['TIERS_LIEUX', 'ASSO'],
        nomReferent: null,
        courrielReferent: null,
        telephoneReferent: null,
      },
    },
    showIsLieuActiviteNotice: false,
    showReferentStructure: false,
    showReferentStructureConseillerNumeriqueSupportNotice: false,
    canUpdateStructure: false,
  },
}
