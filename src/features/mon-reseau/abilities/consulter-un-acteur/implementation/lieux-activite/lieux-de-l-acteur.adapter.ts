import {
  type LieuEnListe,
  listerLesLieuxDuMediateur,
  MediateurId,
  TriDesLieux,
} from '@app/web/features/lieux-activite'

export const lieuxDeLActeur = async (
  mediateurId: string,
): Promise<readonly LieuEnListe[]> =>
  (
    await listerLesLieuxDuMediateur({
      mediateurId: MediateurId(mediateurId),
      tri: TriDesLieux(undefined),
    })
  ).map(({ lieuInclusion }) => lieuInclusion)
