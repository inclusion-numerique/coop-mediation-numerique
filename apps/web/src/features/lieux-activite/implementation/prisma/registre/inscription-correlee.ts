import { correler, type LieuCandidat } from '@app/web/libraries/lieu-identite'
import type { Prisma } from '@prisma/client'
import { serialiserIdsCartographieNationale } from '../../../domain/ids-cartographie-nationale'
import type { Lieu } from '../../../domain/lieu'

/**
 * Sonde de corrélation, tournée vers le registre de l'Entrepôt.
 *
 * La coop se garde déjà de créer un lieu qu'elle connaît, en corrélant contre
 * `coop.lieu_inclusion`. Cela ne dit rien du registre : un lieu moissonné chez
 * `dora` ou saisi dans MIN n'est pas dans la coop, la fiche coop se crée donc à
 * bon droit — et une inscription posée sans regarder ajouterait une SECONDE
 * ligne au registre national pour le même endroit.
 *
 * Le jugement n'est pas refait ici : c'est `libraries/lieu-identite`, adossé au
 * standard partagé avec la cartographie nationale, le même qui arbitre côté
 * coop. Une seule règle pour « est-ce le même endroit », quelle que soit la
 * table interrogée.
 */

/**
 * L'Entrepôt sépare numéro, répétition et nom de voie là où la coop garde la
 * ligne entière. On la recompose pour que les deux côtés soient comparés dans
 * les mêmes termes — le standard normalise ensuite.
 */
const ligneDeVoie = ({
  numeroVoie,
  repetition,
  nomVoie,
}: {
  readonly numeroVoie: number | null
  readonly repetition: string | null
  readonly nomVoie: string | null
}): string =>
  [numeroVoie, repetition, nomVoie]
    .filter((jeton) => jeton != null && `${jeton}`.trim() !== '')
    .join(' ')

/**
 * Ratissage : le code INSEE ou le code postal, comme côté coop. L'égalité
 * stricte des codes INSEE ne suffit pas — Paris, Lyon et Marseille sont
 * désignées tantôt par la commune, tantôt par l'arrondissement — et le standard
 * ne peut réunir que les candidats que SQL a présentés.
 *
 * On ne ratisse QUE les inscriptions sans lien coop : celles qui en portent un
 * appartiennent à un autre lieu de la coop, que sa propre sonde a déjà écarté.
 * Et pas les inscriptions retirées : les adopter déferait une suppression
 * décidée dans l'Entrepôt.
 */
const auMemeEndroit = (codeInsee: string, codePostal: string) => ({
  structureCoopId: null,
  deletedAt: null,
  adresse: { OR: [{ codeInsee }, { codePostal }] },
})

const candidat = (inscription: {
  readonly id: number
  readonly nom: string
  readonly typologies: readonly string[]
  readonly adresse: {
    readonly numeroVoie: number | null
    readonly repetition: string | null
    readonly nomVoie: string | null
    readonly nomCommune: string
    readonly codePostal: string
    readonly codeInsee: string
  } | null
}): LieuCandidat | null =>
  inscription.adresse == null
    ? null
    : {
        id: `${inscription.id}`,
        nom: inscription.nom,
        adresse: ligneDeVoie(inscription.adresse),
        commune: inscription.adresse.nomCommune,
        codePostal: inscription.adresse.codePostal,
        codeInsee: inscription.adresse.codeInsee,
        // `geom` est une colonne postgis, que le client typé ne sait pas lire.
        // Le standard accepte une localisation absente : il juge alors sur la
        // dénomination et l'adresse, ce qui reste son signal principal.
        latitude: null,
        longitude: null,
        suppression: null,
        typologies: inscription.typologies,
      }

/**
 * L'identifiant sous lequel la cartographie nationale connaît ce lieu, tel que
 * le registre le stocke.
 */
export const identifiantCarto = (lieu: Lieu): string | null =>
  lieu.idsCartographieNationale == null
    ? null
    : serialiserIdsCartographieNationale(lieu.idsCartographieNationale)

/**
 * L'inscription qui porte déjà l'identifiant de cartographie du lieu.
 *
 * C'est une clé EXACTE, et unique côté registre : quand elle répond, elle
 * tranche mieux que la comparaison des dénominations, qui ne fait qu'estimer.
 * Elle passe donc en premier.
 *
 * Elle est surtout indispensable au chemin qui matérialise un lieu VENU de la
 * cartographie : celui-là porte l'identifiant dès sa création, et le registre a
 * forcément déjà la ligne d'où il sort — inscrire sans regarder violerait
 * `lieu_inclusion_carto_id_ukey`, en plein enregistrement du médiateur.
 *
 * On n'adopte pas une inscription déjà reliée à un AUTRE lieu coop : elle ne
 * nous appartient pas. Ni une inscription retirée, pour la même raison
 * qu'ailleurs — l'adopter déferait une suppression décidée dans l'Entrepôt.
 */
const parIdentifiantCarto = async (
  transaction: Prisma.TransactionClient,
  lieu: Lieu,
): Promise<number | null> => {
  const identifiant = identifiantCarto(lieu)

  if (identifiant == null) return null

  const porteur = await transaction.lieuInclusionRegistreMain.findUnique({
    where: { structureCartographieNationaleId: identifiant },
    select: { id: true, structureCoopId: true, deletedAt: true },
  })

  return porteur != null &&
    porteur.structureCoopId == null &&
    porteur.deletedAt == null
    ? porteur.id
    : null
}

/**
 * L'inscription du registre qui désigne déjà cet endroit, s'il en est une.
 *
 * Rend son identifiant, à adopter — y poser le lien coop plutôt que d'inscrire
 * une seconde fois le même lieu.
 */
export const inscriptionCorrelee = async (
  transaction: Prisma.TransactionClient,
  lieu: Lieu,
): Promise<number | null> => {
  const parLaCarto = await parIdentifiantCarto(transaction, lieu)

  if (parLaCarto != null) return parLaCarto

  const adresse = lieu.fiche.adresse

  // Sans code INSEE, le standard ne reconnaîtra aucun candidat comme d'une même
  // commune : on s'arrête avant la requête, comme le fait la sonde coop.
  if (adresse?.code_insee == null) return null

  const inscriptions = await transaction.lieuInclusionRegistreMain.findMany({
    where: auMemeEndroit(adresse.code_insee, adresse.code_postal),
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      nom: true,
      typologies: true,
      adresse: {
        select: {
          numeroVoie: true,
          repetition: true,
          nomVoie: true,
          nomCommune: true,
          codePostal: true,
          codeInsee: true,
        },
      },
    },
  })

  const correle = correler(
    inscriptions.flatMap((inscription) => {
      const candidature = candidat(inscription)

      return candidature == null ? [] : [candidature]
    }),
    {
      nom: lieu.fiche.nom,
      adresse: adresse.voie,
      commune: adresse.commune,
      codePostal: adresse.code_postal,
      codeInsee: adresse.code_insee,
      latitude: lieu.fiche.localisation?.latitude ?? null,
      longitude: lieu.fiche.localisation?.longitude ?? null,
      typologies: lieu.fiche.typologies,
    },
  )

  return correle == null ? null : Number(correle.id)
}
