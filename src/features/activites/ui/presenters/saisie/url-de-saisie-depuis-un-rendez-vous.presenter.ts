import { dateAsIsoDay } from '@/libraries/date/date-as-iso-day'
import { encodeSerializableState } from '@/libraries/etat-encode/encode-serializable-state'
import {
  dureeDepuisLesMinutes,
  dureePersonnaliseeDepuisLesMinutes,
} from '../../forms/saisie/duree.form-data'
import { optionsDeDuree } from './options-de-duree.presenter'

export type RendezVousASaisir = {
  readonly id: number
  readonly debut: Date
  readonly dureeEnMinutes: number
  readonly titre: string | null
  readonly collectif: boolean
}

export type ParticipantDuRendezVous = {
  readonly id: string
  readonly prenom: string | null
  readonly nom: string | null
}

const dureeDuRendezVous = (
  dureeEnMinutes: number,
  dureesProposees: readonly { readonly value: string }[],
) =>
  dureesProposees.some(({ value }) => value === dureeEnMinutes.toString())
    ? (dureeDepuisLesMinutes(dureeEnMinutes) ?? undefined)
    : dureePersonnaliseeDepuisLesMinutes(dureeEnMinutes)

const participantDuFormulaire = ({
  id,
  prenom,
  nom,
}: ParticipantDuRendezVous) => ({ id, prenom, nom })

export const cheminDeSaisieDepuisUnRendezVous = ({
  rendezVous,
  participants,
  dureesProposees,
}: {
  readonly rendezVous: RendezVousASaisir
  readonly participants: readonly ParticipantDuRendezVous[]
  readonly dureesProposees: readonly { readonly value: string }[]
}): string => {
  const commun = {
    date: dateAsIsoDay(rendezVous.debut),
    duree: dureeDuRendezVous(rendezVous.dureeEnMinutes, dureesProposees),
    rdvServicePublicId: rendezVous.id,
  }
  const [premier] = participants
  return rendezVous.collectif
    ? `/coop/mes-activites/cra/collectif?v=${encodeSerializableState({
        ...commun,
        titreAtelier: rendezVous.titre ?? undefined,
        participants: participants.map(participantDuFormulaire),
      })}`
    : `/coop/mes-activites/cra/individuel?v=${encodeSerializableState({
        ...commun,
        beneficiaire:
          premier === undefined ? undefined : participantDuFormulaire(premier),
      })}`
}

export const cheminDeSaisieSelonLesDureesFrequentes = ({
  rendezVous,
  participants,
  dureesFrequentes,
}: {
  readonly rendezVous: RendezVousASaisir
  readonly participants: readonly ParticipantDuRendezVous[]
  readonly dureesFrequentes: readonly number[]
}): string =>
  cheminDeSaisieDepuisUnRendezVous({
    rendezVous,
    participants,
    dureesProposees: optionsDeDuree({ dureesFrequentes }),
  })
