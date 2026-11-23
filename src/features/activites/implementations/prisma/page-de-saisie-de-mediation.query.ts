import type { DefaultValues } from '@/libraries/formulaire/use-app-form'
import { type ActiviteConsultee, ActiviteId, MediateurId } from '../../domain'
import type { BeneficiaireTrouveParLeCra } from '../../ui/saisie/beneficiaire/beneficiaire-du-cra'
import { donneesDeLaSaisieDeMediation } from '../../ui/saisie/donnees-de-la-saisie-de-mediation'
import type { LieuDuCra } from '../../ui/saisie/lieu/lieu-du-cra'
import {
  type RechercherDesTagsInitiaux,
  type VisibiliteDuTagDuCra,
  visibilitesDuCra,
} from '../../ui/saisie/tags/tag-du-cra'
import type { CraData } from '../../ui/saisie/validation/cra.validation'
import { dureesFrequentesDuMediateur } from './durees-frequentes.query'
import { lireUneActiviteDeMediation } from './lire-une-activite-de-mediation.query'
import type { RendezVousLies } from './rendez-vous-fournis'

export type FournisseursDeLaSaisieDeMediation = {
  readonly lieuxDuMediateur: (
    mediateurId: string,
  ) => Promise<readonly LieuDuCra[]>
  readonly beneficiairesLesPlusSuivis: (
    mediateurId: string,
  ) => Promise<readonly BeneficiaireTrouveParLeCra[]>
  readonly tagsInitiaux: RechercherDesTagsInitiaux
  readonly visibilitesProposees: readonly VisibiliteDuTagDuCra[]
}

export const pageDeSaisieDeMediation =
  <T extends CraData>(
    valeursPropres?: (stateFromUrl: DefaultValues<CraData>) => DefaultValues<T>,
  ) =>
  async ({
    mediateurId,
    depart,
    fournisseurs,
  }: {
    readonly mediateurId: string
    readonly depart: DefaultValues<CraData>
    readonly fournisseurs: FournisseursDeLaSaisieDeMediation
  }) => {
    const [lieuxProposes, dureesFrequentes, beneficiairesProposes] =
      await Promise.all([
        fournisseurs.lieuxDuMediateur(mediateurId),
        dureesFrequentesDuMediateur(MediateurId(mediateurId)),
        fournisseurs.beneficiairesLesPlusSuivis(mediateurId),
      ])

    const donnees = await donneesDeLaSaisieDeMediation<T>(valeursPropres)({
      mediateurId,
      stateFromUrl: depart,
      lieuxProposes,
      dureesFrequentes,
      tagsInitiaux: fournisseurs.tagsInitiaux,
    })

    return {
      ...donnees,
      beneficiairesProposes,
      mediateurId,
      visibilitesDeTag: visibilitesDuCra(fournisseurs.visibilitesProposees, {
        departemental: false,
      }),
    }
  }

export const activiteDeMediationLue = async ({
  id,
  mediateurId,
  rendezVousLies,
}: {
  readonly id: string
  readonly mediateurId: string
  readonly rendezVousLies: RendezVousLies
}): Promise<ActiviteConsultee | null> => {
  const activiteId = ActiviteId.safe(id)
  return activiteId === null
    ? null
    : lireUneActiviteDeMediation({
        id: activiteId,
        mediateurId: MediateurId(mediateurId),
        rendezVousLies,
      })
}
