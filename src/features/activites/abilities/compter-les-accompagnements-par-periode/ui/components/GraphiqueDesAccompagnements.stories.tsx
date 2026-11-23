import type { Meta, StoryObj } from '@storybook/react'
import { GraphiquesImprimes } from '../slots/GraphiquesImprimes.slot'
import { GraphiqueDesAccompagnements } from './GraphiqueDesAccompagnements'

const accompagnementsParJour = [
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
]

const accompagnementsParMois = [
  { label: 'Mars', count: 305 },
  { label: 'Avr.', count: 275 },
  { label: 'Mai', count: 320 },
  { label: 'Juin', count: 330 },
  { label: 'Juil.', count: 340 },
  { label: 'Août', count: 350 },
]

export default {
  title: 'Statistiques des activités/Accompagnements par période',
} satisfies Meta

type Story = StoryObj

export const Ecran: Story = {
  name: 'Écran',
  render: () => (
    <GraphiqueDesAccompagnements
      accompagnementsParJour={accompagnementsParJour}
      accompagnementsParMois={accompagnementsParMois}
    />
  ),
}

export const Imprime: Story = {
  name: 'Imprimé',
  render: () => (
    <GraphiquesImprimes
      accompagnementsParJour={accompagnementsParJour}
      accompagnementsParMois={accompagnementsParMois}
    />
  ),
}
