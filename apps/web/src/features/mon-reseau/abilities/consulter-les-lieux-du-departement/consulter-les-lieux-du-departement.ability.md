# Feature: Consulter les lieux d'un département

> L'annuaire des lieux d'un département, tel que mon réseau le présente : la
> liste vient des lieux d'activité, l'annuaire n'en retient que ce que l'écran
> sait demander.

## Rule: L'annuaire se filtre par commune

### Scenario: Les lieux d'une commune choisie sont les seuls proposés

* Given un lieu publié à Aurillac et un lieu publié à Saint-Flour
* When on consulte les lieux du Cantal à Aurillac
* Then seul le lieu d’Aurillac est proposé

### Scenario: Une commune invalide ne filtre pas l'annuaire

* Given un lieu publié à Aurillac et un lieu publié à Saint-Flour
* When on consulte les lieux du Cantal dans la commune « pas-une-commune »
* Then les deux lieux sont proposés

## Rule: Un département inconnu n'a pas d'annuaire des lieux

### Scenario: L'annuaire des lieux d'un département qui n'existe pas est introuvable

* When on consulte les lieux du département « 20 »
* Then l’annuaire des lieux est introuvable
