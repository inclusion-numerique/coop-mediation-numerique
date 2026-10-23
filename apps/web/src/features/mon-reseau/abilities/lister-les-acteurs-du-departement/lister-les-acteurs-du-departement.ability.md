# Feature: Lister les acteurs d'un département

> L'annuaire des acteurs d'un département : les médiateurs et les coordinateurs
> qui y exercent, que l'on cherche par leur nom, leur rôle ou leur commune.

## Rule: L'annuaire liste les acteurs actifs et inscrits qui exercent dans le département

### Scenario: Un médiateur qui exerce dans le département figure à l'annuaire

* Given le médiateur Alpha Reseauzz qui exerce dans le Cantal
* When on cherche « reseauzz » dans l’annuaire des acteurs du Cantal
* Then l’annuaire propose Alpha Reseauzz

### Scenario: Un médiateur dont le compte est supprimé ne figure pas à l'annuaire

* Given le médiateur supprimé Alpha Reseauzz qui exerce dans le Cantal
* When on cherche « reseauzz » dans l’annuaire des acteurs du Cantal
* Then l’annuaire ne propose personne

## Rule: L'annuaire se cherche par nom et se filtre par rôle

### Scenario: La recherche retrouve un acteur par son nom

* Given le médiateur Alpha Reseauzz qui exerce dans le Cantal
* And le médiateur Beta Reseauyy qui exerce dans le Cantal
* When on cherche « reseauzz » dans l’annuaire des acteurs du Cantal
* Then l’annuaire propose Alpha Reseauzz
* And l’annuaire ne propose pas Beta Reseauyy

### Scenario: Le filtre par rôle ne retient que les coordinateurs

* Given le médiateur Alpha Reseauzz qui exerce dans le Cantal
* And le coordinateur Gamma Reseauzz qui exerce dans le Cantal
* When on cherche « reseauzz » parmi les coordinateurs du Cantal
* Then l’annuaire propose Gamma Reseauzz
* And l’annuaire ne propose pas Alpha Reseauzz

### Scenario: Le filtre par commune ne retient que les acteurs qui y exercent

* Given le médiateur Alpha Reseauzz qui exerce dans le Cantal
* And le médiateur Beta Reseauzz qui exerce à Saint-Flour
* When on cherche « reseauzz » à Saint-Flour dans l’annuaire des acteurs du Cantal
* Then l’annuaire propose Beta Reseauzz
* And l’annuaire ne propose pas Alpha Reseauzz

### Scenario: Le filtre des médiateurs numériques retient les médiateurs hors dispositif

* Given le médiateur Alpha Reseauzz qui exerce dans le Cantal
* When on cherche « reseauzz » parmi les médiateurs numériques du Cantal
* Then l’annuaire propose Alpha Reseauzz

## Rule: L'annuaire se trie par nom

### Scenario: L'annuaire trié de Z à A commence par le dernier nom

* Given le médiateur Alpha Reseauzza qui exerce dans le Cantal
* And le médiateur Beta Reseauzzb qui exerce dans le Cantal
* When on cherche « reseauzz » de Z à A dans l’annuaire des acteurs du Cantal
* Then l’annuaire propose Beta Reseauzzb avant Alpha Reseauzza

## Rule: Un département inconnu n'a pas d'annuaire des acteurs

### Scenario: L'annuaire des acteurs d'un département qui n'existe pas est introuvable

* When on consulte l’annuaire des acteurs du département « 20 »
* Then l’annuaire des acteurs est introuvable
