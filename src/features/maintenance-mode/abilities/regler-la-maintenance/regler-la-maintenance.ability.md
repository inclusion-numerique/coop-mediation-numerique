# Fonctionnalité: Régler le mode maintenance

> Pendant une opération sur les données, l'administration met la Coop en
> maintenance : les médiateurs et coordinateurs ne peuvent plus rien modifier,
> mais consultent toujours leurs données. Les administrateurs gardent la
> main. Chaque maintenance est une période, ouverte à l'activation et
> close à la désactivation, que l'historique conserve.

## Règle: Activer ouvre une période, désactiver la clôt

### Scénario: Activer la maintenance ouvre une période

* Étant donné aucune maintenance en cours
* Quand l'administration active la maintenance avec le message "Bascule de la base"
* Alors la maintenance est active avec le message "Bascule de la base"

### Scénario: Activer une maintenance en cours change son message

* Étant donné une maintenance en cours avec le message "Bascule de la base"
* Quand l'administration active la maintenance avec le message "Bascule prolongée"
* Alors la maintenance est active avec le message "Bascule prolongée"
* Et une seule maintenance est en cours

### Scénario: Désactiver la maintenance clôt la période en cours

* Étant donné une maintenance en cours avec le message "Bascule de la base"
* Quand l'administration désactive la maintenance
* Alors la maintenance est inactive
* Et la dernière maintenance de l'historique est close

## Règle: Une maintenance sans message affiche le message par défaut

### Scénario: Activer sans message affiche le message par défaut

* Étant donné aucune maintenance en cours
* Quand l'administration active la maintenance sans message
* Alors la maintenance est active avec le message par défaut

## Règle: Pendant une maintenance, seuls les administrateurs modifient

### Scénario: Un médiateur ne peut plus modifier pendant la maintenance

* Étant donné une maintenance en cours avec le message "Bascule de la base"
* Quand un compte de rôle "User" tente une modification
* Alors la modification est refusée avec le message "Bascule de la base"

### Scénario: Un administrateur modifie pendant la maintenance

* Étant donné une maintenance en cours avec le message "Bascule de la base"
* Quand un compte de rôle "Admin" tente une modification
* Alors la modification passe

### Scénario: Un médiateur modifie hors maintenance

* Étant donné aucune maintenance en cours
* Quand un compte de rôle "User" tente une modification
* Alors la modification passe
