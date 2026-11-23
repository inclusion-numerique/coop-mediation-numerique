import type { Meta, StoryObj } from '@storybook/react'
import {
  dureeAccompagnementParDefautLabels,
  dureeAcompagnementParDefautDefaultValues,
} from '@/features/activites/ui/labels/libelles/duree-accompagnement.labels'
import {
  materielLabels,
  materielValues,
} from '@/features/activites/ui/labels/libelles/materiel.labels'
import {
  thematiquesAdministrativesLabels,
  thematiquesAdministrativesValues,
  thematiquesNonAdministrativesLabels,
  thematiquesNonAdministrativesValues,
} from '@/features/activites/ui/labels/libelles/thematique.labels'
import {
  typeActiviteLabels,
  typeActiviteValues,
} from '@/features/activites/ui/labels/libelles/type-activite.labels'
import {
  typeLieuLabels,
  typeLieuValues,
} from '@/features/activites/ui/labels/libelles/type-lieu.labels'
import { partsFixees } from '@/libraries/proportions/parts-fixees'
import { CanauxImprimes } from '../slots/CanauxImprimes.slot'
import { DureesImprimees } from '../slots/DureesImprimees.slot'
import { MaterielsImprimes } from '../slots/MaterielsImprimes.slot'
import { TypesDActiviteImprimes } from '../slots/TypesDActiviteImprimes.slot'
import { CanauxDesAccompagnements } from './CanauxDesAccompagnements'
import { DemarchesDesAccompagnements } from './DemarchesDesAccompagnements'
import { DureesDesAccompagnements } from './DureesDesAccompagnements'
import { MaterielsUtilises } from './MaterielsUtilises'
import { ThematiquesDesAccompagnements } from './ThematiquesDesAccompagnements'
import { TypesDActivite } from './TypesDActivite'

const repartition = {
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
}

export default {
  title: 'Statistiques des activités/Répartition des accompagnements',
} satisfies Meta

type Story = StoryObj

export const Ecran: Story = {
  name: 'Écran',
  render: () => (
    <div className="fr-flex fr-direction-column fr-flex-gap-8v">
      <TypesDActivite
        typeActivites={repartition.typeActivites}
        ateliers={400}
      />
      <ThematiquesDesAccompagnements thematiques={repartition.thematiques} />
      <DemarchesDesAccompagnements
        thematiquesDemarches={repartition.thematiquesDemarches}
      />
      <MaterielsUtilises materiels={repartition.materiels} />
      <CanauxDesAccompagnements typeLieu={repartition.typeLieu} />
      <DureesDesAccompagnements durees={repartition.durees} />
    </div>
  ),
}

export const Imprime: Story = {
  name: 'Imprimé',
  render: () => (
    <div className="fr-flex fr-direction-column fr-flex-gap-8v">
      <TypesDActiviteImprimes
        typeActivites={repartition.typeActivites}
        participations={1350}
      />
      <ThematiquesDesAccompagnements
        thematiques={repartition.thematiques}
        pourImpression
      />
      <DemarchesDesAccompagnements
        thematiquesDemarches={repartition.thematiquesDemarches}
        pourImpression
      />
      <MaterielsImprimes materiels={repartition.materiels} />
      <CanauxImprimes typeLieu={repartition.typeLieu} />
      <DureesImprimees durees={repartition.durees} />
    </div>
  ),
}
