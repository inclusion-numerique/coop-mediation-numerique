import { signaler } from '@/configuration/telemetry/serveur'
import type {
  FusionDesUsagers,
  UsagerEcarte,
} from '../../domain/fusion-des-usagers'

const motif = ({ reason }: UsagerEcarte): string =>
  reason._tag === 'EchecTechnique'
    ? `${reason._tag} (${reason.cause})`
    : reason._tag

export const usagerEcarteEnErreur = (ecarte: UsagerEcarte): Error =>
  new Error(
    `Usager RDV ${ecarte.rdvUserId} écarté de la fusion des bénéficiaires : ${motif(ecarte)}`,
  )

export const signalerLesUsagersEcartes = <
  Fusion extends { readonly data: FusionDesUsagers },
>(
  fusion: Fusion,
): Fusion => {
  fusion.data.skipped.map(usagerEcarteEnErreur).forEach(signaler)
  return fusion
}
