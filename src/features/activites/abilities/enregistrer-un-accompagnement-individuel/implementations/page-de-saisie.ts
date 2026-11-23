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
import { copieDeLAccompagnement } from '../ui/copie-de-l-accompagnement.presenter'
import { craIndividuelDefaultValues } from '../ui/craIndividuelDefaultValues'
import { formulaireDeLAccompagnementIndividuel } from '../ui/formulaire-de-l-accompagnement-individuel.presenter'
import type { CraIndividuelData } from '../ui/validation/CraIndividuelValidation'

type ActiviteDemandee = {
  readonly id: string
  readonly mediateurId: string
  readonly rendezVousLies: RendezVousLies
}

const accompagnementAReprendre = async (demande: ActiviteDemandee) => {
  const lue = await activiteDeMediationLue(demande)
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
}: ActiviteDemandee & { readonly retour?: string }) => {
  const valeurs = await accompagnementAReprendre(demande)
  return valeurs === null
    ? null
    : cheminDeLaCopie('individuel', copieDeLAccompagnement(valeurs), retour)
}
