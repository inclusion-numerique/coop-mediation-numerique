import type { EncodedState } from '@/libraries/etat-encode'
import type { DefaultValues } from '@/libraries/formulaire/hooks'
import {
  type ActiviteDeCoordination,
  ActiviteDeCoordinationId,
  CoordinateurId,
} from '../../../../domain'
import {
  cheminDeLaCopie,
  etatDeLUrl,
  type TypeDeSaisie,
} from '../../../../ui/presenters/saisie/chemin-de-la-copie.presenter'
import {
  type RechercherDesTagsInitiaux,
  type VisibiliteDuTagDuCra,
  visibilitesDuCra,
} from '../../../../ui/presenters/saisie/tag-du-cra.presenter'
import type { CraAnimationData } from '../forms/cra-animation.validation'
import type { CraEvenementData } from '../forms/cra-evenement.validation'
import type { CraPartenariatData } from '../forms/cra-partenariat.validation'
import {
  copieDeLaCoordination,
  departDuPartenariat,
} from './copie-de-la-coordination.presenter'
import { donneesDeLaPage } from './donnees-de-la-page.presenter'
import {
  formulaireDeLAnimation,
  formulaireDeLEvenement,
  formulaireDuPartenariat,
} from './formulaire-de-la-coordination.presenter'

type ValeursDeLaCoordination = DefaultValues<
  CraAnimationData | CraEvenementData | CraPartenariatData
>

export type FormulaireDeCoordination = {
  readonly type: TypeDeSaisie
  readonly formulaire: (
    activite: ActiviteDeCoordination,
  ) => ValeursDeLaCoordination | null
  readonly depart: (etat: ValeursDeLaCoordination) => ValeursDeLaCoordination
}

export const saisieDAnimation: FormulaireDeCoordination = {
  type: 'animation',
  formulaire: (activite) =>
    activite._tag === 'Animation' ? formulaireDeLAnimation(activite) : null,
  depart: (etat) => etat,
}

export const saisieDEvenement: FormulaireDeCoordination = {
  type: 'evenement',
  formulaire: (activite) =>
    activite._tag === 'Evenement' ? formulaireDeLEvenement(activite) : null,
  depart: (etat) => etat,
}

export const saisieDePartenariat: FormulaireDeCoordination = {
  type: 'partenariat',
  formulaire: (activite) =>
    activite._tag === 'Partenariat' ? formulaireDuPartenariat(activite) : null,
  depart: departDuPartenariat,
}

export type FournisseursDeLaSaisieDeCoordination = {
  readonly tagsInitiaux: RechercherDesTagsInitiaux
  readonly visibilitesProposees: readonly VisibiliteDuTagDuCra[]
}

type LireUneActiviteDeCoordination = (demande: {
  readonly id: ActiviteDeCoordinationId
  readonly coordinateurId: CoordinateurId
}) => Promise<ActiviteDeCoordination | null>

type CoordinationDemandee = {
  readonly id: string
  readonly coordinateurId: string
  readonly activiteLue: LireUneActiviteDeCoordination
}

const pageDeSaisie = async (
  coordinateurId: string,
  depart: ValeursDeLaCoordination,
  fournisseurs: FournisseursDeLaSaisieDeCoordination,
) => ({
  ...(await donneesDeLaPage(coordinateurId, depart, fournisseurs.tagsInitiaux)),
  coordinateurId,
  visibilitesDeTag: visibilitesDuCra(fournisseurs.visibilitesProposees, {
    departemental: true,
  }),
})

const coordinationAReprendre = async (
  saisie: FormulaireDeCoordination,
  { id, coordinateurId, activiteLue }: CoordinationDemandee,
) => {
  const activiteId = ActiviteDeCoordinationId.safe(id)
  const activite =
    activiteId === null
      ? null
      : await activiteLue({
          id: activiteId,
          coordinateurId: CoordinateurId(coordinateurId),
        })
  return activite === null ? null : saisie.formulaire(activite)
}

export const nouvelleSaisieDeCoordination =
  (saisie: FormulaireDeCoordination) =>
  ({
    coordinateurId,
    v,
    fournisseurs,
  }: {
    readonly coordinateurId: string
    readonly v: EncodedState<ValeursDeLaCoordination> | undefined
    readonly fournisseurs: FournisseursDeLaSaisieDeCoordination
  }) =>
    pageDeSaisie(coordinateurId, saisie.depart(etatDeLUrl(v)), fournisseurs)

export const saisieDeCoordinationAModifier =
  (saisie: FormulaireDeCoordination) =>
  async ({
    fournisseurs,
    ...demande
  }: CoordinationDemandee & {
    readonly fournisseurs: FournisseursDeLaSaisieDeCoordination
  }) => {
    const valeurs = await coordinationAReprendre(saisie, demande)
    return valeurs === null
      ? null
      : pageDeSaisie(demande.coordinateurId, valeurs, fournisseurs)
  }

export const cheminDeDuplicationDeCoordination =
  (saisie: FormulaireDeCoordination) =>
  async ({
    retour,
    ...demande
  }: CoordinationDemandee & { readonly retour?: string | undefined }) => {
    const valeurs = await coordinationAReprendre(saisie, demande)
    return valeurs === null
      ? null
      : cheminDeLaCopie(saisie.type, copieDeLaCoordination(valeurs), retour)
  }
