import type { DefaultValues } from '@/libraries/formulaire/use-app-form'
import type { EncodedState } from '@/libraries/parametres-d-url/encodeSerializableState'
import {
  activiteDeMediationLue,
  type FournisseursDeLaSaisieDeMediation,
  pageDeSaisieDeMediation,
} from '../../../../implementations/prisma/page-de-saisie-de-mediation.query'
import type { RendezVousLies } from '../../../../implementations/prisma/rendez-vous-fournis'
import {
  cheminDeLaCopie,
  etatDeLUrl,
} from '../../../../ui/presenters/saisie/chemin-de-la-copie.presenter'
import type { CraCollectifData } from '../../ui/forms/cra-collectif.validation'
import { craCollectifDefaultValues } from '../../ui/forms/valeurs-par-defaut-du-cra-collectif'
import { copieDeLAtelier } from '../../ui/presenters/copie-de-l-atelier.presenter'
import { formulaireDeLAtelierCollectif } from '../../ui/presenters/formulaire-de-l-atelier-collectif.presenter'

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
