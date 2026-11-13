import type { Repartition } from '../../../domain'
import {
  genreLabels,
  genresAffiches,
  statutSocialLabels,
  statutsSociauxAffiches,
  trancheAgeLabels,
  tranchesAgeAffichees,
} from '../../../ui/libelles/profil'
import { valeurDe } from '../../../ui/libelles/valeur-de'
import { partsPresentees } from '../../../ui/statistiques/parts-presentees'
import type { ProfilDesPersonnesAccompagnees } from '../domain'

const dansLOrdre = <V extends string>(
  lignes: Repartition<V>,
  ordre: readonly string[],
): Repartition<V> =>
  ordre.flatMap((valeur) => lignes.filter((ligne) => ligne.valeur === valeur))

const avecLibelle =
  <V extends string>(libelles: Readonly<Record<V, string>>) =>
  (valeur: V) => ({ value: valeur, label: valeurDe(libelles)(valeur) })

export const profilPresente = ({
  total,
  genres,
  tranchesDAge,
  statutsSociaux,
}: ProfilDesPersonnesAccompagnees) => ({
  total: Number(total),
  genres: partsPresentees(
    dansLOrdre(genres, genresAffiches),
    avecLibelle(genreLabels),
  ),
  trancheAges: partsPresentees(
    dansLOrdre(tranchesDAge, tranchesAgeAffichees),
    avecLibelle(trancheAgeLabels),
  ),
  statutsSocial: partsPresentees(
    dansLOrdre(statutsSociaux, statutsSociauxAffiches),
    avecLibelle(statutSocialLabels),
  ),
})

export type ProfilPresente = ReturnType<typeof profilPresente>
