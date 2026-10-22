# Feature: Lister les utilisateurs

> La liste d'administration de tous les comptes. Le statut qu'elle affiche et
> le filtre par statut obéissent à la même règle : un compte n'apparaît sous
> un filtre que s'il affiche ce statut.

## Background:

* Given les comptes suivants dans la liste :
  | prenom | role         | cree | inscrit | supprime | visite | activite | beneficiaire | equipe | coordonne |
  | Ines   | mediateur    | 3    | aucun   | aucun    | aucun  | aucun    | aucun        | aucun  | aucun     |
  | Iris   | mediateur    | 40   | aucun   | aucun    | aucun  | aucun    | aucun        | aucun  | aucun     |
  | Noe    | mediateur    | 3    | 2       | aucun    | aucun  | aucun    | aucun        | aucun  | aucun     |
  | Nina   | mediateur    | 70   | 65      | aucun    | aucun  | aucun    | aucun        | aucun  | aucun     |
  | Dana   | coordinateur | 210  | 200     | aucun    | 1      | aucun    | aucun        | non    | non       |
  | Adam   | mediateur    | 210  | 200     | aucun    | aucun  | 5        | aucun        | aucun  | aucun     |
  | Bea    | mediateur    | 210  | 200     | aucun    | aucun  | aucun    | 5            | aucun  | aucun     |
  | Carl   | coordinateur | 210  | 200     | aucun    | 10     | aucun    | aucun        | oui    | non       |
  | Eve    | les deux     | 210  | 200     | aucun    | 1      | 3        | aucun        | non    | non       |
  | Fred   | mediateur    | 210  | 200     | aucun    | aucun  | 45       | aucun        | aucun  | aucun     |
  | Gus    | coordinateur | 210  | 200     | aucun    | 100    | aucun    | aucun        | non    | oui       |
  | Hugo   | mediateur    | 400  | 300     | aucun    | aucun  | 200      | aucun        | aucun  | aucun     |
  | Jade   | mediateur    | 210  | 200     | 10       | aucun  | 5        | aucun        | aucun  | aucun     |
  | Abel   | admin        | 210  | 200     | aucun    | 1      | aucun    | aucun        | aucun  | aucun     |

## Rule: Le filtre par statut retrouve exactement les comptes qui affichent ce statut

> Un médiateur est actif s'il a créé une activité ou un bénéficiaire ; un
> coordinateur, s'il est venu et a une équipe ou a coordonné ; un double rôle,
> s'il l'est à l'un ou l'autre titre. Les délais se comptent en jours.

### Scenario Outline: Le filtre « <filtre> » retrouve les comptes « <libelle> »

* When l'administration filtre la liste sur le statut "<filtre>"
* Then la liste contient exactement "<prenoms>"
* And chacun de ces comptes affiche le statut "<libelle>"

#### Examples:

  | filtre        | prenoms              | libelle                   |
  | inscription0  | Ines                 | Inscription en cours      |
  | inscription30 | Iris                 | Inscription en cours J+30 |
  | nouveau0      | Noe                  | Nouveau                   |
  | nouveau60     | Nina                 | Nouveau J+60              |
  | nouveau90     | Dana                 | Nouveau J+90              |
  | actif         | Adam, Bea, Carl, Eve | Actif                     |
  | inactif30     | Fred                 | Inactif J+30              |
  | inactif90     | Gus                  | Inactif J+90              |
  | inactif180    | Hugo                 | Inactif J+180             |
  | deleted       | Jade                 | Supprimé                  |

### Scenario: Un administrateur n'apparaît sous aucun statut de cycle de vie

* When l'administration filtre la liste sur le statut "actif"
* Then la liste ne contient pas "Abel"

## Rule: La recherche porte sur le prénom, le nom, le courriel et l'identifiant

### Scenario: Chercher un compte par son prénom

* When l'administration cherche "Gus" dans la liste
* Then la liste contient exactement "Gus"

### Scenario: Chercher un compte par son identifiant

* When l'administration cherche l'identifiant de "Adam" dans la liste
* Then la liste contient exactement "Adam"

## Rule: La liste se filtre par structure employeuse et par lieu d'activité

### Scenario: Filtrer par structure employeuse

* Given "Adam" est employé par "Mairie de Reims"
* And "Bea" est employée par "Centre social"
* When l'administration filtre la liste sur l'employeuse "Mairie de Reims"
* Then la liste contient exactement "Adam"

### Scenario: Filtrer par lieu d'activité

* Given "Fred" exerce à "Médiathèque du centre"
* When l'administration filtre la liste sur le lieu "Médiathèque du centre"
* Then la liste contient exactement "Fred"

## Rule: La liste se filtre par dispositif

### Scenario: Filtrer les conseillers numériques

* Given "Hugo" est conseiller numérique
* When l'administration filtre la liste sur les conseillers numériques
* Then la liste contient exactement "Hugo"

## Rule: Le total ne dépend pas de la recherche

### Scenario: Le total compte tous les comptes

* When l'administration cherche "Gus" dans la liste
* Then le total dépasse le nombre de comptes trouvés
