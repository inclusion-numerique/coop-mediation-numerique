import { estAdministrative } from '../../../domain'
import { dureeAccompagnementStatisticsRanges } from '../../../ui/libelles/duree-accompagnement'
import { materielLabels } from '../../../ui/libelles/materiel'
import { thematiqueLabels } from '../../../ui/libelles/thematique'
import { typeActiviteLabels } from '../../../ui/libelles/type-activite'
import { typeLieuLabels } from '../../../ui/libelles/type-lieu'
import { valeurDe } from '../../../ui/libelles/valeur-de'
import { partsPresentees } from '../../../ui/statistiques/parts-presentees'
import {
  type RepartitionDesAccompagnements,
  type TrancheDeDuree,
  tranchesDeDuree,
} from '../domain'

const avecLibelle =
  <V extends string>(libelles: Readonly<Record<V, string>>) =>
  (valeur: V) => ({ value: valeur, label: valeurDe(libelles)(valeur) })

const trancheAffichee = (tranche: TrancheDeDuree) => {
  const { key, label } =
    dureeAccompagnementStatisticsRanges[tranchesDeDuree.indexOf(tranche)] ??
    dureeAccompagnementStatisticsRanges[0]
  return { value: key, label }
}

export const repartitionPresentee = ({
  total,
  types,
  durees,
  typesDeLieu,
  thematiques,
  materiels,
}: RepartitionDesAccompagnements) => ({
  total,
  typeActivites: partsPresentees(types, avecLibelle(typeActiviteLabels)),
  durees: partsPresentees(durees, trancheAffichee),
  typeLieu: partsPresentees(typesDeLieu, avecLibelle(typeLieuLabels)),
  thematiques: partsPresentees(
    thematiques.filter(({ valeur }) => !estAdministrative(valeur)),
    avecLibelle(thematiqueLabels),
  ),
  thematiquesDemarches: partsPresentees(
    thematiques.filter(({ valeur }) => estAdministrative(valeur)),
    avecLibelle(thematiqueLabels),
  ),
  materiels: partsPresentees(materiels, avecLibelle(materielLabels)),
})

export type RepartitionPresentee = ReturnType<typeof repartitionPresentee>
