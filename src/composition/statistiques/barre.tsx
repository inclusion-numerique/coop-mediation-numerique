import {
  thematiqueAdministrativesOptions,
  thematiqueNonAdministrativesOptions,
} from '@/features/activites/ui/libelles/thematique'
import { typeActiviteSlugOptions } from '@/features/activites/ui/libelles/type-activite'
import { rdvStatusOptions } from '@/features/rdvsp/ui/rdv-status'
import { FiltreDeLieu } from '@/features/statistiques/ui/filtres/FiltreDeLieu'
import type { LieuxChoisisDeLaBarre } from '@/features/statistiques/ui/filtres/lieux-choisis'
import type { VocabulaireDeLaBarre } from '@/features/statistiques/ui/filtres/vocabulaire-de-la-barre'

const AIDE_AUX_DEMARCHES = 'AideAuxDemarchesAdministratives'

export const vocabulaireDeLaBarre: VocabulaireDeLaBarre = {
  typesDActivite: typeActiviteSlugOptions,
  statutsDeRendezVous: rdvStatusOptions,
  thematiquesDeMediation: thematiqueNonAdministrativesOptions.filter(
    ({ value }) => value !== AIDE_AUX_DEMARCHES,
  ),
  thematiquesAdministratives: thematiqueAdministrativesOptions,
  toutesLesThematiques: [
    ...thematiqueNonAdministrativesOptions,
    ...thematiqueAdministrativesOptions,
  ],
}

export const filtreDeLieu = (choisis: LieuxChoisisDeLaBarre) => (
  <FiltreDeLieu choisis={choisis} />
)
