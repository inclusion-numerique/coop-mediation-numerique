import { type Result, success } from '@/libraries/result'
import type { AccueilRafraichi } from './accueil-rafraichi'
import type { EchecDeRafraichirAccueilRdv } from './errors'
import type {
  DemandeurDuRafraichissement,
  RafraichirAccueilRdvPorts,
} from './ports'

export const rafraichirAccueilRdv =
  <Widget>({ declencher, consulter }: RafraichirAccueilRdvPorts<Widget>) =>
  async ({
    demandeur,
    maintenant,
  }: {
    readonly demandeur: DemandeurDuRafraichissement
    readonly maintenant: Date
  }): Promise<
    Result<AccueilRafraichi<Widget>, EchecDeRafraichirAccueilRdv>
  > => {
    const rattrapage = await declencher({
      demandeur,
      utilisateurId: demandeur.id,
      seulementSansWebhook: true,
      maintenant,
    })

    if (!rattrapage.success) return rattrapage

    const { derive } = rattrapage.data

    if (derive === 0) return success({ _tag: 'inchange' })

    const consultation = await consulter({
      utilisateurId: demandeur.id,
      maintenant,
    })

    return success({
      _tag: 'rafraichi',
      derive,
      widget: consultation.data.widget,
    })
  }
