import type { CompteRdv } from '@/features/rdvsp/domain/compte/compte-rdv'
import type { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import type { Result } from '@/libraries/result'
import {
  type BilanDeSynchronisation,
  comptesEligibles,
  type EchecDeSynchronisation,
} from './bilan'

export type LireLesComptesRdv = () => Promise<readonly CompteRdv[]>

export type DeclencherLaSynchronisation = (input: {
  readonly demandeur: {
    readonly id: UtilisateurCoopId
    readonly role: 'User'
  }
  readonly utilisateurId: UtilisateurCoopId
  readonly seulementSansWebhook: false
}) => Promise<Result<unknown, { readonly _tag: string }>>

const synchroniser =
  (declencher: DeclencherLaSynchronisation) =>
  async ({
    utilisateurId,
  }: CompteRdv): Promise<EchecDeSynchronisation | null> => {
    const resultat = await declencher({
      demandeur: { id: utilisateurId, role: 'User' },
      utilisateurId,
      seulementSansWebhook: false,
    })

    return resultat.success
      ? null
      : { utilisateurId, raison: resultat.error._tag }
  }

export const synchroniserTousLesComptesRdv =
  ({
    lireLesComptes,
    declencher,
  }: {
    readonly lireLesComptes: LireLesComptesRdv
    readonly declencher: DeclencherLaSynchronisation
  }) =>
  async (maintenant: Date): Promise<BilanDeSynchronisation> => {
    const comptes = await lireLesComptes()
    const eligibles = comptesEligibles(comptes, maintenant)

    const echecs = await eligibles.reduce<
      Promise<readonly EchecDeSynchronisation[]>
    >(async (precedents, compte) => {
      const acquis = await precedents
      const echec = await synchroniser(declencher)(compte)
      return echec === null ? acquis : [...acquis, echec]
    }, Promise.resolve([]))

    return {
      comptes: comptes.length,
      eligibles: eligibles.length,
      synchronises: eligibles.length - echecs.length,
      echecs,
    }
  }
