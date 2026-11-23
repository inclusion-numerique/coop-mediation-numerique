import type { DefaultValues } from '@/libraries/formulaire/use-app-form'
import type { EncodedState } from '@/libraries/parametres-d-url/encodeSerializableState'
import {
  type ActiviteDeCoordination,
  ActiviteDeCoordinationId,
  CoordinateurId,
} from '../../../../domain'
import {
  cheminDeLaCopie,
  etatDeLUrl,
  type TypeDeSaisie,
} from '../../../../ui/saisie/chemin-de-la-copie'
import {
  type RechercherDesTagsInitiaux,
  type VisibiliteDuTagDuCra,
  visibilitesDuCra,
} from '../../../../ui/saisie/tags/tag-du-cra'
import type { CraAnimationData } from '../../ui/animation/validation/CraAnimationValidation'
import {
  copieDeLaCoordination,
  departDuPartenariat,
} from '../../ui/copie-de-la-coordination.presenter'
import { getCraCoordinationPageData } from '../../ui/donnees-de-la-page'
import type { CraEvenementData } from '../../ui/evenement/validation/CraEvenementValidation'
import {
  formulaireDeLAnimation,
  formulaireDeLEvenement,
  formulaireDuPartenariat,
} from '../../ui/formulaire-de-la-coordination.presenter'
import type { CraPartenariatData } from '../../ui/partenariat/validation/CraPartenariatValidation'
import { lireUneActiviteDeCoordination } from './lire-une-activite-de-coordination.query'

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

type CoordinationDemandee = {
  readonly id: string
  readonly coordinateurId: string
}

const pageDeSaisie = async (
  coordinateurId: string,
  depart: ValeursDeLaCoordination,
  fournisseurs: FournisseursDeLaSaisieDeCoordination,
) => ({
  ...(await getCraCoordinationPageData(
    coordinateurId,
    depart,
    fournisseurs.tagsInitiaux,
  )),
  coordinateurId,
  visibilitesDeTag: visibilitesDuCra(fournisseurs.visibilitesProposees, {
    departemental: true,
  }),
})

const coordinationAReprendre = async (
  saisie: FormulaireDeCoordination,
  { id, coordinateurId }: CoordinationDemandee,
) => {
  const activiteId = ActiviteDeCoordinationId.safe(id)
  const activite =
    activiteId === null
      ? null
      : await lireUneActiviteDeCoordination({
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
  }: CoordinationDemandee & { readonly retour?: string }) => {
    const valeurs = await coordinationAReprendre(saisie, demande)
    return valeurs === null
      ? null
      : cheminDeLaCopie(saisie.type, copieDeLaCoordination(valeurs), retour)
  }
