import type { CreerOuFusionnerDepuisUsagersExternes } from '../../../domain/ports'
import type { PreparerUrlCreationCra } from '../domain/creer-activite-depuis-rdv'
import { creerActiviteDepuisRdv } from '../domain/creer-activite-depuis-rdv'
import { creerOuFusionnerBeneficiaires } from '../domain/creer-ou-fusionner-beneficiaires.adapter'
import type { BeneficiaireFusionne } from '../domain/rdv-pour-activite'
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
