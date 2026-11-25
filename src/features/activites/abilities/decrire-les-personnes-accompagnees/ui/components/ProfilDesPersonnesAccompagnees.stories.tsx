import type { Meta, StoryObj } from '@storybook/react'
import {
  genreLabels,
  genresAffiches,
  statutSocialLabels,
  statutsSociauxAffiches,
  trancheAgeLabels,
  tranchesAgeAffichees,
} from '@/features/activites/ui/labels/libelles/profil.labels'
import { partsFixees } from '@/libraries/proportions'
import { ProfilImprime } from '../slots/ProfilImprime.slot'
import { ProfilDesPersonnesAccompagnees } from './ProfilDesPersonnesAccompagnees'

const beneficiaires = {
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
}

export default {
  title: 'Statistiques des activités/Profil des personnes accompagnées',
} satisfies Meta

type Story = StoryObj

export const Ecran: Story = {
  name: 'Écran',
  render: () => (
    <ProfilDesPersonnesAccompagnees beneficiaires={beneficiaires} />
  ),
}

export const Imprime: Story = {
  name: 'Imprimé',
  render: () => <ProfilImprime beneficiaires={beneficiaires} />,
}
