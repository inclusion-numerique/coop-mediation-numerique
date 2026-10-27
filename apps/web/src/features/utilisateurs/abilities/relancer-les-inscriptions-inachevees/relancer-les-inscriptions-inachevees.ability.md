# Feature: Relancer les inscriptions inachevées

> Une inscription commencée et jamais terminée est relancée à J+7, J+30 et
> J+60. À J+90, la personne est avertie que son compte sera effacé à J+105 ;
> à J+105, il l'est, sauf s'il porte déjà de l'activité. Le compte n'ayant
> rien produit, l'effacement est physique.

## Rule: L'inscription est relancée à chaque palier

### Scenario: Une inscription commencée il y a 8 jours reçoit sa première relance

* Given une inscription commencée il y a 8 jours, relance "-"
* When les inscriptions inachevées sont relancées
* Then cette inscription reçoit la relance de J+7
* And sa relance enregistrée est "reminder_j7_sent"

### Scenario: Une inscription avertie depuis J+90 est effacée à J+105

* Given une inscription commencée il y a 106 jours, relance "warning_j90_sent"
* When les inscriptions inachevées sont relancées
* Then cette inscription est effacée
* And la personne est prévenue de l'effacement

## Rule: L'effacement laisse toujours deux semaines de préavis

> Quand les relances ont pris du retard, l'avertissement part après J+90 :
> l'effacement est alors annoncé quatorze jours plus tard, et n'a lieu qu'à
> la date annoncée.

### Scenario: Une inscription avertie en retard garde deux semaines

* Given une inscription commencée il y a 200 jours, relance "-"
* When les inscriptions inachevées sont relancées
* Then cette inscription reçoit un avertissement
* And sa suppression est annoncée dans 14 jours

### Scenario: Une inscription n'est pas effacée avant la date annoncée

* Given une inscription commencée il y a 200 jours, relance "warning_j90_sent", avertie d'une suppression pour demain
* When les inscriptions inachevées sont relancées
* Then cette inscription n'est pas effacée

## Rule: Un compte qui porte de l'activité n'est jamais effacé

### Scenario: Une inscription inachevée qui suit un bénéficiaire reste en place

* Given une inscription commencée il y a 106 jours, relance "warning_j90_sent", avec un bénéficiaire
* When les inscriptions inachevées sont relancées
* Then cette inscription n'est pas effacée
