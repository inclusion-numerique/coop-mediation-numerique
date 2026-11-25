# Fonctionnalité: Mesurer les utilisateurs actifs

> Les statistiques publiques comptent les actifs avec la même règle que la
> liste d'administration : un médiateur est actif s'il a créé une activité ou
> un bénéficiaire dans les 30 derniers jours ; un coordinateur, s'il est venu
> et a une équipe ou a coordonné ; un double rôle, à l'un ou l'autre titre.

## Règle: Les actifs se comptent comme la liste les affiche

### Scénario: Un médiateur qui vient de créer un bénéficiaire compte parmi les actifs

* Étant donné les utilisateurs actifs déjà mesurés
* Et un médiateur hors dispositif qui vient de créer un bénéficiaire
* Quand les utilisateurs actifs sont mesurés de nouveau
* Alors les médiateurs comptent 1 actif et 1 profil de plus

### Scénario: Un coordinateur sans équipe qui se connecte ne compte pas parmi les actifs

* Étant donné les utilisateurs actifs déjà mesurés
* Et un coordinateur sans équipe ni coordination qui vient de se connecter
* Quand les utilisateurs actifs sont mesurés de nouveau
* Alors les coordinateurs comptent 0 actif et 1 profil de plus

### Scénario: Un double rôle actif comme médiateur compte parmi les coordinateurs actifs

* Étant donné les utilisateurs actifs déjà mesurés
* Et un médiateur coordinateur sans équipe qui vient de saisir une activité
* Quand les utilisateurs actifs sont mesurés de nouveau
* Alors les coordinateurs comptent 1 actif et 1 profil de plus
