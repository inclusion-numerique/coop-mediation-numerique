import type { SynchroniserLaPersonne } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'
import type {
  SupprimerCompteDependances,
  SupprimerComptePorts,
} from '../domain/ports'
import { supprimerCompte } from '../domain/supprimer-compte'
import { supprimerUnInscritJamaisActif } from '../domain/supprimer-un-inscrit-jamais-actif'
import { retirerDesListesDeDiffusion } from './brevo/retirer-des-listes-de-diffusion.mutation'
import { hash } from './crypto/hash.adapter'
import { compteASupprimer } from './prisma/compte-a-supprimer.query'
import { couperAcces } from './prisma/couper-acces.mutation'
import { logEffacementReport } from './prisma/log-effacement-report.mutation'

export type EffacementsDesAutresFeatures = Omit<
  SupprimerComptePorts,
  'hash' | 'retirerDesListesDeDiffusion'
>

const dependancesDe = (
  effacements: EffacementsDesAutresFeatures,
  synchroniserLaPersonne: SynchroniserLaPersonne,
): SupprimerCompteDependances => ({
  ...effacements,
  retirerDesListesDeDiffusion,
  hash,
  lireLeCompteASupprimer: compteASupprimer,
  couperLAcces: couperAcces(synchroniserLaPersonne),
  journaliserLEffacement: logEffacementReport,
})

export const supprimerCompteAvec = (
  effacements: EffacementsDesAutresFeatures,
  synchroniserLaPersonne: SynchroniserLaPersonne,
) => supprimerCompte(dependancesDe(effacements, synchroniserLaPersonne))

export const supprimerUnInscritJamaisActifAvec = (
  effacements: EffacementsDesAutresFeatures,
  maintenant: Date,
  synchroniserLaPersonne: SynchroniserLaPersonne,
) =>
  supprimerUnInscritJamaisActif(
    dependancesDe(effacements, synchroniserLaPersonne),
    maintenant,
  )
