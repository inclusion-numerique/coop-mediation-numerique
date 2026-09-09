import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import type { Fiche } from '../../../../domain/fiche'
import type { Lieu } from '../../../../domain/lieu'
import type { LieuId } from '../../../../domain/lieu-id'
import { publicationSansService } from '../../../../domain/publication'
import { ModifieParUtilisateur } from '../../../../domain/tracabilite'
import type { UserId } from '../../../../domain/user-id'
import { estPublie } from '../../../../domain/visibilite-cartographie'
import {
  type ColonnesDuRegistre,
  ecrireAuRegistre,
  lieuFromDomain,
} from '../../../../implementation'
import { appliquerModification } from '../../domain/appliquer-la-modification'
import {
  type ChampCompare,
  differences,
  type OrigineDuChoix,
} from '../../domain/differences'
import {
  type EchecDeModification,
  FicheIntrouvable,
  PublicationSansService,
} from '../../domain/errors'
import type {
  ModificationLieu,
  SectionDeLaFiche,
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

// Les services suivent la visibilité : rendre un lieu visible lui donne un socle
// s'il n'en annonçait aucun, et ce socle n'est écrit que si la colonne est du
// voyage.
const visibiliteCartographie = (colonnes: Colonnes): Partial<Colonnes> => ({
  visiblePourCartographieNationale: colonnes.visiblePourCartographieNationale,
  services: colonnes.services,
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

/**
 * La même découpe, dans les colonnes du registre de l'Entrepôt. Les deux tables
 * se lisent côte à côte : une section qui gagne un champ doit le gagner ici
 * aussi, sinon la coop et le registre divergent en silence.
 *
 * Deux différences tiennent à la forme du registre et non à un choix. L'adresse
 * n'y figure pas : elle vit dans `main.adresse` et se repointe à chaque
 * écriture. Et `contact` est une colonne unique là où la coop en a trois — le
 * site web appartient aux informations pratiques, le téléphone et les courriels
 * aux modalités d'accès, mais les deux sections réécrivent l'objet entier. Il
 * est reconstruit depuis le lieu à jour, donc juste ; ce qu'on y perd, c'est
 * l'indépendance de deux enregistrements simultanés sur ces deux sections-là.
 */
const colonnesDuRegistreParSection: Record<
  SectionDeLaFiche,
  (colonnes: ColonnesDuRegistre) => Partial<ColonnesDuRegistre>
> = {
  InformationsGenerales: (colonnes) => ({
    nom: colonnes.nom,
    nomUsage: colonnes.nomUsage,
    complementAdresse: colonnes.complementAdresse,
    typologies: colonnes.typologies,
    itinerance: colonnes.itinerance,
    siretALEnrichissement: colonnes.siretALEnrichissement,
  }),
  VisibiliteCartographie: (colonnes) => ({
    visiblePourCartographieNationale: colonnes.visiblePourCartographieNationale,
    services: colonnes.services,
  }),
  InformationsPratiques: (colonnes) => ({
    ficheAccesLibre: colonnes.ficheAccesLibre,
    priseRdv: colonnes.priseRdv,
    horaires: colonnes.horaires,
    contact: colonnes.contact,
  }),
  Description: (colonnes) => ({
    presentationResume: colonnes.presentationResume,
    presentationDetail: colonnes.presentationDetail,
    formationsLabels: colonnes.formationsLabels,
  }),
  ServicesEtAccompagnement: (colonnes) => ({
    services: colonnes.services,
    modalitesAccompagnement: colonnes.modalitesAccompagnement,
  }),
  ModalitesAccesAuService: (colonnes) => ({
    contact: colonnes.contact,
    modalitesAcces: colonnes.modalitesAcces,
    fraisACharge: colonnes.fraisACharge,
  }),
  TypesDePublicsAccueillis: (colonnes) => ({
    publicsSpecifiquementAdresses: colonnes.publicsSpecifiquementAdresses,
    priseEnChargeSpecifique: colonnes.priseEnChargeSpecifique,
  }),
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

  // La règle ne vaut que pour la section qui porte les services. L'étendre aux
  // autres refusait d'enregistrer la description ou les horaires d'un lieu
  // visible sans service, en renvoyant un message parlant de services — alors
  // que la section qui les porte vient en avant-dernier.
  // Mesurée sur le lieu APRÈS modification, et non sur la saisie : c'est ce qui
  // reste au lieu qui compte, pas ce qui a été soumis.
  if (
    modification.section === 'ServicesEtAccompagnement' &&
    publicationSansService(
      estPublie(modifie.visibilite),
      modifie.fiche.services,
    )
  )
    return failure(PublicationSansService(id))

  // Les deux écritures tiennent dans une seule transaction : `coop` et `main`
  // sont deux schémas d'une même base, atteints par un même client. Une fiche
  // enregistrée d'un côté et pas de l'autre serait une divergence que rien ne
  // viendrait rattraper.
  await prismaClient.$transaction(async (transaction) => {
    await transaction.lieuInclusion.update({
      where: { id },
      data: ecriture(modifie, modification.section),
    })

    await ecrireAuRegistre(transaction, {
      lieu: modifie,
      colonnes: colonnesDuRegistreParSection[modification.section],
      maintenant,
    })
  })

  return success(modifie)
}

/**
 * Applique, champ par champ, le choix du médiateur entre sa fiche et celle que
 * le registre montre.
 *
 * C'est un raccourci du formulaire, pas un chemin d'écriture parallèle : le
 * résultat passe par les mêmes tables de sections, donc par les mêmes colonnes,
 * et laisse le lieu dans l'état où une saisie l'aurait laissé.
 *
 * Les sections écrites sont celles de TOUTES les différences, y compris celles
 * où le médiateur garde la valeur du registre. Sans cela, la ligne coop
 * conserverait son ancienne valeur, l'écart réapparaîtrait à la lecture
 * suivante, et la modale se rouvrirait indéfiniment sur le même choix.
 */
export const appliquerLesDifferences = async ({
  id,
  choix,
  par,
  maintenant = new Date(),
}: {
  id: LieuId
  choix: Readonly<Partial<Record<ChampCompare, OrigineDuChoix>>>
  par: UserId
  maintenant?: Date
}): Promise<Result<Lieu, EchecDeModification>> => {
  const fiche = await consulterLaFicheDuLieu(id)

  if (fiche == null) return failure(FicheIntrouvable(id))

  const ecarts = differences(fiche.ficheCoop, fiche.lieu.fiche)

  if (ecarts.length === 0) return success(fiche.lieu)

  const modifie: Lieu = {
    ...fiche.lieu,
    fiche: ecarts.reduce<Fiche>(
      (resolue, { champ }) =>
        choix[champ] === 'coop'
          ? { ...resolue, [champ]: fiche.ficheCoop[champ] }
          : resolue,
      fiche.lieu.fiche,
    ),
    tracabilite: {
      ...fiche.lieu.tracabilite,
      derniereModification: ModifieParUtilisateur(maintenant, par),
    },
  }

  const sections = [...new Set(ecarts.map(({ section }) => section))]

  await prismaClient.$transaction(async (transaction) => {
    await transaction.lieuInclusion.update({
      where: { id },
      data: sections.reduce(
        (colonnes, section) => ({ ...colonnes, ...ecriture(modifie, section) }),
        {},
      ),
    })

    await ecrireAuRegistre(transaction, {
      lieu: modifie,
      colonnes: (toutes) =>
        sections.reduce(
          (colonnes, section) => ({
            ...colonnes,
            ...colonnesDuRegistreParSection[section](toutes),
          }),
          {},
        ),
      maintenant,
    })
  })

  return success(modifie)
}
