import { type Result, success } from '@/libraries/result'
import { Effectif } from '../../../domain'
import type { CompterLesAccompagnementsPorts, DemandeDeComptage } from './ports'
import {
  nouvellesComptees,
  type TotauxDesAccompagnements,
} from './totaux-des-accompagnements'

export const compterLesAccompagnements =
  <Demande extends DemandeDeComptage>({
    activitesComptees,
    personnesComptees,
    nouvellesPersonnesComptees,
  }: CompterLesAccompagnementsPorts<Demande>) =>
  async (
    demande: Demande,
  ): Promise<Result<TotauxDesAccompagnements, never>> => {
    const [{ activites, accompagnements }, personnes, nouvelles] =
      await Promise.all([
        activitesComptees(demande),
        personnesComptees(demande),
        nouvellesComptees(demande.criteres.periode)
          ? nouvellesPersonnesComptees(demande)
          : Promise.resolve(Effectif(0)),
      ])
    return success({
      activites,
      accompagnements,
      personnes: { ...personnes, nouvelles },
    })
  }
