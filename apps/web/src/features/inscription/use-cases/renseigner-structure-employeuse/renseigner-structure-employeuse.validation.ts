// Import direct du value object, et non du barrel de la feature : ce schéma est chargé par
// un composant client, or le barrel ré-exporte les implémentations Prisma de l'employeuse —
// elles atterriraient dans le bundle client (frontière que `tsc` ne signale pas).
import { Siret } from '@app/web/features/employeuse/domain/siret'
import { z } from 'zod'

/**
 * Ce que le formulaire envoie : l'employeuse choisie dans les résultats de
 * recherche, tous issus de Sirene ou de structures déjà enregistrées. Il n'y a
 * donc pas de saisie libre à valider — seulement à vérifier que le choix a bien
 * été fait, et qu'il porte de quoi identifier une structure.
 *
 * L'utilisateur n'est pas dans l'input : il vient de la session côté serveur.
 */
export const EmployeuseChoisieValidation = z.object(
  {
    siret: Siret.schema,
    nom: z.string().trim().min(1),
    // Pas de minimum ici : une structure enregistrée peut n'avoir aucune adresse.
    // C'est `IdentiteEmployeuse` qui juge si elle est exploitable, et l'action
    // qui le rapporte — plutôt qu'une erreur de champ sur un choix de liste, que
    // l'utilisateur ne saurait pas corriger.
    commune: z.string().trim(),
    // Le résultat de recherche porte toujours ces champs, éventuellement vides
    // (une structure de l'annuaire peut n'avoir ni voie ni code INSEE) : c'est
    // l'action qui traduit le vide en absence au moment de construire
    // l'identité du domaine.
    adresse: z.string().trim(),
    codePostal: z.string().trim(),
    codeInsee: z.string().trim(),
    // Portés par les résultats de recherche, sans emploi pour le rattachement.
    id: z.string().nullish(),
    typologies: z.array(z.string()).nullish(),
    source: z.enum(['database', 'api']),
  },
  {
    required_error: 'Veuillez sélectionner votre structure employeuse',
    invalid_type_error: 'Veuillez sélectionner votre structure employeuse',
  },
)

export const RenseignerStructureEmployeuseValidation = z.object({
  structure: EmployeuseChoisieValidation,
})

export type EmployeuseChoisie = z.infer<typeof EmployeuseChoisieValidation>
export type RenseignerStructureEmployeuseData = z.infer<
  typeof RenseignerStructureEmployeuseValidation
>
