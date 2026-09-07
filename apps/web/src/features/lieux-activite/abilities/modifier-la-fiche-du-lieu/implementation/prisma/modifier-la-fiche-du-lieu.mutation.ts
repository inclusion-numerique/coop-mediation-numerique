import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import type { Lieu } from '../../../../domain/lieu'
import type { LieuId } from '../../../../domain/lieu-id'
import { publicationSansService } from '../../../../domain/publication'
import type { UserId } from '../../../../domain/user-id'
import { estPublie } from '../../../../domain/visibilite-cartographie'
import { lieuFromDomain } from '../../../../implementation'
import {
  type EchecDeModification,
  FicheIntrouvable,
  PublicationSansService,
} from '../../domain/errors'
import {
  appliquerModification,
  type ModificationLieu,
  type SectionDeLaFiche,
} from '../../domain/modification-lieu'
import { consulterLaFicheDuLieu } from './consulter-la-fiche-du-lieu.query'

type Colonnes = ReturnType<typeof lieuFromDomain>

/**
 * Chaque section n'écrit que ses propres colonnes.
 *
 * Le routeur tRPC réétalait la ligne entière relue avant l'écriture
 * (`data: { ...structure, ...champsDeLaSection }`) : deux sections enregistrées
 * à peu d'intervalle et la seconde réécrivait la première avec des valeurs
 * périmées. La table ci-dessous rend cette collision impossible.
 */
const informationsGenerales = (colonnes: Colonnes): Partial<Colonnes> => ({
  nom: colonnes.nom,
  adresse: colonnes.adresse,
  commune: colonnes.commune,
  codePostal: colonnes.codePostal,
  codeInsee: colonnes.codeInsee,
  complementAdresse: colonnes.complementAdresse,
  latitude: colonnes.latitude,
  longitude: colonnes.longitude,
  banId: colonnes.banId,
  itinerance: colonnes.itinerance,
  typologies: colonnes.typologies,
  siret: colonnes.siret,
  rna: colonnes.rna,
  nomUsage: colonnes.nomUsage,
})

const visibiliteCartographie = (colonnes: Colonnes): Partial<Colonnes> => ({
  visiblePourCartographieNationale: colonnes.visiblePourCartographieNationale,
})

const informationsPratiques = (colonnes: Colonnes): Partial<Colonnes> => ({
  siteWeb: colonnes.siteWeb,
  ficheAccesLibre: colonnes.ficheAccesLibre,
  priseRdv: colonnes.priseRdv,
  horaires: colonnes.horaires,
})

const description = (colonnes: Colonnes): Partial<Colonnes> => ({
  presentationResume: colonnes.presentationResume,
  presentationDetail: colonnes.presentationDetail,
  formationsLabels: colonnes.formationsLabels,
})

const servicesEtAccompagnement = (colonnes: Colonnes): Partial<Colonnes> => ({
  services: colonnes.services,
  modalitesAccompagnement: colonnes.modalitesAccompagnement,
})

const modalitesAccesAuService = (colonnes: Colonnes): Partial<Colonnes> => ({
  telephone: colonnes.telephone,
  courriels: colonnes.courriels,
  modalitesAcces: colonnes.modalitesAcces,
  fraisACharge: colonnes.fraisACharge,
})

const typesDePublicsAccueillis = (colonnes: Colonnes): Partial<Colonnes> => ({
  publicsSpecifiquementAdresses: colonnes.publicsSpecifiquementAdresses,
  priseEnChargeSpecifique: colonnes.priseEnChargeSpecifique,
})

const colonnesParSection: Record<
  SectionDeLaFiche,
  (colonnes: Colonnes) => Partial<Colonnes>
> = {
  InformationsGenerales: informationsGenerales,
  VisibiliteCartographie: visibiliteCartographie,
  InformationsPratiques: informationsPratiques,
  Description: description,
  ServicesEtAccompagnement: servicesEtAccompagnement,
  ModalitesAccesAuService: modalitesAccesAuService,
  TypesDePublicsAccueillis: typesDePublicsAccueillis,
}

const ecriture = (lieu: Lieu, section: SectionDeLaFiche) => {
  const colonnes = lieuFromDomain(lieu)

  return {
    ...colonnesParSection[section](colonnes),
    modification: colonnes.modification,
    derniereModificationParId: colonnes.derniereModificationParId,
    derniereModificationSource: colonnes.derniereModificationSource,
  }
}

export const modifierLaFicheDuLieu = async ({
  id,
  modification,
  par,
  maintenant = new Date(),
}: {
  id: LieuId
  modification: ModificationLieu
  par: UserId
  maintenant?: Date
}): Promise<Result<Lieu, EchecDeModification>> => {
  const fiche = await consulterLaFicheDuLieu(id)

  if (fiche == null) return failure(FicheIntrouvable(id))

  const modifie = appliquerModification(
    fiche.lieu,
    modification,
    par,
    maintenant,
  )

  // Mesurée sur le lieu APRÈS modification, et non sur la saisie : la
  // visibilité et les services s'éditent dans deux sections, et la règle se
  // enfreint des deux côtés — rendre visible un lieu sans service, ou retirer
  // le dernier service d'un lieu visible.
  if (
    publicationSansService(
      estPublie(modifie.visibilite),
      modifie.fiche.services,
    )
  )
    return failure(PublicationSansService(id))

  await prismaClient.lieuInclusion.update({
    where: { id },
    data: ecriture(modifie, modification.section),
  })

  return success(modifie)
}
