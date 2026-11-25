import type { EncodedState } from '@/libraries/etat-encode'
import type { DefaultValues } from '@/libraries/formulaire/hooks'
import {
  cheminDeLaCopie,
  etatDeLUrl,
} from '../../../../ui/presenters/saisie/chemin-de-la-copie.presenter'
import {
  type FournisseursDeLaSaisieDeMediation,
  type LireUneActiviteDeMediation,
  pageDeSaisieDeMediation,
} from '../../../../ui/presenters/saisie/page-de-saisie-de-mediation.presenter'
import type { CraCollectifData } from '../forms/cra-collectif.validation'
import { craCollectifDefaultValues } from '../forms/valeurs-par-defaut-du-cra-collectif.form-data'
import { copieDeLAtelier } from './copie-de-l-atelier.presenter'
import { formulaireDeLAtelierCollectif } from './formulaire-de-l-atelier-collectif.presenter'

type ActiviteDemandee = {
  readonly id: string
  readonly mediateurId: string
  readonly activiteLue: LireUneActiviteDeMediation
}

const atelierAReprendre = async ({
  activiteLue,
  ...demande
}: ActiviteDemandee) => {
  const lue = await activiteLue(demande)
  return lue?.activite._tag === 'Collectif'
    ? formulaireDeLAtelierCollectif(lue.activite, lue.affichage)
    : null
}

export const nouvelleSaisieCollective = ({
  mediateurId,
  v,
  fournisseurs,
}: {
  readonly mediateurId: string
  readonly v: EncodedState<DefaultValues<CraCollectifData>> | undefined
  readonly fournisseurs: FournisseursDeLaSaisieDeMediation
}) =>
  pageDeSaisieDeMediation<CraCollectifData>(craCollectifDefaultValues)({
    mediateurId,
    depart: etatDeLUrl(v),
    fournisseurs,
  })

export const saisieCollectiveAModifier = async ({
  fournisseurs,
  ...demande
}: ActiviteDemandee & {
  readonly fournisseurs: FournisseursDeLaSaisieDeMediation
}) => {
  const valeurs = await atelierAReprendre(demande)
  return valeurs === null
    ? null
    : pageDeSaisieDeMediation<CraCollectifData>()({
        mediateurId: demande.mediateurId,
        depart: valeurs,
        fournisseurs,
      })
}

export const cheminDeDuplicationCollective = async ({
  retour,
  ...demande
}: ActiviteDemandee & { readonly retour?: string | undefined }) => {
  const valeurs = await atelierAReprendre(demande)
  return valeurs === null
    ? null
    : cheminDeLaCopie('collectif', copieDeLAtelier(valeurs), retour)
}
