import { getServerUrl } from '@app/web/utils/baseUrl'
import { MediateurId } from '../domain'
import { optionsDeDuree } from '../ui/saisie/options-de-duree'
import {
  cheminDeSaisieDepuisUnRendezVous,
  type ParticipantDuRendezVous,
  type RendezVousASaisir,
} from '../ui/saisie/url-de-saisie-depuis-un-rendez-vous'
import { dureesFrequentesDuMediateur } from './durees-frequentes'

export const urlDeSaisieDepuisUnRendezVous = async ({
  rendezVous,
  mediateurId,
  beneficiaires,
}: {
  readonly rendezVous: RendezVousASaisir
  readonly mediateurId: string
  readonly beneficiaires: readonly ParticipantDuRendezVous[]
}): Promise<string> =>
  getServerUrl(
    cheminDeSaisieDepuisUnRendezVous({
      rendezVous,
      participants: beneficiaires,
      dureesProposees: optionsDeDuree({
        dureesFrequentes: await dureesFrequentesDuMediateur(
          MediateurId(mediateurId),
        ),
      }),
    }),
    { absolutePath: true },
  )
