import { CodeDepartement, CodeInsee } from '@/libraries/insee'
import { BeneficiaireId } from '../identifiants/beneficiaire-id'
import { EmployeuseId } from '../identifiants/employeuse-id'
import { LieuActiviteId } from '../identifiants/lieu-activite-id'
import { MediateurId } from '../identifiants/mediateur-id'
import { TagId } from '../identifiants/tag-id'
import { TypeDActivite } from '../mediation/type-d-activite'
import { SourceDeLActivite } from '../rendez-vous/source-de-l-activite'
import { StatutDeRendezVous } from '../rendez-vous/statut-de-rendez-vous'
import { FiltreDOrigine } from './filtre-d-origine'
import { FiltreDeDemarche } from './filtre-de-demarche'
import { FiltreDeDispositif } from './filtre-de-dispositif'
import type { Periode } from './periode'
import { ThematiqueRecherchee } from './thematique-recherchee'

export type CriteresDesActivites = {
  readonly periode: Periode | null
  readonly types: readonly TypeDActivite[]
  readonly statutsDeRendezVous: readonly StatutDeRendezVous[]
  readonly mediateurs: readonly MediateurId[]
  readonly beneficiaires: readonly BeneficiaireId[]
  readonly communes: readonly CodeInsee[]
  readonly departements: readonly CodeDepartement[]
  readonly lieux: readonly LieuActiviteId[]
  readonly thematiques: readonly ThematiqueRecherchee[]
  readonly demarche: FiltreDeDemarche | null
  readonly tags: readonly TagId[]
  readonly employeuses: readonly EmployeuseId[]
  readonly dispositif: FiltreDeDispositif | null
  readonly origine: FiltreDOrigine | null
  readonly source: SourceDeLActivite | null
}

export const estFiltre = (criteres: CriteresDesActivites): boolean =>
  Object.values(criteres).some(
    (valeur) =>
      valeur !== null && (!Array.isArray(valeur) || valeur.length > 0),
  )
