import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const sourcesAffectation = ['idposte', 'coop', 'autre'] as const

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

/**
 * Ordre d'autorité entre sources : `idposte` fait foi (il vient du dispositif),
 * sinon le déclaratif `coop`, sinon le reste. Exhaustif par construction — une
 * nouvelle source ajoutée à l'enum ne compile pas tant qu'elle n'a pas de rang.
 */
export const prioriteSource: Record<SourceAffectation, number> = {
  idposte: 0,
  coop: 1,
  autre: 2,
}
