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
import { partsFixees } from '@/libraries/proportions'
export const repartition = {
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
