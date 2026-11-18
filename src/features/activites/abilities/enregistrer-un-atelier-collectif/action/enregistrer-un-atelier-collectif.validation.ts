import { z } from 'zod'
import {
  communDeLaSaisie,
  saisieDeMediation,
} from '../../../action/saisie-de-mediation'
import {
  BeneficiaireId,
  Effectif,
  NiveauDAtelier,
  PARTICIPANTS_ANONYMES_MAXIMUM,
  participantsAnonymesDe,
  participantsDeLAtelier,
  TitreDAtelier,
} from '../../../domain'
import type { SaisieCollective } from '../domain'

const nombre = z.coerce
  .number<number>()
  .int('Veuillez renseigner un nombre entier')
  .min(0, 'Le nombre doit être positif')
  .max(
    PARTICIPANTS_ANONYMES_MAXIMUM,
    'Le nombre de participants anonymes ne doit pas dépasser 10 000',
  )
  .transform(Effectif)

const DEPASSEMENT =
  'La somme des données socio-démographiques dépasse le total des bénéficiaires anonymes'

export const EnregistrerUnAtelierCollectifValidation = z
  .object({
    ...saisieDeMediation,
    titreAtelier: z.string().nullish(),
    niveau: NiveauDAtelier.schema.nullish(),
    participants: z.array(z.guid()).default([]),
    participantsAnonymes: z.object({
      total: nombre,
      dejaAccompagnes: nombre,
      genres: z.object({ masculin: nombre, feminin: nombre }),
      tranchesDAge: z.object({
        moinsDeDouze: nombre,
        douzeDixHuit: nombre,
        dixHuitVingtQuatre: nombre,
        vingtCinqTrenteNeuf: nombre,
        quaranteCinquanteNeuf: nombre,
        soixanteSoixanteNeuf: nombre,
        soixanteDixPlus: nombre,
      }),
      statutsSociaux: z.object({
        scolarise: nombre,
        sansEmploi: nombre,
        enEmploi: nombre,
        retraite: nombre,
      }),
    }),
  })
  .transform((saisie, contexte): SaisieCollective => {
    const commun = communDeLaSaisie(saisie, contexte)
    const anonymes = participantsAnonymesDe(saisie.participantsAnonymes)
    if (!anonymes.success) {
      contexte.addIssue({
        code: 'custom',
        path: ['participantsAnonymes', 'total'],
        message: DEPASSEMENT,
      })
      return z.NEVER
    }
    const suivis = saisie.participants.map(BeneficiaireId)
    const participants = participantsDeLAtelier({
      suivis,
      anonymes: anonymes.data,
    })
    if (!participants.success) {
      contexte.addIssue({
        code: 'custom',
        path: ['participants'],
        message:
          participants.error._tag === 'AtelierSansParticipant'
            ? 'Veuillez renseigner au moins un bénéficiaire suivi ou anonyme'
            : 'Un bénéficiaire est cité deux fois',
      })
      return z.NEVER
    }
    if (commun === null) return z.NEVER
    return {
      ...commun,
      titre: TitreDAtelier.safe(saisie.titreAtelier ?? ''),
      niveau: saisie.niveau ?? null,
      suivis,
      anonymes: anonymes.data,
    }
  })
