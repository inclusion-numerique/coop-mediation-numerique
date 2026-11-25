import { MediateurId } from '../../domain'
import { dureesFrequentesDuMediateur } from './durees-frequentes.query'

export const urlDeSaisieDepuisUnRendezVousAvec =
  <RendezVous, Participant>(
    cheminDeSaisie: (saisie: {
      readonly rendezVous: RendezVous
      readonly participants: readonly Participant[]
      readonly dureesFrequentes: readonly number[]
    }) => string,
  ) =>
  async ({
    rendezVous,
    mediateurId,
    beneficiaires,
  }: {
    readonly rendezVous: RendezVous
    readonly mediateurId: string
    readonly beneficiaires: readonly Participant[]
  }): Promise<string> =>
    cheminDeSaisie({
      rendezVous,
      participants: beneficiaires,
      dureesFrequentes: await dureesFrequentesDuMediateur(
        MediateurId(mediateurId),
      ),
    })
