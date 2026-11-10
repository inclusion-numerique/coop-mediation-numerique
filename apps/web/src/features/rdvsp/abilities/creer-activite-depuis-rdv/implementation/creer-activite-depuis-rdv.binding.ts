import type { PreparerUrlCreationCra } from '../domain/creer-activite-depuis-rdv'
import { creerOuFusionnerBeneficiaires } from './beneficiaire/creer-ou-fusionner-beneficiaires.adapter'
import { creerActiviteDepuisRdv } from './creer-activite-depuis-rdv'
import { compteDuRedacteur } from './prisma/compte-du-redacteur.query'
import { lireRdvPourActivite } from './prisma/lire-rdv-pour-activite.query'

export const creerActiviteDepuisRdvAvec = (
  preparerUrlCreationCra: PreparerUrlCreationCra,
) =>
  creerActiviteDepuisRdv({
    lireRdv: lireRdvPourActivite,
    compteDuRedacteur,
    creerOuFusionnerBeneficiaires,
    preparerUrlCreationCra,
  })
