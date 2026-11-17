import z from 'zod'
import { ParticipantsAnonymesCraCollectifValidation } from '@/features/activites/abilities/enregistrer-un-atelier-collectif/ui/validation/ParticipantsAnonymesCraCollectifValidation'
import { niveauAtelierValues } from '@/features/activites/ui/libelles/niveau-atelier'
import { BeneficiaireCraValidation } from '@/features/activites/ui/saisie/validation/BeneficiaireCraValidation'
import { CraValidation } from '@/features/activites/ui/saisie/validation/CraValidation'

export const CraCollectifValidation = CraValidation.extend({
  participants: z
    .array(BeneficiaireCraValidation.extend({ id: z.guid() }))
    .default([]),
  participantsAnonymes: ParticipantsAnonymesCraCollectifValidation,
  titreAtelier: z.string().nullish(),
  niveau: z.enum(niveauAtelierValues).nullish(),
})
  .refine(
    (data) => (data.typeLieu === 'LieuActivite' ? !!data.structure?.id : true),
    {
      message: 'Veuillez renseigner le lieu d’activité',
      path: ['structureId'],
    },
  )
  .refine(
    (data) =>
      (data.typeLieu !== 'Autre' && data.typeLieu !== 'Domicile') ||
      !!data.lieuCommuneData,
    {
      message: 'Veuillez renseigner la commune',
      path: ['lieuCommuneData'],
    },
  )
  .refine(
    (data) => {
      return data.participants.length > 0 || data.participantsAnonymes.total > 0
    },
    {
      message: 'Veuillez renseigner au moins un bénéficiaire suivi ou anonyme',
      path: ['participants'],
    },
  )
export type CraCollectifData = z.infer<typeof CraCollectifValidation>
