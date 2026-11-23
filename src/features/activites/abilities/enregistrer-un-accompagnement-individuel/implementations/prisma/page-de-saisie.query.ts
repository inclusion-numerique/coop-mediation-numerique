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
} from '../../../../ui/presenters/saisie/chemin-de-la-copie'
import type { CraIndividuelData } from '../../ui/presenters/CraIndividuelValidation'
import { copieDeLAccompagnement } from '../../ui/presenters/copie-de-l-accompagnement.presenter'
import { craIndividuelDefaultValues } from '../../ui/presenters/craIndividuelDefaultValues'
import { formulaireDeLAccompagnementIndividuel } from '../../ui/presenters/formulaire-de-l-accompagnement-individuel.presenter'

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
