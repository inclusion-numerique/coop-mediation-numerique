# Fonctionnalité: Lister les utilisateurs

> La liste d'administration de tous les comptes. Le statut qu'elle affiche et
> le filtre par statut obéissent à la même règle : un compte n'apparaît sous
> un filtre que s'il affiche ce statut.

## Contexte:

* Étant donné les comptes suivants dans la liste :
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

## Règle: Le filtre par statut retrouve exactement les comptes qui affichent ce statut

> Un médiateur est actif s'il a créé une activité ou un bénéficiaire ; un
> coordinateur, s'il est venu et a une équipe ou a coordonné ; un double rôle,
> s'il l'est à l'un ou l'autre titre. Les délais se comptent en jours.

### Plan du scénario: Le filtre « <filtre> » retrouve les comptes « <libelle> »

* Quand l'administration filtre la liste sur le statut "<filtre>"
* Alors la liste contient exactement "<prenoms>"
* Et chacun de ces comptes affiche le statut "<libelle>"

#### Exemples:

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

### Scénario: Un administrateur n'apparaît sous aucun statut de cycle de vie

* Quand l'administration filtre la liste sur le statut "actif"
* Alors la liste ne contient pas "Abel"

## Règle: La recherche porte sur le prénom, le nom, le courriel et l'identifiant

### Scénario: Chercher un compte par son prénom

* Quand l'administration cherche "Gus" dans la liste
* Alors la liste contient exactement "Gus"

### Scénario: Chercher un compte par son identifiant

* Quand l'administration cherche l'identifiant de "Adam" dans la liste
* Alors la liste contient exactement "Adam"

## Règle: La liste se filtre par structure employeuse et par lieu d'activité

### Scénario: Filtrer par structure employeuse

* Étant donné "Adam" est employé par "Mairie de Reims"
* Et "Bea" est employée par "Centre social"
* Quand l'administration filtre la liste sur l'employeuse "Mairie de Reims"
* Alors la liste contient exactement "Adam"

### Scénario: Filtrer par lieu d'activité

* Étant donné "Fred" exerce à "Médiathèque du centre"
* Quand l'administration filtre la liste sur le lieu "Médiathèque du centre"
* Alors la liste contient exactement "Fred"

## Règle: La ligne affiche l'employeuse actuelle, et la liste se filtre sur elle

> L'employeuse actuelle est celle de l'affectation qui fait foi. Son code INSEE
> n'est retenu que si son adresse est complète.

### Scénario: Le nom de l'antenne prime sur la dénomination SIRENE

* Étant donné "Adam" est employé par l'antenne "Antenne de Reims" de "Mairie de Reims"
* Quand l'administration cherche "Adam" dans la liste
* Alors la ligne de "Adam" affiche l'employeuse "Antenne de Reims"

### Scénario: Le code INSEE de l'employeuse vient de son adresse

* Étant donné "Adam" est employé par "Mairie de Reims" au code INSEE "51454" et au code postal "51100"
* Quand l'administration cherche "Adam" dans la liste
* Alors la ligne de "Adam" affiche le code INSEE d'employeuse "51454"

### Scénario: Une adresse sans code postal ne donne pas de code INSEE

* Étant donné "Adam" est employé par "Mairie de Reims" au code INSEE "51454" et au code postal ""
* Quand l'administration cherche "Adam" dans la liste
* Alors la ligne de "Adam" n'affiche aucun code INSEE d'employeuse

### Scénario: Filtrer par département ne retient que les adresses complètes

* Étant donné "Adam" est employé par "Mairie de Reims" au code INSEE "51454" et au code postal "51100"
* Et "Bea" est employée par "Centre social" au code INSEE "51108" et au code postal ""
* Quand l'administration filtre la liste sur le département "51"
* Alors la liste contient exactement "Adam"

### Scénario: Filtrer par structure employeuse ne retient que l'employeuse actuelle

* Étant donné "Adam" est employé par "Mairie de Reims"
* Et "Adam" est aussi rattaché à "Réseau partenaire" par la source "aidants-connect"
* Quand l'administration filtre la liste sur l'employeuse "Réseau partenaire"
* Alors la liste ne contient pas "Adam"

## Règle: La liste se filtre par dispositif

### Scénario: Filtrer les conseillers numériques

* Étant donné "Hugo" est conseiller numérique
* Quand l'administration filtre la liste sur les conseillers numériques
* Alors la liste contient exactement "Hugo"

## Règle: Le total ne dépend pas de la recherche

### Scénario: Le total compte tous les comptes

* Quand l'administration cherche "Gus" dans la liste
* Alors le total dépasse le nombre de comptes trouvés

## Règle: Les anciens rattachements retrouvent un compte, sur demande

> Un compte supprimé n'a plus de nom : on le retrouve par l'environnement où
> il travaillait. Sans la demande, seuls les rattachements actuels comptent.
> Avec elle, une employeuse compte aussi si elle l'a été, ou si elle porte une
> activité du compte ; un lieu compte aussi s'il accueille une activité du
> compte ; une équipe compte aussi si le compte l'a quittée.

### Scénario: Une ancienne employeuse n'est retenue que sur demande

* Étant donné "Jade" a été employée par "Mairie de Laon"
* Quand l'administration filtre la liste sur l'employeuse "Mairie de Laon"
* Alors la liste ne contient pas "Jade"

### Scénario: Retrouver un compte par son ancienne employeuse

* Étant donné "Jade" a été employée par "Mairie de Laon"
* Quand l'administration filtre la liste sur l'employeuse "Mairie de Laon" en incluant les anciens rattachements
* Alors la liste contient exactement "Jade"

### Scénario: Retrouver un compte par l'employeuse de ses activités

* Étant donné "Jade" a enregistré une activité pour l'employeuse "Mairie de Soissons"
* Quand l'administration filtre la liste sur l'employeuse "Mairie de Soissons" en incluant les anciens rattachements
* Alors la liste contient exactement "Jade"

### Scénario: Le lieu d'une activité n'est retenu que sur demande

* Étant donné "Jade" a enregistré une activité à "Médiathèque de Laon"
* Quand l'administration filtre la liste sur le lieu "Médiathèque de Laon"
* Alors la liste ne contient pas "Jade"

### Scénario: Retrouver un compte par le lieu de ses activités

* Étant donné "Jade" a enregistré une activité à "Médiathèque de Laon"
* Quand l'administration filtre la liste sur le lieu "Médiathèque de Laon" en incluant les anciens rattachements
* Alors la liste contient exactement "Jade"

## Règle: La liste se filtre par coordinateur

### Scénario: Filtrer sur l'équipe actuelle d'un coordinateur

* Étant donné "Adam" est membre de l'équipe de "Gus"
* Et "Fred" a quitté l'équipe de "Gus"
* Quand l'administration filtre la liste sur le coordinateur "Gus"
* Alors la liste contient exactement "Adam"

### Scénario: Inclure les anciens membres de l'équipe

* Étant donné "Adam" est membre de l'équipe de "Gus"
* Et "Fred" a quitté l'équipe de "Gus"
* Quand l'administration filtre la liste sur le coordinateur "Gus" en incluant les anciens rattachements
* Alors la liste contient exactement "Adam, Fred"

### Scénario: Chercher un coordinateur à choisir

* Quand l'administration cherche le coordinateur "Gus"
* Alors les coordinateurs proposés sont exactement "Gus"
