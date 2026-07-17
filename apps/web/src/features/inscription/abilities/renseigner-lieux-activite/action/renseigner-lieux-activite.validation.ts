import { z } from 'zod'

/**
 * Un lieu d'activité soumis : identité (pour la réconciliation) + nom et adresse
 * géocodée (pour matérialiser un lieu inexistant). Un lieu existant porte son
 * `id` ; un nouveau lieu (SIRET ou saisie manuelle) porte nom + adresse géocodée.
 * Le reste des informations du lieu est renseigné plus tard dans la gestion des
 * lieux d'activité.
 */
const LieuActiviteInputValidation = z.object({
  id: z.string().uuid().nullish(),
  structureCartographieNationaleId: z.string().nullish(),
  nom: z.string().min(1, 'Veuillez renseigner le nom du lieu'),
  adresse: z.string().min(1, 'Veuillez renseigner une adresse'),
  commune: z.string().min(1),
  codePostal: z.string().min(1),
  codeInsee: z.string().nullish(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
})

/**
 * Contrat d'input de la server action : la liste des lieux d'activité désirés
 * (au moins un). L'utilisateur vient de l'authentification, pas de l'input.
 */
export const RenseignerLieuxActiviteValidation = z.object({
  lieuxActivite: z
    .array(LieuActiviteInputValidation, {
      required_error: 'Veuillez renseigner au moins un lieu d’activité',
    })
    .min(1, 'Veuillez renseigner au moins un lieu d’activité'),
})

export type RenseignerLieuxActiviteData = z.infer<
  typeof RenseignerLieuxActiviteValidation
>
