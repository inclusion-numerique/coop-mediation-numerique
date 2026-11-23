import type { DefaultValues } from '@/libraries/formulaire/use-app-form'
import type { EncodedState } from '@/libraries/parametres-d-url/encodeSerializableState'
import type { RendezVousLies } from '../../../db/rendez-vous-fournis'
import {
  activiteDeMediationLue,
  type FournisseursDeLaSaisieDeMediation,
  pageDeSaisieDeMediation,
} from '../../../implementations/page-de-saisie-de-mediation'
import {
  cheminDeLaCopie,
  etatDeLUrl,
} from '../../../ui/saisie/chemin-de-la-copie'
import { copieDeLAtelier } from '../ui/copie-de-l-atelier.presenter'
import { craCollectifDefaultValues } from '../ui/craCollectifDefaultValues'
import { formulaireDeLAtelierCollectif } from '../ui/formulaire-de-l-atelier-collectif.presenter'
import type { CraCollectifData } from '../ui/validation/CraCollectifValidation'

type ActiviteDemandee = {
  readonly id: string
  readonly mediateurId: string
  readonly rendezVousLies: RendezVousLies
}

const atelierAReprendre = async (demande: ActiviteDemandee) => {
  const lue = await activiteDeMediationLue(demande)
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
}: ActiviteDemandee & { readonly retour?: string }) => {
  const valeurs = await atelierAReprendre(demande)
  return valeurs === null
    ? null
    : cheminDeLaCopie('collectif', copieDeLAtelier(valeurs), retour)
}
