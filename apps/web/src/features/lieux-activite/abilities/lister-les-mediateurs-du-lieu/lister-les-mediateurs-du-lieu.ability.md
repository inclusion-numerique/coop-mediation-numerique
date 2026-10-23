# Feature: Lister les médiateurs d'un lieu

> La fiche d'un lieu montre qui y exerce aujourd'hui : les médiateurs dont
> l'activité sur place est en cours, avec ce qu'il faut pour les joindre et les
> retirer du lieu.

## Rule: Seuls les médiateurs en activité dans le lieu y sont référencés

### Scenario: Un médiateur qui exerce dans le lieu y est référencé

* Given un lieu où exerce un médiateur
* When on liste les médiateurs du lieu
* Then le médiateur est référencé sur le lieu

### Scenario: Un médiateur dont l'activité dans le lieu a pris fin n'y est plus référencé

* Given un lieu où exerce un médiateur
* And l’activité du médiateur dans le lieu a pris fin
* When on liste les médiateurs du lieu
* Then aucun médiateur n’est référencé sur le lieu

## Rule: Seul un compte actif et inscrit est référencé

### Scenario: Un médiateur dont le compte est supprimé n'est pas référencé

* Given un lieu où exerce un médiateur
* And le compte du médiateur est supprimé
* When on liste les médiateurs du lieu
* Then aucun médiateur n’est référencé sur le lieu

### Scenario: Un médiateur dont l'inscription n'est pas validée n'est pas référencé

* Given un lieu où exerce un médiateur
* And l’inscription du médiateur n’est pas validée
* When on liste les médiateurs du lieu
* Then aucun médiateur n’est référencé sur le lieu

## Rule: La dernière activité retenue est celle du médiateur dans ce lieu

> Elle sert à prévenir qui retire un médiateur du lieu : un médiateur qui n'y a
> jamais rien saisi se retire sans risque.

### Scenario: Un médiateur qui n'a jamais exercé dans le lieu n'y a pas de dernière activité

* Given un lieu où exerce un médiateur
* When on liste les médiateurs du lieu
* Then le médiateur n’a jamais eu d’activité dans le lieu

### Scenario: La dernière activité du médiateur dans le lieu est retenue

* Given un lieu où exerce un médiateur
* And le médiateur a eu une activité dans le lieu le 2026-05-04
* When on liste les médiateurs du lieu
* Then la dernière activité du médiateur dans le lieu date du 2026-05-04

## Rule: Le médiateur se présente avec ses coordinateurs

### Scenario: Un coordinateur sans structure employeuse est rattaché au département par défaut

* Given un lieu où exerce un médiateur
* And le médiateur est coordonné par un coordinateur sans structure employeuse
* When on liste les médiateurs du lieu
* Then le médiateur est coordonné depuis le département 75

### Scenario: Un coordinateur dont l'inscription n'est pas validée n'est pas nommé

* Given un lieu où exerce un médiateur
* And le médiateur est coordonné par un coordinateur dont l’inscription n’est pas validée
* When on liste les médiateurs du lieu
* Then le médiateur n’est coordonné par personne
