import type { CreerOuFusionnerDepuisUsagersExternes } from '../../../domain/beneficiaires.port'
import type { PreparerUrlCreationCra } from '../domain/creer-activite-depuis-rdv'
import type { BeneficiaireFusionne } from '../domain/rdv-pour-activite'
import { creerOuFusionnerBeneficiaires } from './beneficiaire/creer-ou-fusionner-beneficiaires.adapter'
import { creerActiviteDepuisRdv } from './creer-activite-depuis-rdv'
import { compteDuRedacteur } from './prisma/compte-du-redacteur.query'
import { lireRdvPourActivite } from './prisma/lire-rdv-pour-activite.query'

export const creerActiviteDepuisRdvAvec = (
  preparerUrlCreationCra: PreparerUrlCreationCra,
  creerOuFusionner: CreerOuFusionnerDepuisUsagersExternes<BeneficiaireFusionne>,
) =>
  creerActiviteDepuisRdv({
    lireRdv: lireRdvPourActivite,
    compteDuRedacteur,
    creerOuFusionnerBeneficiaires:
      creerOuFusionnerBeneficiaires(creerOuFusionner),
    preparerUrlCreationCra,
  })
