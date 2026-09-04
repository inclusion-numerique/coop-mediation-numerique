import {
  type TypologieStructure,
  typologiesStructure,
} from '@app/web/external-apis/api-entreprise/typologieStructure'
import { AdresseBanValidation } from '@app/web/external-apis/ban/AdresseBanValidation'
// `Siret` vient du barrel CLIENT d'employeuse, pas de son `domain/` : une feature
// n'atteint une autre feature que par sa frontière. Ce schéma étant chargé par un
// composant client, c'est bien `index` qu'il faut viser et non `server`, seul à
// embarquer les implémentations Prisma.
import { Siret } from '@app/web/features/employeuse'
import { z } from 'zod'
import type { StructureEmployeuseInput } from '../domain'

/**
 * L'employeuse n'est pas saisie mais CHOISIE dans une liste, dont les entrées
 * viennent de `main` ou de l'annuaire des entreprises. Il n'y a donc rien à
 * valider comme une saisie libre : seulement à vérifier que le choix porte de
 * quoi identifier une structure.
 *
 * D'où deux assouplissements par rapport à un formulaire de saisie :
 * - `id` n'est pas un uuid. Depuis l'ADR-002 la recherche rend l'identifiant de
 *   `main.structure_administrative`, un entier stringifié. Il n'est d'ailleurs
 *   pas utilisé par le rattachement, qui repart du SIRET.
 * - le SIRET n'est vérifié qu'en FORME (14 chiffres). Rejouer ici la clé de
 *   Luhn ferait rejeter des SIRET que SIRENE nous donne pour authentiques, sur
 *   un choix de liste que l'utilisateur ne saurait pas corriger.
 */
const StructureEmployeuseShape = z.object({
  id: z.string().nullish(),
  nom: z.string().min(1, 'Le nom est requis'),
  siret: Siret.schema,
  adresseBan: AdresseBanValidation,
  // La typologie déduite de l'annuaire n'entre pas dans l'input du domaine :
  // elle sert à reconnaître la structure dans la liste et sur la carte, pas à
  // la rattacher. Le formulaire la porte, la commande l'ignore.
  typologie: z
    .enum(
      Object.keys(typologiesStructure) as [
        TypologieStructure,
        ...TypologieStructure[],
      ],
    )
    .nullish(),
})

/** Forme du formulaire (validateur client `useAppForm`). */
export const renseignerStructureEmployeuseFormShape = z.object({
  structureEmployeuse: StructureEmployeuseShape,
})

export type RenseignerStructureEmployeuseFormData = z.infer<
  typeof renseignerStructureEmployeuseFormShape
>

/** Contrat d'input de la server action : valide puis projette vers l'input domaine. */
export const RenseignerStructureEmployeuseValidation =
  renseignerStructureEmployeuseFormShape.transform(
    ({
      structureEmployeuse,
    }): { structureEmployeuse: StructureEmployeuseInput } => ({
      structureEmployeuse: {
        id: structureEmployeuse.id ?? null,
        nom: structureEmployeuse.nom,
        siret: structureEmployeuse.siret,
        adresse: {
          id: structureEmployeuse.adresseBan.id,
          nom: structureEmployeuse.adresseBan.nom,
          commune: structureEmployeuse.adresseBan.commune,
          codeInsee: structureEmployeuse.adresseBan.codeInsee,
          codePostal: structureEmployeuse.adresseBan.codePostal,
          contexte: structureEmployeuse.adresseBan.contexte,
          latitude: structureEmployeuse.adresseBan.latitude,
          longitude: structureEmployeuse.adresseBan.longitude,
        },
      },
    }),
  )
