import { BeneficiaireCraValidation } from '@app/web/features/beneficiaires/validation/BeneficiaireValidation'
import z from 'zod'
import { CraValidation } from '../../validation/CraValidation'
import { niveauAtelierValues } from '../fields/niveau-atelier'
import { ParticipantsAnonymesCraCollectifValidation } from './ParticipantsAnonymesCraCollectifValidation'

export const CraCollectifValidation = CraValidation.extend({
  participants: z
    .array(BeneficiaireCraValidation.extend({ id: z.string().uuid() }))
    .default([]),
  participantsAnonymes: ParticipantsAnonymesCraCollectifValidation,
  titreAtelier: z.string().nullish(),
  niveau: z.enum(niveauAtelierValues).nullish(),
})
  // structureId is required if typeLieu ===  LieuActivite
  .refine(
    (data) => (data.typeLieu === 'LieuActivite' ? !!data.structure?.id : true),
    {
      message: 'Veuillez renseigner le lieu d’activité',
      path: ['structureId'],
    },
  )
  // lieuCommuneData is required if typeLieu === Domicile ou typeLieu === Autre
  .refine(
    (data) =>
      (data.typeLieu !== 'Autre' && data.typeLieu !== 'Domicile') ||
      !!data.lieuCommuneData,
    {
      message: 'Veuillez renseigner la commune',
      path: ['lieuCommuneData'],
    },
  )

export type CraCollectifData = z.infer<typeof CraCollectifValidation>
