import type { Prisma } from '@prisma/client'
import { v4 } from 'uuid'
import {
  fromAdresse,
  lieuFromDomain,
} from '../../../../implementation/prisma/lieu.transfer'
import {
  lieuCorrele,
  preparerCorrele,
} from '../../../../implementation/prisma/lieu-correle'
import {
  colonnesRapporteesParLaCartographie,
  ecrireLeLieuAuRegistre,
  inscriptionPourLIdentifiantCarto,
  lieuCoopPorteurDeLaCarto,
} from '../../../../implementation/prisma/registre'
import {
  type AdresseValidee,
  estExistant,
  type LieuACreer,
  type LieuCarto,
  type LieuDemande,
  lieuDepuisCarto,
} from '../../domain'

const adresseValidee = ({ adresse, localisation, banId }: AdresseValidee) => ({
  ...fromAdresse(adresse),
  banId,
  latitude: localisation.latitude,
  longitude: localisation.longitude,
})

const lieuDepuisAdresse = (lieu: LieuACreer) => ({
  id: v4(),
  nom: lieu.nom,
  siret: lieu.siret ?? null,
  ...adresseValidee(lieu),
})

/**
 * Matérialiser, c'est poser la fiche des deux côtés : dans la coop, et au
 * registre des lieux de l'Entrepôt, dans la même transaction.
 *
 * Rien de tel quand la sonde a corrélé : on rejoint une fiche que la coop
 * connaissait déjà, et le registre n'a rien de nouveau à apprendre.
 *
 * L'inscription part de la ligne RELUE et non des données préparées : c'est ce
 * que la coop a effectivement stocké — défauts de colonnes compris — qui doit
 * partir au registre, sans quoi les deux tables diraient des choses proches mais
 * pas identiques.
 *
 * Un lieu venu de la cartographie porte son identifiant carto dès sa création,
 * et le registre a forcément déjà la ligne d'où il sort : c'est `ecrireAuRegistre`
 * qui la reconnaît et l'adopte, plutôt que d'en inscrire une seconde.
 */
const materialiser = async (
  transaction: Prisma.TransactionClient,
  donnees: Parameters<typeof lieuCorrele>[1] &
    Prisma.LieuInclusionCreateManyInput,
  maintenant: Date,
  identifiantCartographie: string | null,
): Promise<{ readonly id: string }> => {
  const correle = await lieuCorrele(transaction, donnees)
  const prepare =
    correle && (await preparerCorrele(transaction, correle, maintenant))

  if (prepare) return prepare

  const cree = await transaction.lieuInclusion.create({
    data: donnees,
    include: { inscriptionRegistre: inscriptionPourLIdentifiantCarto },
  })

  // L'identité cartographique voyage explicitement, et non par la ligne relue :
  // elle vit dans l'inscription au registre, qui n'existe pas encore à cet
  // instant. Un lieu matérialisé DEPUIS la cartographie la tient de la fiche
  // d'où il sort, et c'est elle qui permettra d'adopter l'inscription
  // correspondante plutôt que d'en créer une seconde.
  await ecrireLeLieuAuRegistre(transaction, {
    colonnes: colonnesRapporteesParLaCartographie,
    ligne: {
      ...cree,
      inscriptionRegistre:
        identifiantCartographie == null
          ? null
          : { structureCartographieNationaleId: identifiantCartographie },
    },
    maintenant,
  })

  return { id: cree.id }
}

const lieuARattacher = async (
  transaction: Prisma.TransactionClient,
  lieu: LieuDemande,
  structuresCartoParId: ReadonlyMap<string, LieuCarto>,
  maintenant: Date,
): Promise<{ readonly id: string }> => {
  const designe = estExistant(lieu)
    ? await transaction.lieuInclusion.findFirst({
        where: { id: lieu.id, suppression: null },
        select: { id: true },
      })
    : null

  if (designe) return designe

  // La question « quel lieu coop porte cet identifiant » se pose au registre,
  // qui en est le domicile et où l'identifiant est unique — la colonne coop en
  // portait une copie dérivée, et non unique, qu'il fallait départager par
  // ancienneté.
  const porteurDeLaCarto = lieu.structureCartographieNationaleId
    ? await lieuCoopPorteurDeLaCarto(
        transaction,
        lieu.structureCartographieNationaleId,
      )
    : null

  if (porteurDeLaCarto) return porteurDeLaCarto

  if (estExistant(lieu))
    throw new Error(
      `Le lieu ${lieu.id} n'existe plus et ne peut pas être recréé : son adresse n'a pas été validée`,
    )

  const lieuCarto = lieu.structureCartographieNationaleId
    ? structuresCartoParId.get(lieu.structureCartographieNationaleId)
    : undefined

  return materialiser(
    transaction,
    lieuCarto
      ? {
          ...lieuFromDomain(lieuDepuisCarto(lieuCarto, maintenant)),
          ...adresseValidee(lieu),
        }
      : lieuDepuisAdresse(lieu),
    maintenant,
    lieu.structureCartographieNationaleId ?? null,
  )
}

export const rattacherAuLieu = async (
  transaction: Prisma.TransactionClient,
  {
    userId,
    lieu,
    structuresCartoParId,
    maintenant,
  }: {
    readonly userId: string
    readonly lieu: LieuDemande
    readonly structuresCartoParId: ReadonlyMap<string, LieuCarto>
    readonly maintenant: Date
  },
) => {
  const { id: structureId } = await lieuARattacher(
    transaction,
    lieu,
    structuresCartoParId,
    maintenant,
  )

  const dejaRattache = await transaction.mediateurEnActivite.findFirst({
    where: {
      mediateur: { userId },
      structureId,
      suppression: null,
      fin: null,
    },
    select: { id: true },
  })

  if (dejaRattache) return { lieuId: structureId }

  await transaction.mediateurEnActivite.create({
    data: {
      id: v4(),
      mediateur: { connect: { userId } },
      lieuInclusion: { connect: { id: structureId } },
      debut: maintenant,
      creationPar: { connect: { id: userId } },
    },
  })

  return { lieuId: structureId }
}
