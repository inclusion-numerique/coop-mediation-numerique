import { prismaClient } from '@/configuration/prisma'
import { lieuToDomain } from '../../../../implementations/prisma/lieu.transfer'
import type { LigneDuLieu } from '../../../../implementations/prisma/ligne-du-lieu.select'
import {
  aBougeDepuis,
  derniereEcriture,
} from '../../../../implementations/prisma/registre/derniere-ecriture.transfer'
import { inscriptionPourLaFiche } from '../../../../implementations/prisma/registre/fiche-du-registre.select'
import { avecIdentifiantCarto } from '../../../../implementations/prisma/registre/identifiants-carto.query'

const champsDuStandard = (ligne: LigneDuLieu) => {
  const { fiche, tracabilite } = lieuToDomain(ligne)

  return {
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

type ChampsDuStandard = ReturnType<typeof champsDuStandard>

const auVocabulaireDuStandard = <Ligne extends LigneDuLieu>(
  ligne: Ligne,
): Omit<Ligne, keyof ChampsDuStandard> & ChampsDuStandard => ({
  ...ligne,
  ...champsDuStandard(ligne),
})

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
    ...(skip === undefined ? {} : { skip }),
    where,
    include: {
      inscriptionRegistre: inscriptionPourLaFiche,
      _count: {
        select: {
          mediateursEnActivite: { where: { suppression: null, fin: null } },
        },
      },
    },
    ...(curseur
      ? {
          cursor: {
            creation_id: { creation: curseur.creation, id: curseur.id },
          },
        }
      : {}),
  })

  const totalCount = await prismaClient.lieuInclusion.count({ where })

  return {
    lieux: lieux.map((lieu) =>
      avecIdentifiantCarto(auVocabulaireDuStandard(lieu)),
    ),
    totalCount,
  }
}
