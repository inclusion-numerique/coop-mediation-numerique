import { valeurDe } from '../../../../../../libraries/collections'
import { estAdministrative } from '../../../../domain'
import { tranchesDeDureeDesStatistiques } from '../../../../ui/labels/libelles/duree-accompagnement.labels'
import { materielLabels } from '../../../../ui/labels/libelles/materiel.labels'
import { thematiqueLabels } from '../../../../ui/labels/libelles/thematique.labels'
import { typeActiviteLabels } from '../../../../ui/labels/libelles/type-activite.labels'
import { typeLieuLabels } from '../../../../ui/labels/libelles/type-lieu.labels'
import { partsPresentees } from '../../../../ui/presenters/parts-presentees.presenter'
import {
  type RepartitionDesAccompagnements,
  type TrancheDeDuree,
} from '../../domain'

const avecLibelle =
  <V extends string>(libelles: Readonly<Record<V, string>>) =>
  (valeur: V) => ({ value: valeur, label: valeurDe(libelles)(valeur) })

const [
  moinsDe30Minutes,
  de30MinutesA1Heure,
  de1HeureA2Heures,
  deuxHeuresEtPlus,
] = tranchesDeDureeDesStatistiques

const libelleDeTranche: Readonly<
  Record<TrancheDeDuree, (typeof tranchesDeDureeDesStatistiques)[number]>
> = {
  MoinsDe30Minutes: moinsDe30Minutes,
  De30MinutesA1Heure: de30MinutesA1Heure,
  De1HeureA2Heures: de1HeureA2Heures,
  DeuxHeuresEtPlus: deuxHeuresEtPlus,
}

const trancheAffichee = (tranche: TrancheDeDuree) => {
  const { key, label } = valeurDe(libelleDeTranche)(tranche)
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
  total: Number(total),
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
