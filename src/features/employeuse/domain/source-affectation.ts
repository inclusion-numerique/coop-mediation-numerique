import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

const sourcesAffectation = ['idposte', 'coop', 'autre'] as const

type SourceConnue = (typeof sourcesAffectation)[number]

/**
 * `main.personne_affectations_emploi.source` est un `varchar` libre côté
 * Entrepôt : d'autres producteurs y écrivent des valeurs que nous ne
 * connaissons pas. On n'en distingue que deux — `idposte` (dispositif
 * conseiller numérique, produit par l'Entrepôt) et `coop` (le déclaratif saisi
 * chez nous) — et tout le reste tombe dans `autre`.
 *
 * Constructeur total : une source inconnue est une valeur du domaine, pas une
 * erreur ; elle ne doit jamais faire échouer la lecture d'une employeuse.
 */
const sourcesConnues: Record<string, SourceConnue> = {
  idposte: 'idposte',
  coop: 'coop',
}

export const SourceAffectation = defineModel(
  z
    .string()
    .nullish()
    .transform(
      (value): SourceConnue =>
        sourcesConnues[(value ?? '').trim().toLowerCase()] ?? 'autre',
    ),
)

export type SourceAffectation = Model.TypeOf<typeof SourceAffectation>
