import type { CompteRdv } from '@/features/rdvsp/domain/compte/compte-rdv'
import { type Result, success } from '@/libraries/result'
import { type BilanDeSynchronisation, comptesEligibles } from './bilan'
import type {
  DeclencherLaSynchronisation,
  SynchroniserTousLesComptesRdvPorts,
} from './ports'

type Issues = Pick<BilanDeSynchronisation, 'synchronises' | 'echecs'>

const aucuneIssue: Issues = { synchronises: [], echecs: [] }

const synchroniser =
  (declencher: DeclencherLaSynchronisation, maintenant: Date) =>
  async (acquis: Issues, { utilisateurId }: CompteRdv): Promise<Issues> => {
    const resultat = await declencher({
      demandeur: { id: utilisateurId, role: 'User' },
      utilisateurId,
      seulementSansWebhook: false,
      maintenant,
    })

    return resultat.success
      ? { ...acquis, synchronises: [...acquis.synchronises, utilisateurId] }
      : {
          ...acquis,
          echecs: [
            ...acquis.echecs,
            { utilisateurId, raison: resultat.error._tag },
          ],
        }
  }

export const synchroniserTousLesComptesRdv =
  ({ lireLesComptes, declencher }: SynchroniserTousLesComptesRdvPorts) =>
  async ({
    maintenant,
  }: {
    readonly maintenant: Date
  }): Promise<Result<BilanDeSynchronisation, never>> => {
    const comptes = await lireLesComptes()
    const eligibles = comptesEligibles(comptes, maintenant)

    const issues = await eligibles.reduce<Promise<Issues>>(
      async (precedentes, compte) =>
        synchroniser(declencher, maintenant)(await precedentes, compte),
      Promise.resolve(aucuneIssue),
    )

    return success({
      comptes: comptes.length,
      eligibles: eligibles.length,
      ...issues,
    })
  }
