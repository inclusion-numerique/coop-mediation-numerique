import {
  thematiqueAdministrativesOptions,
  thematiqueNonAdministrativesOptions,
} from '@app/web/features/activites/ui/libelles/thematique'
import { typeActiviteSlugOptions } from '@app/web/features/activites/ui/libelles/type-activite'
import {
  LieuFilter,
  type LieuFilterType,
  type LieuFilterValue,
} from '@app/web/features/lieux-activite/ui'
import { rdvStatusOptions } from '@app/web/features/rdvsp/ui/rdv-status'
import type { ActivitesFilters } from '@app/web/features/statistiques/ui/filtres/parametres-de-la-barre'
import type { VocabulaireDeLaBarre } from '@app/web/features/statistiques/ui/filtres/vocabulaire-de-la-barre'
import type { ComponentProps } from 'react'

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

const valeurDeLieu = (
  type: LieuFilterType,
  value: string[] | undefined,
): LieuFilterValue[] => (value == null ? [] : [{ type, value }])

export const filtreDeLieu = (
  { lieux, communes, departements }: ActivitesFilters,
  options: Pick<
    ComponentProps<typeof LieuFilter>,
    'lieuxActiviteOptions' | 'communesOptions' | 'departementsOptions'
  >,
) => {
  const valeurs: LieuFilterValue[] = [
    ...valeurDeLieu('lieu', lieux),
    ...valeurDeLieu('commune', communes),
    ...valeurDeLieu('departement', departements),
  ]
  return <LieuFilter defaultValue={valeurs} {...options} />
}
