import type { FindOrCreateInput } from './findOrCreateLieuInclusion'
import { ensureStructureAdministrativeMain } from './main/ensureStructureAdministrativeMain'

// Rôle EMPLOYEUSE : garantit l'identité légale dans `main.structure_administrative` UNIQUEMENT.
//
// ADR-002 échange final : plus AUCUNE écriture dans `coop.structure_administrative`. La déduplication
// repose désormais sur la clé métier `(siret, denomination_antenne)` gérée par
// `ensureStructureAdministrativeMain` (main est la source de vérité). L'identité est fournie par
// l'appelant (saisie inscription / données SIRET) -> aucun aller-retour API Entreprise.

/**
 * Garantit la ligne `main.structure_administrative` de l'employeuse et renvoie son id main (int),
 * ou `null` si la garantie best-effort a échoué (rare : géocodage/API indisponible). Plus de coop
 * `id` : les emplois coop ne sont plus écrits (l'employeuse courante se lit via les affectations main).
 */
export const findOrCreateStructureAdministrative = async (
  input: FindOrCreateInput,
): Promise<{ mainId: number | null }> => {
  const main = await ensureStructureAdministrativeMain({
    coopId: null,
    siret: input.siret,
    identite: {
      nom: input.nom,
      adresse: input.adresse,
      commune: input.commune,
      codePostal: input.codePostal,
      codeInsee: input.codeInsee,
    },
  })
  return { mainId: main?.id ?? null }
}
