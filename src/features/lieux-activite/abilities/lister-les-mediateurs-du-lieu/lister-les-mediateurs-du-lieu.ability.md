# Fonctionnalité: Lister les médiateurs d'un lieu

> La fiche d'un lieu montre qui y exerce aujourd'hui : les médiateurs dont
> l'activité sur place est en cours, avec ce qu'il faut pour les joindre et les
> retirer du lieu.

## Règle: Seuls les médiateurs en activité dans le lieu y sont référencés

### Scénario: Un médiateur qui exerce dans le lieu y est référencé

* Étant donné un lieu où exerce un médiateur
* Quand on liste les médiateurs du lieu
* Alors le médiateur est référencé sur le lieu

### Scénario: Un médiateur dont l'activité dans le lieu a pris fin n'y est plus référencé

* Étant donné un lieu où exerce un médiateur
* Et l’activité du médiateur dans le lieu a pris fin
* Quand on liste les médiateurs du lieu
* Alors aucun médiateur n’est référencé sur le lieu

## Règle: Seul un compte actif et inscrit est référencé

### Scénario: Un médiateur dont le compte est supprimé n'est pas référencé

* Étant donné un lieu où exerce un médiateur
* Et le compte du médiateur est supprimé
* Quand on liste les médiateurs du lieu
* Alors aucun médiateur n’est référencé sur le lieu

### Scénario: Un médiateur dont l'inscription n'est pas validée n'est pas référencé

* Étant donné un lieu où exerce un médiateur
* Et l’inscription du médiateur n’est pas validée
* Quand on liste les médiateurs du lieu
* Alors aucun médiateur n’est référencé sur le lieu

## Règle: La dernière activité retenue est celle du médiateur dans ce lieu

> Elle sert à prévenir qui retire un médiateur du lieu : un médiateur qui n'y a
> jamais rien saisi se retire sans risque.

### Scénario: Un médiateur qui n'a jamais exercé dans le lieu n'y a pas de dernière activité

* Étant donné un lieu où exerce un médiateur
* Quand on liste les médiateurs du lieu
* Alors le médiateur n’a jamais eu d’activité dans le lieu

### Scénario: La dernière activité du médiateur dans le lieu est retenue

* Étant donné un lieu où exerce un médiateur
* Et le médiateur a eu une activité dans le lieu le 2026-05-04
* Quand on liste les médiateurs du lieu
* Alors la dernière activité du médiateur dans le lieu date du 2026-05-04

## Règle: Le médiateur se présente avec ses coordinateurs

### Scénario: Un coordinateur sans structure employeuse est rattaché au département par défaut

* Étant donné un lieu où exerce un médiateur
* Et le médiateur est coordonné par un coordinateur sans structure employeuse
* Quand on liste les médiateurs du lieu
* Alors le médiateur est coordonné depuis le département 75

### Scénario: Un coordinateur dont l'inscription n'est pas validée n'est pas nommé

* Étant donné un lieu où exerce un médiateur
* Et le médiateur est coordonné par un coordinateur dont l’inscription n’est pas validée
* Quand on liste les médiateurs du lieu
* Alors le médiateur n’est coordonné par personne
