import type { Meta, StoryObj } from '@storybook/react'
import type { ReactNode } from 'react'
import { partsFixees } from '@/libraries/proportions/parts-fixees'
import type { StatistiquesFournies } from '../../implementations/statistiques'
import {
  dureeAccompagnementParDefautLabels,
  dureeAcompagnementParDefautDefaultValues,
} from '../libelles/duree-accompagnement'
import { materielLabels, materielValues } from '../libelles/materiel'
import {
  genreLabels,
  genresAffiches,
  statutSocialLabels,
  statutsSociauxAffiches,
  trancheAgeLabels,
  tranchesAgeAffichees,
} from '../libelles/profil'
import {
  thematiquesAdministrativesLabels,
  thematiquesAdministrativesValues,
  thematiquesNonAdministrativesLabels,
  thematiquesNonAdministrativesValues,
} from '../libelles/thematique'
import {
  typeActiviteLabels,
  typeActiviteValues,
} from '../libelles/type-activite'
import { typeLieuLabels, typeLieuValues } from '../libelles/type-lieu'
import {
  blocsActivites,
  blocsBeneficiaires,
  blocsGeneraux,
  blocsImprimes,
} from './blocs-des-statistiques'

const donnees = {
  accompagnementsParJour: [
    { label: '01/08', count: 8 },
    { label: '02/08', count: 7 },
    { label: '03/08', count: 9 },
    { label: '04/08', count: 6 },
    { label: '05/08', count: 9 },
    { label: '06/08', count: 0 },
    { label: '07/08', count: 0 },
    { label: '08/08', count: 9 },
    { label: '09/08', count: 5 },
    { label: '10/08', count: 40 },
    { label: '11/08', count: 6 },
    { label: '12/08', count: 7 },
    { label: '13/08', count: 0 },
    { label: '14/08', count: 0 },
    { label: '15/08', count: 8 },
    { label: '16/08', count: 9 },
    { label: '17/08', count: 6 },
    { label: '18/08', count: 7 },
    { label: '19/08', count: 9 },
    { label: '20/08', count: 0 },
    { label: '21/08', count: 0 },
    { label: '22/08', count: 9 },
    { label: '23/08', count: 7 },
    { label: '24/08', count: 8 },
    { label: '25/08', count: 6 },
    { label: '26/08', count: 9 },
    { label: '27/08', count: 0 },
    { label: '28/08', count: 0 },
    { label: '29/08', count: 10 },
    { label: '30/08', count: 9 },
  ],
  accompagnementsParMois: [
    { label: 'Mars', count: 305 },
    { label: 'Avr.', count: 275 },
    { label: 'Mai', count: 320 },
    { label: 'Juin', count: 330 },
    { label: 'Juil.', count: 340 },
    { label: 'Août', count: 350 },
  ],
  totalCounts: {
    accompagnements: {
      total: 3300,
      individuels: {
        total: 1650,
        proportion: 50,
      },
      collectifs: {
        total: 1350,
        proportion: 40,
      },
    },
    activites: {
      total: 1000,
      individuels: {
        total: 500,
        proportion: 50,
      },
      collectifs: {
        total: 400,
        proportion: 40,
        participants: 2500,
      },
    },
    beneficiaires: {
      total: 550,
      nouveaux: 0,
      anonymes: 120,
      suivis: 430,
    },
  },
  activites: {
    total: 1000,
    typeActivites: partsFixees(
      typeActiviteValues,
      typeActiviteLabels,
      [400, 350, 250],
    ),
    thematiques: partsFixees(
      thematiquesNonAdministrativesValues,
      thematiquesNonAdministrativesLabels,
      [80, 100, 90, 70, 60, 40, 30, 20, 25, 10, 10, 10, 10, 5],
    ),
    thematiquesDemarches: partsFixees(
      thematiquesAdministrativesValues,
      thematiquesAdministrativesLabels,
      [100, 90, 80, 60, 50, 40, 30, 20, 10, 10],
    ),
    materiels: partsFixees(
      materielValues,
      materielLabels,
      [300, 200, 150, 120, 230],
    ),
    typeLieu: partsFixees(typeLieuValues, typeLieuLabels, [250, 450, 50, 250]),
    durees: partsFixees(
      dureeAcompagnementParDefautDefaultValues,
      dureeAccompagnementParDefautLabels,
      [300, 400, 200, 100],
    ),
    tags: [],
  },
  beneficiaires: {
    total: 550,
    genres: partsFixees(genresAffiches, genreLabels, [70, 80, 400]),
    trancheAges: partsFixees(
      tranchesAgeAffichees,
      trancheAgeLabels,
      [50, 60, 80, 100, 120, 140, 200],
    ),
    statutsSocial: partsFixees(
      statutsSociauxAffiches,
      statutSocialLabels,
      [50, 60, 70, 80, 290],
    ),
    communes: [
      {
        nom: 'Paris',
        codeInsee: '75056',
        codePostal: '75000',
        count: 50,
        label: 'Paris',
        proportion: 20,
      },
      {
        nom: 'Lyon',
        codeInsee: '69123',
        codePostal: '69000',
        count: 30,
        label: 'Lyon',
        proportion: 12,
      },
      {
        nom: 'Marseille',
        codeInsee: '13055',
        codePostal: '13000',
        count: 40,
        label: 'Marseille',
        proportion: 16,
      },
      {
        nom: 'Nice',
        codeInsee: '06088',
        codePostal: '06000',
        count: 20,
        label: 'Nice',
        proportion: 8,
      },
    ],
  },
  structures: [
    {
      id: '1',
      count: 120,
      label: 'Structure A',
      proportion: 40,
    },
    {
      id: '2',
      count: 80,
      label: 'Structure B',
      proportion: 30,
    },
    {
      id: '3',
      count: 50,
      label: 'Structure C',
      proportion: 17,
    },
    {
      id: '4',
      count: 50,
      label: 'Structure D',
      proportion: 17,
    },
  ],
  communes: [
    {
      commune: 'Paris',
      codePostal: '75000',
      codeInsee: '75056',
      count: 120,
      label: 'Paris · 75000',
      proportion: 40,
    },
    {
      commune: 'Lyon',
      codePostal: '69000',
      codeInsee: '69123',
      count: 80,
      label: 'Lyon · 69000',
      proportion: 30,
    },
    {
      commune: 'Marseille',
      codePostal: '13000',
      codeInsee: '13055',
      count: 50,
      label: 'Marseille · 13000',
      proportion: 17,
    },
    {
      commune: 'Nice',
      codePostal: '06000',
      codeInsee: '06088',
      count: 50,
      label: 'Nice · 06000',
      proportion: 17,
    },
  ],
  hasCrasV1: { hasCrasV1: false },
} satisfies StatistiquesFournies

