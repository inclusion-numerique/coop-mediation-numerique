/**
 * Corrélation LIEU ↔ EMPLOYEUSE — DÉPRÉCIÉE (ADR-002 échange final).
 *
 * Historiquement, ce module comptait les emplois/activités de l'employeuse `coop.structure_administrative`
 * corrélée à un lieu par SIMILITUDE nom + adresse + code INSEE (aucun lien FK). Ça marchait parce que la
 * SA coop recopiait ces champs plats depuis le lieu.
 *
 * Depuis l'échange final, l'employeuse vit dans `main.structure_administrative` (source de vérité), où
 * l'adresse est normalisée différemment (relation `adresse`, dénomination scindée) : la corrélation
 * nom+adresse **ne matche plus de façon fiable**. De plus les emplois coop sont gelés et les activités
 * écrivent `structure_employeuse_main_id`. Ce compteur, purement **informatif** (affiché avant une fusion
 * de lieux), est donc **déprécié** : il renvoie 0 / vide, sans lire coop SA. À repenser sur main si le
 * besoin réapparaît (comptage via `personne_affectations_emploi`).
 */

type LieuCorrelationInput = {
  id: string
  nom: string
  adresse: string
  codeInsee: string | null
}

export const structureCorrelationKey = ({
  nom,
  adresse,
  codeInsee,
}: {
  nom: string
  adresse: string
  codeInsee: string | null
}) => `${nom}__${adresse}__${codeInsee ?? ''}`

/** DÉPRÉCIÉ : renvoie 0 pour chaque structure (voir en-tête du module). */
export const getEmploisCountByCorrelation = async (
  structures: LieuCorrelationInput[],
  _options: { activeOnly?: boolean } = {},
): Promise<Map<string, number>> =>
  new Map(structures.map((structure) => [structure.id, 0]))

/** DÉPRÉCIÉ : renvoie 0 (voir en-tête du module). */
export const getEmploisCountForStructure = async (
  _structure: LieuCorrelationInput,
  _options?: { activeOnly?: boolean },
): Promise<number> => 0

/** DÉPRÉCIÉ : renvoie des relations vides (voir en-tête du module). */
export const getCorrelatedEmployeuseRelations = async (_input: {
  nom: string
  adresse: string
  codeInsee: string | null
}): Promise<{ employesIds: string[]; activitesEmployeurIds: string[] }> => ({
  employesIds: [],
  activitesEmployeurIds: [],
})
