import { errorReporter } from '@/configuration/telemetry/serveur'
import { UtilisateurCoopId } from '../../../../domain/identifiants/utilisateur-coop-id'
import type { effacerEmpreinteRdv } from '../../domain/effacer-empreinte-rdv'

type EffacerEmpreinteRdv = ReturnType<typeof effacerEmpreinteRdv>

export const effacementPourLaSuppressionDeCompte =
  (effacer: EffacerEmpreinteRdv) =>
  async ({
    utilisateurId,
  }: {
    readonly utilisateurId: string
  }): Promise<{
    readonly compteDelie: boolean
    readonly jetonsRevoques: boolean
    readonly rdvsExpurges: number
    readonly usagersSupprimes: number
  }> => {
    const resultat = await effacer({
      utilisateurId: UtilisateurCoopId(utilisateurId),
    })

    const empreinte = resultat.data

    if (empreinte._tag === 'aucunCompte')
      return {
        compteDelie: false,
        jetonsRevoques: false,
        rdvsExpurges: 0,
        usagersSupprimes: 0,
      }

    if (empreinte.revocation._tag === 'echouee')
      errorReporter.captureException({
        error: new Error('Révocation des jetons RDV Service Public impossible'),
        attributes: {
          agentId: empreinte.agentId,
          erreur: JSON.stringify(empreinte.revocation.erreur),
        },
      })

    return {
      compteDelie: true,
      jetonsRevoques: empreinte.revocation._tag === 'revoques',
      rdvsExpurges: empreinte.rdvIds.length,
      usagersSupprimes: empreinte.usagersSupprimes.length,
    }
  }