const generale = blocsGeneraux({
  totalCounts: donnees.totalCounts,
  periode: donnees,
})
const activites = blocsActivites({
  totalCounts: donnees.totalCounts,
  repartition: donnees.activites,
  tags: donnees.activites.tags,
  structures: donnees.structures,
  communes: donnees.communes,
})
const beneficiaires = blocsBeneficiaires({
  profil: donnees.beneficiaires,
  residences: donnees.beneficiaires.communes,
})
const imprimes = blocsImprimes(donnees)

const Blocs = ({ children }: { children: ReactNode }) => (
  <div className="fr-flex fr-direction-column fr-flex-gap-8v">{children}</div>
)

export default {
  title: 'Statistiques des activités',
} satisfies Meta

type Story = StoryObj

export const Generale: Story = {
  name: 'Générale',
  render: () => (
    <Blocs>
      {generale.chiffresCles.rendu(donnees.totalCounts)}
      {generale.graphique.rendu(donnees)}
    </Blocs>
  ),
}

export const Activites: Story = {
  name: 'Activités',
  render: () => (
    <Blocs>
      {activites.types.rendu([donnees.totalCounts, donnees.activites])}
      {activites.thematiques.rendu(donnees.activites)}
      {activites.demarches.rendu(donnees.activites)}
      {activites.tags.rendu(donnees.activites.tags)}
      {activites.materiels.rendu(donnees.activites)}
      {activites.canauxEtDurees.rendu(donnees.activites)}
      {activites.lieux?.rendu(donnees.structures)}
      {activites.communes?.rendu(donnees.communes)}
    </Blocs>
  ),
}

export const Beneficiaires: Story = {
  name: 'Bénéficiaires',
  render: () => (
    <Blocs>
      {beneficiaires.profil.rendu(donnees.beneficiaires)}
      {beneficiaires.communes?.rendu(donnees.beneficiaires.communes)}
    </Blocs>
  ),
}

export const Imprimes: Story = {
  name: 'Imprimés',
  render: () => (
    <Blocs>
      {Object.values(imprimes.generale)}
      {Object.values(imprimes.activites)}
      {Object.values(imprimes.beneficiaires)}
    </Blocs>
  ),
}
