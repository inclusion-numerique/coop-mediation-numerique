import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

const libelle = (brand: string) => z.string().trim().min(1).brand(brand)

/** Raison sociale d'une organisation telle que RDV Service Public l'affiche. */
export const NomOrganisation = defineModel(libelle('NomOrganisation'))
export type NomOrganisation = Model.TypeOf<typeof NomOrganisation>

/** Libellé du motif sur lequel le rendez-vous a été pris. */
export const NomMotif = defineModel(libelle('NomMotif'))
export type NomMotif = Model.TypeOf<typeof NomMotif>

/**
 * Nom donné à un atelier collectif côté RDV Service Public. Optionnel dans leur
 * modèle : un `RdvCollectif` peut parfaitement n'en porter aucun.
 */
export const NomAtelier = defineModel(libelle('NomAtelier'))
export type NomAtelier = Model.TypeOf<typeof NomAtelier>
