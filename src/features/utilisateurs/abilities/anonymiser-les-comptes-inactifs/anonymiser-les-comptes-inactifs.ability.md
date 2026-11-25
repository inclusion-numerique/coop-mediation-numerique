# Fonctionnalité: Anonymiser les comptes inactifs depuis 2 ans

> Un compte sans activité depuis 2 ans est supprimé, comme par le bouton
> « Supprimer mon compte ». La personne est avertie par mail 30 jours avant,
> et une connexion suffit à conserver son compte. Pour un médiateur,
> l'activité est son dernier compte rendu ou sa dernière connexion ; pour un
> coordinateur, sa dernière visite.

Les scénarios se déroulent le 20/10/2026.

## Règle: La personne est avertie 30 jours avant la suppression

### Scénario: Un médiateur actif n'est pas averti

* Étant donné un médiateur inscrit le 01/01/2024 dont le dernier compte rendu date du 01/09/2026
* Quand les comptes inactifs sont examinés
* Alors ce compte n'est pas averti
* Et ce compte n'est pas supprimé

### Scénario: Un médiateur sans compte rendu ni connexion depuis près de 2 ans est averti

* Étant donné un médiateur inscrit le 01/01/2024 dont le dernier compte rendu date du 19/11/2024
* Quand les comptes inactifs sont examinés
* Alors ce compte est averti d'une suppression le 19/11/2026
* Et l'avertissement de ce compte est daté du 20/10/2026

### Scénario: Une connexion récente compte comme une activité

* Étant donné un médiateur inscrit le 01/01/2024 dont le dernier compte rendu date du 01/06/2024
* Et ce compte s'est connecté le 01/08/2026
* Quand les comptes inactifs sont examinés
* Alors ce compte n'est pas averti

### Scénario: Un coordinateur est jugé sur sa dernière visite

* Étant donné un coordinateur inscrit le 01/01/2024 dont la dernière visite date du 19/11/2024
* Et ce compte s'est connecté le 01/08/2026
* Quand les comptes inactifs sont examinés
* Alors ce compte est averti d'une suppression le 19/11/2026

### Scénario: Un compte inactif depuis plus de 2 ans a lui aussi 30 jours de préavis

* Étant donné un médiateur inscrit le 01/01/2023 dont le dernier compte rendu date du 01/03/2023
* Quand les comptes inactifs sont examinés
* Alors ce compte est averti d'une suppression le 19/11/2026
* Et ce compte n'est pas supprimé

### Scénario: Un compte déjà averti n'est pas averti de nouveau

* Étant donné un médiateur inscrit le 01/01/2024 dont le dernier compte rendu date du 19/11/2024
* Et ce compte a été averti le 15/10/2026
* Quand les comptes inactifs sont examinés
* Alors ce compte n'est pas averti
* Et ce compte n'est pas supprimé

## Règle: Le compte est supprimé à l'échéance, préavis écoulé

### Scénario: Un compte averti il y a plus de 30 jours et inactif depuis 2 ans est supprimé

* Étant donné un médiateur inscrit le 01/01/2024 dont le dernier compte rendu date du 01/09/2024
* Et ce compte a été averti le 01/08/2026
* Quand les comptes inactifs sont examinés
* Alors ce compte est supprimé

### Scénario: Un compte qui s'est reconnecté après l'avertissement n'est pas supprimé

* Étant donné un médiateur inscrit le 01/01/2024 dont le dernier compte rendu date du 01/09/2024
* Et ce compte a été averti le 01/08/2026
* Et ce compte s'est connecté le 05/08/2026
* Quand les comptes inactifs sont examinés
* Alors ce compte n'est pas supprimé
* Et ce compte n'est pas averti

## Règle: Une simulation ne touche à rien

### Scénario: La simulation n'avertit ni ne supprime

* Étant donné un médiateur inscrit le 01/01/2024 dont le dernier compte rendu date du 19/11/2024
* Quand les comptes inactifs sont examinés en simulation
* Alors ce compte n'est pas averti
* Et ce compte est signalé comme à avertir
