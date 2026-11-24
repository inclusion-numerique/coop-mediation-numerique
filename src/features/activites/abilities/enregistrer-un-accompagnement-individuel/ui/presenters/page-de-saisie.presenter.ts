import type { EncodedState } from '@/libraries/etat-encode/encode-serializable-state'
import type { DefaultValues } from '@/libraries/formulaire/use-app-form'
import {
  cheminDeLaCopie,
  etatDeLUrl,
} from '../../../../ui/presenters/saisie/chemin-de-la-copie.presenter'
import {
  type FournisseursDeLaSaisieDeMediation,
  type LireUneActiviteDeMediation,
  pageDeSaisieDeMediation,
} from '../../../../ui/presenters/saisie/page-de-saisie-de-mediation.presenter'
import type { CraIndividuelData } from '../forms/cra-individuel.validation'
import { craIndividuelDefaultValues } from '../forms/valeurs-par-defaut-du-cra-individuel.form-data'
import { copieDeLAccompagnement } from './copie-de-l-accompagnement.presenter'
import { formulaireDeLAccompagnementIndividuel } from './formulaire-de-l-accompagnement-individuel.presenter'

type ActiviteDemandee = {
  readonly id: string
  readonly mediateurId: string
  readonly activiteLue: LireUneActiviteDeMediation
}

const accompagnementAReprendre = async ({
  activiteLue,
  ...demande
}: ActiviteDemandee) => {
  const lue = await activiteLue(demande)
  return lue?.activite._tag === 'Individuel'
    ? formulaireDeLAccompagnementIndividuel(lue.activite, lue.affichage)
    : null
}

export const nouvelleSaisieIndividuelle = ({
  mediateurId,
  v,
  fournisseurs,
}: {
  readonly mediateurId: string
  readonly v: EncodedState<DefaultValues<CraIndividuelData>> | undefined
  readonly fournisseurs: FournisseursDeLaSaisieDeMediation
}) =>
  pageDeSaisieDeMediation<CraIndividuelData>(craIndividuelDefaultValues)({
    mediateurId,
    depart: etatDeLUrl(v),
    fournisseurs,
  })

export const saisieIndividuelleAModifier = async ({
  fournisseurs,
  ...demande
}: ActiviteDemandee & {
  readonly fournisseurs: FournisseursDeLaSaisieDeMediation
}) => {
  const valeurs = await accompagnementAReprendre(demande)
  return valeurs === null
    ? null
    : pageDeSaisieDeMediation<CraIndividuelData>()({
        mediateurId: demande.mediateurId,
        depart: valeurs,
        fournisseurs,
      })
}

export const cheminDeDuplicationIndividuelle = async ({
  retour,
  ...demande
}: ActiviteDemandee & { readonly retour?: string | undefined }) => {
  const valeurs = await accompagnementAReprendre(demande)
  return valeurs === null
    ? null
    : cheminDeLaCopie('individuel', copieDeLAccompagnement(valeurs), retour)
}
