# Feature: Mesurer les utilisateurs actifs

> Les statistiques publiques comptent les actifs avec la même règle que la
> liste d'administration : un médiateur est actif s'il a créé une activité ou
> un bénéficiaire dans les 30 derniers jours ; un coordinateur, s'il est venu
> et a une équipe ou a coordonné ; un double rôle, à l'un ou l'autre titre.

## Rule: Les actifs se comptent comme la liste les affiche

### Scenario: Un médiateur qui vient de créer un bénéficiaire compte parmi les actifs

* Given les utilisateurs actifs déjà mesurés
* And un médiateur hors dispositif qui vient de créer un bénéficiaire
* When les utilisateurs actifs sont mesurés de nouveau
* Then les médiateurs comptent 1 actif et 1 profil de plus

### Scenario: Un coordinateur sans équipe qui se connecte ne compte pas parmi les actifs

* Given les utilisateurs actifs déjà mesurés
* And un coordinateur sans équipe ni coordination qui vient de se connecter
* When les utilisateurs actifs sont mesurés de nouveau
* Then les coordinateurs comptent 0 actif et 1 profil de plus

### Scenario: Un double rôle actif comme médiateur compte parmi les coordinateurs actifs

* Given les utilisateurs actifs déjà mesurés
* And un médiateur coordinateur sans équipe qui vient de saisir une activité
* When les utilisateurs actifs sont mesurés de nouveau
* Then les coordinateurs comptent 1 actif et 1 profil de plus
