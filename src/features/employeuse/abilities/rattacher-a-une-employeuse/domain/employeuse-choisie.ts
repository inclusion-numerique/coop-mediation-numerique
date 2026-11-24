// Import direct du value object, et non du barrel de la feature : ce schéma est chargé par
// un composant client, or le barrel ré-exporte les implémentations Prisma de l'employeuse —
// elles atterriraient dans le bundle client (frontière que `tsc` ne signale pas).

import { z } from 'zod'
import {
  type TypologieStructure,
  typologiesStructure,
} from '@/features/employeuse/domain/typologie-de-structure'
import { Siret } from '@/libraries/insee'
import { IdentiteEmployeuse } from '../../../domain/identite-employeuse'

/**
 * Une employeuse telle que la recherche la propose, avant tout choix : identité
 * brute, encore non validée, indifféremment issue des structures enregistrées
 * ou de l'annuaire des entreprises.
 *
 * Elle vit ici — dans le domaine — et non auprès de la recherche qui la
 * produit, parce que la combo-box et le formulaire la manipulent depuis le
 * navigateur : la référencer dans son module d'origine les ferait pointer un
 * module qui importe Prisma.
 */
export type StructureTrouvee = {
  id?: string | null
  nom: string
  adresse: string
  codePostal: string
  commune: string
  codeInsee: string
  siret: string
  typologie?: TypologieStructure | null
  source: 'database' | 'api'
}

/**
 * Ce que le formulaire envoie : l'employeuse choisie dans les résultats de
 * recherche, tous issus de Sirene ou de structures déjà enregistrées. Il n'y a
 * donc pas de saisie libre à valider — seulement à vérifier que le choix a bien
 * été fait, et qu'il porte de quoi identifier une structure.
 *
 * L'utilisateur n'est pas dans l'input : il vient de la session côté serveur.
 */
const EmployeuseChoisieValidation = z.object(
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
    id: z.string().nullable().exactOptional(),
    typologie: z
      .enum(
        Object.keys(typologiesStructure) as [
          TypologieStructure,
          ...TypologieStructure[],
        ],
      )
      .nullable()
      .exactOptional(),
    source: z.enum(['database', 'api']),
  },
  {
    error: 'Veuillez sélectionner votre structure employeuse',
  },
)

export const RenseignerStructureEmployeuseValidation = z.object({
  structure: EmployeuseChoisieValidation,
})

export type EmployeuseChoisie = z.infer<typeof EmployeuseChoisieValidation>

export const identiteDeLEmployeuseChoisie = ({
  siret,
  nom,
  adresse,
  commune,
  codePostal,
  codeInsee,
}: EmployeuseChoisie): IdentiteEmployeuse | null =>
  IdentiteEmployeuse.safe({
    siret,
    denomination: nom,
    adresse: {
      voie: adresse,
      commune,
      codePostal: codePostal || null,
      codeInsee: codeInsee || null,
    },
  })
