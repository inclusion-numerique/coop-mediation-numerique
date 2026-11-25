import type { DefaultValues } from '@/libraries/formulaire'
import type { BeneficiaireTrouveParLeCra } from '../../../action/rechercher-des-beneficiaires.key'
import { type ActiviteConsultee, MediateurId } from '../../../domain'
import type { CraData } from '../../forms/cra.validation'
import { donneesDeLaSaisieDeMediation } from './donnees-de-la-saisie-de-mediation.presenter'
import type { LieuDuCra } from './lieu-du-cra.presenter'
import {
  type RechercherDesTagsInitiaux,
  type VisibiliteDuTagDuCra,
  visibilitesDuCra,
} from './tag-du-cra.presenter'

export type FournisseursDeLaSaisieDeMediation = {
  readonly lieuxDuMediateur: (
    mediateurId: string,
  ) => Promise<readonly LieuDuCra[]>
  readonly beneficiairesLesPlusSuivis: (
    mediateurId: string,
  ) => Promise<readonly BeneficiaireTrouveParLeCra[]>
  readonly dureesFrequentes: (
    mediateurId: MediateurId,
  ) => Promise<readonly number[]>
  readonly tagsInitiaux: RechercherDesTagsInitiaux
  readonly visibilitesProposees: readonly VisibiliteDuTagDuCra[]
}

export type LireUneActiviteDeMediation = (demande: {
  readonly id: string
  readonly mediateurId: string
}) => Promise<ActiviteConsultee | null>

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
        fournisseurs.dureesFrequentes(MediateurId(mediateurId)),
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
