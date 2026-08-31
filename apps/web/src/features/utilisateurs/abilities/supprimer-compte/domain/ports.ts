import type {
  AdresseCourriel,
  MediateurId,
  RattachementsDuCompte,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import type { VolumeEfface } from './constat-effacement'

/**
 * Les contrats que l'effacement d'un compte impose au reste du produit.
 *
 * Un port par feature qui DÉTIENT quelque chose, nommé par l'intention et non
 * par la table. Un port par table — quinze — noierait l'intention et ferait
 * fuiter le graphe de chaque feature ici ; un port unique recréerait le couplage
 * que la composition sert justement à casser.
 *
 * Les ports ne rendent pas de `Result` : ils rendent leur bilan et peuvent
 * rejeter. La commande enveloppe chaque appel au même endroit et convertit le
 * rejet en charge échouée, ce qui garde les adaptateurs triviaux.
 *
 * Les ports qui concernent aussi bien un médiateur qu'un coordinateur reçoivent
 * `RattachementsDuCompte` et non un couple d'identifiants nullables : le couple
 * rendrait représentable l'état « ni l'un ni l'autre », que le domaine a
 * justement écarté en le modélisant en union. L'adaptateur le dénude.
 *
 * CONTRAT COMMUN, opposable à chaque implémentation : **une charge est
 * idempotente**. Un second passage ne double aucun compteur pré-calculé et ne
 * lève pas. C'est ce qui rend la reprise d'un effacement partiel sûre.
 */

/**
 * → `features/beneficiaire`. Anonymise le portefeuille : identité effacée,
 * valeur statistique conservée. Détache aussi `rdvUserId`, ce qui est la raison
 * pour laquelle cette charge précède `EffacerEmpreinteRdv`.
 */
export type AnonymiserPortefeuille = (input: {
  readonly mediateurId: MediateurId
}) => Promise<{ readonly anonymises: VolumeEfface }>

/**
 * → `features/activites`. Vide le texte libre des comptes rendus — d'activité
 * comme de coordination — sans supprimer les lignes : ce sont elles qui portent
 * l'historique statistique que la résurrection promet de rendre.
 */
export type EffacerNotesDesAccompagnements = (input: {
  readonly rattachements: RattachementsDuCompte
}) => Promise<{ readonly effacees: VolumeEfface }>

/**
 * → `features/rdvsp`. Un seul port : le graphe compte agent → rendez-vous →
 * participations → usagers appartient à RDV Service Public, et la règle « ne
 * supprimer un usager que s'il n'est plus référencé nulle part » ne se décide
 * qu'en le connaissant de l'intérieur.
 */
export type EffacerEmpreinteRdv = (input: {
  readonly utilisateurId: UtilisateurId
}) => Promise<{
  readonly compteDelie: boolean
  readonly rdvsExpurges: VolumeEfface
  readonly usagersSupprimes: VolumeEfface
}>

/**
 * → `features/equipe`. Tags transférés, invitations supprimées, appartenances
 * coupées.
 *
 * Un port et non trois, parce que « à qui reviennent les tags » est une règle
 * d'équipe, et parce que le transfert doit précéder la coupure des
 * appartenances — un invariant d'ordre qu'on ne saurait pas tenir de l'extérieur.
 */
export type LibererDesEquipes = (input: {
  readonly rattachements: RattachementsDuCompte
}) => Promise<{
  readonly invitationsSupprimees: VolumeEfface
  readonly appartenancesSupprimees: VolumeEfface
  readonly tagsTransferes: VolumeEfface
  readonly tagsSupprimes: VolumeEfface
}>

/** → `features/lieux-activite`. Coupe les rattachements aux lieux d'activité. */
export type RetirerDesLieuxActivite = (input: {
  readonly mediateurId: MediateurId
}) => Promise<{ readonly rattachementsSupprimes: VolumeEfface }>

/** → `features/mediateurs`. Révoque le partage de statistiques, des deux côtés. */
export type RevoquerPartageStatistiques = (input: {
  readonly rattachements: RattachementsDuCompte
}) => Promise<{ readonly partagesRevoques: VolumeEfface }>

/**
 * → Brevo (ACL infra). Reçoit le courriel RÉEL, capturé avant l'anonymisation :
 * c'est ce qui permet de sortir l'appel réseau du chemin critique.
 */
export type RetirerDesListesDeDiffusion = (input: {
  readonly courriel: AdresseCourriel
}) => Promise<{ readonly contactSupprime: boolean }>

/**
 * Calcul d'empreinte. Pur, mais tenu hors du domaine pour n'y laisser aucun
 * import Node (AR-1) et rendre la suite BDD déterministe.
 */
export type Empreinte = (
  graine: string,
) => import('@app/web/features/utilisateurs/domain').EmpreinteCourriel

/** L'ensemble des dépendances d'un effacement, composé au niveau `app`. */
export type ChargesEffacement = {
  readonly anonymiserPortefeuille: AnonymiserPortefeuille
  readonly effacerNotesDesAccompagnements: EffacerNotesDesAccompagnements
  readonly effacerEmpreinteRdv: EffacerEmpreinteRdv
  readonly libererDesEquipes: LibererDesEquipes
  readonly retirerDesLieuxActivite: RetirerDesLieuxActivite
  readonly revoquerPartageStatistiques: RevoquerPartageStatistiques
  readonly retirerDesListesDeDiffusion: RetirerDesListesDeDiffusion
}
