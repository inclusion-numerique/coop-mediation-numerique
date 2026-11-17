import {
  thematiqueAdministrativesOptions,
  thematiqueNonAdministrativesOptions,
} from '@app/web/features/activites/ui/libelles/thematique'
import { typeActiviteSlugOptions } from '@app/web/features/activites/ui/libelles/type-activite'
import { rdvStatusOptions } from '@app/web/features/rdvsp/ui/rdv-status'
import { FiltreDeLieu } from '@app/web/features/statistiques/ui/filtres/FiltreDeLieu'
import type { LieuxChoisisDeLaBarre } from '@app/web/features/statistiques/ui/filtres/lieux-choisis'
import type { VocabulaireDeLaBarre } from '@app/web/features/statistiques/ui/filtres/vocabulaire-de-la-barre'

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
