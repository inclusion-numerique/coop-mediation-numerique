import type {
  AdresseCourriel,
  MediateurId,
  RattachementsDuCompte,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'

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
 * rejet en étape échouée, ce qui garde les adaptateurs triviaux.
 *
 * Les ports qui concernent aussi bien un médiateur qu'un coordinateur reçoivent
 * `RattachementsDuCompte` et non un couple d'identifiants nullables : le couple
 * rendrait représentable l'état « ni l'un ni l'autre », que le domaine a
 * justement écarté en le modélisant en union. L'adaptateur applique
 * `identifiantsDe`, la projection nommée par le domaine.
 *
 * Les nombres rendus sont des `number` NUS et non la marque `ErasedCount`. La marque
 * est apposée une seule fois, dans `runStep`, là où un nombre rendu par
 * un adaptateur devient un fait de constat. L'exiger ici obligerait chaque
 * implémentation à connaître le vocabulaire du constat pour rien — la marque ne
 * distingue aucun de ces champs entre eux — et interdirait la seule chose qui
 * rende la composition lisible : brancher une fonction d'ability telle quelle.
 *
 * Le nom d'un port et celui de la fonction qui l'honore sont IDENTIQUES, sans
 * exception. Ces abilities satellites n'ont été écrites que pour cet effacement :
 * rien ne justifierait deux vocabulaires tant qu'il n'y a qu'un appelant, et la
 * paire prend le nom le plus court — sauf `EffacerEmpreinteRdv`, où « compte »
 * désignerait chez rdvsp le compte agent et ici le compte qu'on supprime.
 *
 * Le seul port qu'aucune ability n'honore est `RetirerDesListesDeDiffusion` :
 * il vise un prestataire, que le domaine n'a pas à nommer. Sa traduction vit
 * dans `implementation/brevo`, comme celle d'`Hash` vit dans
 * `implementation/node` — un adaptateur, écrit une fois.
 *
 * CONTRAT COMMUN, opposable à chaque implémentation : **une étape est
 * idempotente**. Un second passage ne double aucun compteur pré-calculé et ne
 * lève pas. C'est ce qui rend la reprise d'un effacement partiel sûre.
 */

/**
 * → `features/beneficiaire`. Anonymise le portefeuille : identité effacée,
 * valeur statistique conservée. Détache aussi `rdvUserId`, ce qui est la raison
 * pour laquelle cette étape précède `EffacerEmpreinteRdv`.
 */
export type AnonymiserPortefeuille = (input: {
  readonly mediateurId: MediateurId
}) => Promise<{ readonly anonymises: number }>

/**
 * → `features/activites`. Vide le texte libre des comptes rendus — d'activité
 * comme de coordination — sans supprimer les lignes : ce sont elles qui portent
 * l'historique statistique que la résurrection promet de rendre.
 */
export type EffacerNotes = (input: {
  readonly rattachements: RattachementsDuCompte
}) => Promise<{ readonly effacees: number }>

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
  readonly rdvsExpurges: number
  readonly usagersSupprimes: number
}>

/**
 * → `features/equipe`. Tags transférés, invitations supprimées, appartenances
 * coupées.
 *
 * Un port et non trois, parce que « à qui reviennent les tags » est une règle
 * d'équipe, et parce que le transfert doit précéder la coupure des
 * appartenances — un invariant d'ordre qu'on ne saurait pas tenir de l'extérieur.
 */
export type DetacherDesEquipes = (input: {
  readonly rattachements: RattachementsDuCompte
}) => Promise<{
  readonly invitationsSupprimees: number
  readonly appartenancesSupprimees: number
  readonly tagsTransferes: number
  readonly tagsSupprimes: number
}>

/** → `features/lieux-activite`. Coupe les rattachements aux lieux d'activité. */
export type RetirerDesLieux = (input: {
  readonly mediateurId: MediateurId
}) => Promise<{ readonly rattachementsSupprimes: number }>

/** → `features/mediateurs`. Révoque le partage de statistiques, des deux côtés. */
export type RevoquerPartageStatistiques = (input: {
  readonly rattachements: RattachementsDuCompte
}) => Promise<{ readonly partagesRevoques: number }>

/**
 * → Brevo (ACL infra). Reçoit le courriel RÉEL, capturé avant l'anonymisation :
 * c'est ce qui permet de sortir l'appel réseau du chemin critique.
 */
export type RetirerDesListesDeDiffusion = (
  courriel: AdresseCourriel,
) => Promise<boolean>

/**
 * Calcul de l'empreinte qui rend unique le courriel anonymisé. Pur, mais tenu
 * hors du domaine pour n'y laisser aucun import Node (AR-1) et rendre la suite
 * BDD déterministe. C'est un port comme les autres, et il voyage avec eux.
 */
export type Hash = (
  seed: string,
) => import('@app/web/features/utilisateurs/domain').CourrielHash

/** L'ensemble des dépendances d'un effacement, composé au niveau `app`. */
export type SupprimerComptePorts = {
  readonly anonymiserPortefeuille: AnonymiserPortefeuille
  readonly effacerNotes: EffacerNotes
  readonly effacerEmpreinteRdv: EffacerEmpreinteRdv
  readonly detacherDesEquipes: DetacherDesEquipes
  readonly retirerDesLieux: RetirerDesLieux
  readonly revoquerPartageStatistiques: RevoquerPartageStatistiques
  readonly retirerDesListesDeDiffusion: RetirerDesListesDeDiffusion
  readonly hash: Hash
}
