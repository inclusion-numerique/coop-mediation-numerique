# Fonctionnalité: Rechercher une structure employeuse

> Quand on demande à quelqu'un sa structure employeuse (à l'inscription, ou en
> garde de la saisie d'un CRA), la recherche fusionne les employeuses déjà
> connues de la coop et l'annuaire des entreprises. La coop passe d'abord : une
> structure qu'elle connaît n'est proposée qu'une fois, sous sa forme connue.

## Règle: La coop propose d'abord les employeuses qu'elle connaît

### Scénario: Une employeuse connue de la coop est proposée

* Étant donné une structure employeuse "Croix Rouge Lorient" connue de la coop sous le SIRET "77553333300011"
* Quand je cherche la structure employeuse "Croix Rouge Lorient"
* Alors la structure "Croix Rouge Lorient" est proposée depuis la coop

## Règle: Une recherche trop courte ne propose rien

### Scénario: Deux caractères ne suffisent pas

* Étant donné une structure employeuse "Croix Rouge Lorient" connue de la coop sous le SIRET "77553333300011"
* Quand je cherche la structure employeuse "Cr"
* Alors aucune structure n'est proposée
