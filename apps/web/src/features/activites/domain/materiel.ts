import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

const VALEURS = ['Ordinateur', 'Telephone', 'Tablette', 'Autre'] as const

export const Materiel = defineModel(z.enum(VALEURS).brand('Materiel'))

export type Materiel = Model.TypeOf<typeof Materiel>

export const materiels: readonly Materiel[] = VALEURS.map(Materiel)
