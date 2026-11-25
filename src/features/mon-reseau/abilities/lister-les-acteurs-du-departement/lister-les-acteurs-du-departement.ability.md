# Fonctionnalité: Lister les acteurs d'un département

> L'annuaire des acteurs d'un département : les médiateurs et les coordinateurs
> qui y exercent, que l'on cherche par leur nom, leur rôle ou leur commune.

## Règle: L'annuaire liste les acteurs actifs et inscrits qui exercent dans le département

### Scénario: Un médiateur qui exerce dans le département figure à l'annuaire

* Étant donné le médiateur Alpha Reseauzz qui exerce dans le Cantal
* Quand on cherche « reseauzz » dans l’annuaire des acteurs du Cantal
* Alors l’annuaire propose Alpha Reseauzz

### Scénario: Un médiateur dont le compte est supprimé ne figure pas à l'annuaire

* Étant donné le médiateur supprimé Alpha Reseauzz qui exerce dans le Cantal
* Quand on cherche « reseauzz » dans l’annuaire des acteurs du Cantal
* Alors l’annuaire ne propose personne

## Règle: L'annuaire se cherche par nom et se filtre par rôle

### Scénario: La recherche retrouve un acteur par son nom

* Étant donné le médiateur Alpha Reseauzz qui exerce dans le Cantal
* Et le médiateur Beta Reseauyy qui exerce dans le Cantal
* Quand on cherche « reseauzz » dans l’annuaire des acteurs du Cantal
* Alors l’annuaire propose Alpha Reseauzz
* Et l’annuaire ne propose pas Beta Reseauyy

### Scénario: Le filtre par rôle ne retient que les coordinateurs

* Étant donné le médiateur Alpha Reseauzz qui exerce dans le Cantal
* Et le coordinateur Gamma Reseauzz qui exerce dans le Cantal
* Quand on cherche « reseauzz » parmi les coordinateurs du Cantal
* Alors l’annuaire propose Gamma Reseauzz
* Et l’annuaire ne propose pas Alpha Reseauzz

### Scénario: Le filtre par commune ne retient que les acteurs qui y exercent

* Étant donné le médiateur Alpha Reseauzz qui exerce dans le Cantal
* Et le médiateur Beta Reseauzz qui exerce à Saint-Flour
* Quand on cherche « reseauzz » à Saint-Flour dans l’annuaire des acteurs du Cantal
* Alors l’annuaire propose Beta Reseauzz
* Et l’annuaire ne propose pas Alpha Reseauzz

### Scénario: Le filtre des médiateurs numériques retient les médiateurs hors dispositif

* Étant donné le médiateur Alpha Reseauzz qui exerce dans le Cantal
* Quand on cherche « reseauzz » parmi les médiateurs numériques du Cantal
* Alors l’annuaire propose Alpha Reseauzz

## Règle: L'annuaire se trie par nom

### Scénario: L'annuaire trié de Z à A commence par le dernier nom

* Étant donné le médiateur Alpha Reseauzza qui exerce dans le Cantal
* Et le médiateur Beta Reseauzzb qui exerce dans le Cantal
* Quand on cherche « reseauzz » de Z à A dans l’annuaire des acteurs du Cantal
* Alors l’annuaire propose Beta Reseauzzb avant Alpha Reseauzza

## Règle: Un département inconnu n'a pas d'annuaire des acteurs

### Scénario: L'annuaire des acteurs d'un département qui n'existe pas est introuvable

* Quand on consulte l’annuaire des acteurs du département « 20 »
* Alors l’annuaire des acteurs est introuvable
