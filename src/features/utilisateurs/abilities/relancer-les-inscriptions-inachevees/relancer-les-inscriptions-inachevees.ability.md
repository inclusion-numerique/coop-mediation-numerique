# Fonctionnalité: Relancer les inscriptions inachevées

> Une inscription commencée et jamais terminée est relancée à J+7, J+30 et
> J+60. À J+90, la personne est avertie que son compte sera effacé à J+105 ;
> à J+105, il l'est, sauf s'il porte déjà de l'activité. Le compte n'ayant
> rien produit, l'effacement est physique.

## Règle: L'inscription est relancée à chaque palier

### Scénario: Une inscription commencée il y a 8 jours reçoit sa première relance

* Étant donné une inscription commencée il y a 8 jours, relance "-"
* Quand les inscriptions inachevées sont relancées
* Alors cette inscription reçoit la relance de J+7
* Et sa relance enregistrée est "reminder_j7_sent"

### Scénario: Une inscription avertie depuis J+90 est effacée à J+105

* Étant donné une inscription commencée il y a 106 jours, relance "warning_j90_sent"
* Quand les inscriptions inachevées sont relancées
* Alors cette inscription est effacée
* Et la personne est prévenue de l'effacement

## Règle: L'effacement laisse toujours deux semaines de préavis

> Quand les relances ont pris du retard, l'avertissement part après J+90 :
> l'effacement est alors annoncé quatorze jours plus tard, et n'a lieu qu'à
> la date annoncée.

### Scénario: Une inscription avertie en retard garde deux semaines

* Étant donné une inscription commencée il y a 200 jours, relance "-"
* Quand les inscriptions inachevées sont relancées
* Alors cette inscription reçoit un avertissement
* Et sa suppression est annoncée dans 14 jours

### Scénario: Une inscription n'est pas effacée avant la date annoncée

* Étant donné une inscription commencée il y a 200 jours, relance "warning_j90_sent", avertie d'une suppression pour demain
* Quand les inscriptions inachevées sont relancées
* Alors cette inscription n'est pas effacée

## Règle: Un compte qui porte de l'activité n'est jamais effacé

### Scénario: Une inscription inachevée qui suit un bénéficiaire reste en place

* Étant donné une inscription commencée il y a 106 jours, relance "warning_j90_sent", avec un bénéficiaire
* Quand les inscriptions inachevées sont relancées
* Alors cette inscription n'est pas effacée
