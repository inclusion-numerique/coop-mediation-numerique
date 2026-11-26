import type { EmpreinteRdvEffacee } from './effacer-empreinte-rdv'

export type BilanDeLEffacement = {
  readonly compteDelie: boolean
  readonly jetonsRevoques: boolean
  readonly rdvsExpurges: number
  readonly usagersSupprimes: number
}

export const bilanDeLEffacement = (
  empreinte: EmpreinteRdvEffacee,
): BilanDeLEffacement =>
  empreinte._tag === 'aucunCompte'
    ? {
        compteDelie: false,
        jetonsRevoques: false,
        rdvsExpurges: 0,
        usagersSupprimes: 0,
      }
    : {
        compteDelie: true,
        jetonsRevoques: empreinte.revocation._tag === 'revoques',
        rdvsExpurges: empreinte.rdvIds.length,
        usagersSupprimes: empreinte.usagersSupprimes.length,
      }
