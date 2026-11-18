import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'
import { AdresseCourriel } from './adresse-courriel'
import type { CourrielHash } from './courriel-hash'

const PRENOM_ANONYME = 'Utilisateur'
const NOM_ANONYME = 'Supprimé'
const DOMAINE_COURRIEL_ANONYME = 'coop-numerique.anct.gouv.fr'

export const IdentiteAnonyme = defineModel(
  z
    .object({
      prenom: z.literal(PRENOM_ANONYME),
      nom: z.literal(NOM_ANONYME),
      nomComplet: z.literal(`${PRENOM_ANONYME} ${NOM_ANONYME}`),
      courriel: AdresseCourriel.schema,
    })
    .brand('IdentiteAnonyme'),
)

export type IdentiteAnonyme = Model.TypeOf<typeof IdentiteAnonyme>

export const identiteAnonyme = (hash: CourrielHash): IdentiteAnonyme =>
  IdentiteAnonyme({
    prenom: PRENOM_ANONYME,
    nom: NOM_ANONYME,
    nomComplet: `${PRENOM_ANONYME} ${NOM_ANONYME}`,
    courriel: AdresseCourriel(`deleted+${hash}@${DOMAINE_COURRIEL_ANONYME}`),
  })

export const estCourrielAnonymise = (courriel: AdresseCourriel): boolean =>
  courriel.startsWith('deleted+') &&
  courriel.endsWith(`@${DOMAINE_COURRIEL_ANONYME}`)
