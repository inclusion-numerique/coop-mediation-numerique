import type { CompteRdv } from '@/features/rdvsp/domain/compte/compte-rdv'
import { type Result, success } from '@/libraries/result'
import {
  type BilanDeSynchronisation,
  type CompteEnEchec,
  comptesEligibles,
} from './bilan'
import type {
  DeclencherLaSynchronisation,
  SynchroniserTousLesComptesRdvPorts,
} from './ports'

const synchroniser =
  (declencher: DeclencherLaSynchronisation, maintenant: Date) =>
  async ({ utilisateurId }: CompteRdv): Promise<CompteEnEchec | null> => {
    const resultat = await declencher({
      demandeur: { id: utilisateurId, role: 'User' },
      utilisateurId,
      seulementSansWebhook: false,
      maintenant,
    })

    return resultat.success
      ? null
      : { utilisateurId, raison: resultat.error._tag }
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

    const echecs = await eligibles.reduce<Promise<readonly CompteEnEchec[]>>(
      async (precedents, compte) => {
        const acquis = await precedents
        const echec = await synchroniser(declencher, maintenant)(compte)
        return echec === null ? acquis : [...acquis, echec]
      },
      Promise.resolve([]),
    )

    return success({
      comptes: comptes.length,
      eligibles: eligibles.length,
      synchronises: eligibles.length - echecs.length,
      echecs,
    })
  }
