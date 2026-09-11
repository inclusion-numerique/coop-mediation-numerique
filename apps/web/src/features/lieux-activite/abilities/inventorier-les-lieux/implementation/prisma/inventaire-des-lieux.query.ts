import { prismaClient } from '@app/web/prismaClient'
import { lieuToDomain } from '../../../../implementation/prisma/lieu.transfer'
import type { LigneDuLieu } from '../../../../implementation/prisma/ligne-du-lieu'
import {
  aBougeDepuis,
  avecIdentifiantCarto,
  derniereEcriture,
  inscriptionPourLaFiche,
} from '../../../../implementation/prisma/registre'

/**
 * Les nomenclatures rendues dans les valeurs du schéma national, et non sous
 * les noms que la base leur donne.
 *
 * L'inventaire sert des clients d'API : c'est le vocabulaire du standard qu'ils
 * attendent, comme le reste de la coop. La traduction se fait donc ici, dans
 * l'implémentation, plutôt que chez l'appelant — qui n'a alors plus rien à
 * connaître de la façon dont on stocke.
 *
 * `LigneDuLieu` porte la garde d'alignement : si les noms stockés et ceux du
 * vocabulaire divergeaient, cette conversion cesserait de compiler.
 */
const auVocabulaireDuStandard = <Ligne extends LigneDuLieu>(ligne: Ligne) => {
  // La fiche vient du registre de l'Entrepôt, où chaque producteur n'écrit que
  // ses colonnes : les nomenclatures y sont déjà celles que le lieu déclare de
  // plus récent. `lieuToDomain` les rend traduites dans le vocabulaire du
  // standard, qui est justement celui que cet inventaire publie.
  const { fiche, tracabilite } = lieuToDomain(ligne)

  return {
    ...ligne,
    modification: derniereEcriture(
      ligne.inscriptionRegistre,
      ligne.modification,
    ),
    nom: fiche.nom,
    adresse: fiche.adresse?.voie ?? ligne.adresse,
    commune: fiche.adresse?.commune ?? ligne.commune,
    codePostal: fiche.adresse?.code_postal ?? ligne.codePostal,
    codeInsee: fiche.adresse?.code_insee ?? ligne.codeInsee,
    complementAdresse:
      fiche.adresse?.complement_adresse ?? ligne.complementAdresse,
    horaires: fiche.horaires,
    presentationResume: fiche.presentation?.resume ?? null,
    presentationDetail: fiche.presentation?.detail ?? null,
    ficheAccesLibre: fiche.ficheAccesLibre,
    priseRdv: fiche.priseRdv,
    telephone: fiche.contact.telephone ?? null,
    courriels: [...(fiche.contact.courriels ?? [])],
    siteWeb: fiche.contact.site_web?.join('|') ?? null,
    derniereModificationSource:
      tracabilite.derniereModification._tag === 'ParSource'
        ? tracabilite.derniereModification.source
        : null,
    typologies: fiche.typologies,
    services: fiche.services,
    publicsSpecifiquementAdresses: fiche.publicsSpecifiquementAdresses,
    priseEnChargeSpecifique: fiche.priseEnChargeSpecifique,
    modalitesAcces: fiche.modalitesAcces,
    fraisACharge: fiche.fraisACharge,
    itinerance: fiche.itinerance,
    dispositifProgrammesNationaux: fiche.dispositifProgrammesNationaux,
    formationsLabels: fiche.formationsLabels,
    autresFormationsLabels: [...fiche.autresFormationsLabels],
    modalitesAccompagnement: fiche.modalitesAccompagnement,
  }
}

/**
 * L'inventaire des lieux, tel que les clients d'API le parcourent.
 *
 * Deux différences avec ce que publie la cartographie : on rend TOUT, y compris
 * les lieux supprimés — un client qui tient un miroir a besoin de savoir qu'une
 * ligne a disparu, et son horodatage de suppression est la seule façon de le
 * lui dire —, et on ne filtre pas sur la visibilité, qui ne regarde que la
 * carte.
 *
 * L'ordre est celui du curseur : création décroissante, l'identifiant
 * départageant les créations simultanées.
 */
export const inventaireDesLieux = async ({
  ids,
  creeDepuis,
  modifieDepuis,
  take,
  skip,
  curseur,
}: {
  readonly ids: readonly string[]
  readonly creeDepuis?: Date
  readonly modifieDepuis?: Date
  readonly take: number
  readonly skip?: number
  readonly curseur?: { readonly creation: string; readonly id: string }
}) => {
  const where = {
    ...(ids.length > 0 ? { id: { in: [...ids] } } : {}),
    ...(creeDepuis ? { creation: { gte: creeDepuis } } : {}),
    ...(modifieDepuis ? aBougeDepuis(modifieDepuis) : {}),
  }

  const lieux = await prismaClient.lieuInclusion.findMany({
    orderBy: [{ creation: 'desc' }, { id: 'desc' }],
    take,
    skip,
    where,
    include: {
      inscriptionRegistre: inscriptionPourLaFiche,
      _count: {
        select: {
          mediateursEnActivite: { where: { suppression: null, fin: null } },
        },
      },
    },
    cursor: curseur
      ? { creation_id: { creation: curseur.creation, id: curseur.id } }
      : undefined,
  })

  const totalCount = await prismaClient.lieuInclusion.count({ where })

  // L'identifiant de cartographie vient du registre de l'Entrepôt, qui en est le
  // domicile : la colonne coop en portait une copie qui avait dérivé.
  return {
    // L'aplatissement vient APRÈS la traduction : `auVocabulaireDuStandard`
    // attend une ligne de lieu, laquelle porte son inscription.
    lieux: lieux.map((lieu) =>
      avecIdentifiantCarto(auVocabulaireDuStandard(lieu)),
    ),
    totalCount,
  }
}

export type LieuInventorie = Awaited<
  ReturnType<typeof inventaireDesLieux>
>['lieux'][number]
