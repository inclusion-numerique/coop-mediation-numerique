import type { Meta, StoryObj } from '@storybook/react'
import {
  adresseCompleteAffichage,
  type EmploiEmployeuseAffichage,
} from '../abilities/consulter-employeuse-a-une-date/ui/employeuse-emploi.presenter'
import ActeurStructureEmployeuse from './ActeurStructureEmployeuse'

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
        aUnReferent: true,
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
        aUnReferent: false,
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
        aUnReferent: false,
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
        aUnReferent: false,
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

export const ContactSansNom: Story = {
  args: {
    emploi: {
      structure: structure({
        id: 1,
        nom: 'LELIEN26',
        adresse: 'Rue du Bourg',
        commune: 'Dieulefit',
        codePostal: '26220',
        codeInsee: '26114',
        complementAdresse: null,
        siret: '83922613100036',
        rna: null,
        aUnReferent: true,
        nomReferent: null,
        courrielReferent: 'lelien26@orange.fr',
        telephoneReferent: '04 69 14 48 06',
      }),
    },
    showIsLieuActiviteNotice: false,
    showReferentStructure: true,
    showReferentStructureConseillerNumeriqueSupportNotice: false,
    canUpdateStructure: false,
  },
}
