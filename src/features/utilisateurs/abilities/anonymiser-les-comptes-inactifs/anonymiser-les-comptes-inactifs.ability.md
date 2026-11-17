# Feature: Anonymiser les comptes inactifs depuis 2 ans

> Un compte sans activité depuis 2 ans est supprimé, comme par le bouton
> « Supprimer mon compte ». La personne est avertie par mail 30 jours avant,
> et une connexion suffit à conserver son compte. Pour un médiateur,
> l'activité est son dernier compte rendu ou sa dernière connexion ; pour un
> coordinateur, sa dernière visite.

Les scénarios se déroulent le 20/10/2026.

## Rule: La personne est avertie 30 jours avant la suppression

### Scenario: Un médiateur actif n'est pas averti

* Given un médiateur inscrit le 01/01/2024 dont le dernier compte rendu date du 01/09/2026
* When les comptes inactifs sont examinés
* Then ce compte n'est pas averti
* And ce compte n'est pas supprimé

### Scenario: Un médiateur sans compte rendu ni connexion depuis près de 2 ans est averti

* Given un médiateur inscrit le 01/01/2024 dont le dernier compte rendu date du 19/11/2024
* When les comptes inactifs sont examinés
* Then ce compte est averti d'une suppression le 19/11/2026
* And l'avertissement de ce compte est daté du 20/10/2026

### Scenario: Une connexion récente compte comme une activité

* Given un médiateur inscrit le 01/01/2024 dont le dernier compte rendu date du 01/06/2024
* And ce compte s'est connecté le 01/08/2026
* When les comptes inactifs sont examinés
* Then ce compte n'est pas averti

### Scenario: Un coordinateur est jugé sur sa dernière visite

* Given un coordinateur inscrit le 01/01/2024 dont la dernière visite date du 19/11/2024
* And ce compte s'est connecté le 01/08/2026
* When les comptes inactifs sont examinés
* Then ce compte est averti d'une suppression le 19/11/2026

### Scenario: Un compte inactif depuis plus de 2 ans a lui aussi 30 jours de préavis

* Given un médiateur inscrit le 01/01/2023 dont le dernier compte rendu date du 01/03/2023
* When les comptes inactifs sont examinés
* Then ce compte est averti d'une suppression le 19/11/2026
* And ce compte n'est pas supprimé

### Scenario: Un compte déjà averti n'est pas averti de nouveau

* Given un médiateur inscrit le 01/01/2024 dont le dernier compte rendu date du 19/11/2024
* And ce compte a été averti le 15/10/2026
* When les comptes inactifs sont examinés
* Then ce compte n'est pas averti
* And ce compte n'est pas supprimé

## Rule: Le compte est supprimé à l'échéance, préavis écoulé

### Scenario: Un compte averti il y a plus de 30 jours et inactif depuis 2 ans est supprimé

* Given un médiateur inscrit le 01/01/2024 dont le dernier compte rendu date du 01/09/2024
* And ce compte a été averti le 01/08/2026
* When les comptes inactifs sont examinés
* Then ce compte est supprimé

### Scenario: Un compte qui s'est reconnecté après l'avertissement n'est pas supprimé

* Given un médiateur inscrit le 01/01/2024 dont le dernier compte rendu date du 01/09/2024
* And ce compte a été averti le 01/08/2026
* And ce compte s'est connecté le 05/08/2026
* When les comptes inactifs sont examinés
* Then ce compte n'est pas supprimé
* And ce compte n'est pas averti

## Rule: Une simulation ne touche à rien

### Scenario: La simulation n'avertit ni ne supprime

* Given un médiateur inscrit le 01/01/2024 dont le dernier compte rendu date du 19/11/2024
* When les comptes inactifs sont examinés en simulation
* Then ce compte n'est pas averti
* And ce compte est signalé comme à avertir
