# Fonctionnalité: Consulter le récapitulatif de son inscription

> Avant de valider son inscription, la personne relit ce que la coop retient
> d'elle. Le récapitulatif ne liste ses lieux d'activité que si elle est
> médiatrice sans coordonner, et ne compte les médiateurs qu'elle coordonne que
> si elle a un compte coordinateur.

## Règle: Seul un médiateur qui ne coordonne pas voit ses lieux d'activité

### Scénario: Un médiateur voit ses lieux d'activité

* Étant donné mon profil d’inscription est "Mediateur"
* Et un compte médiateur existe pour mon inscription
* Quand je consulte le récapitulatif de mon inscription
* Alors le récapitulatif liste mes lieux d’activité

### Scénario: Un coordinateur de conseillers numériques ne voit pas de lieux d'activité

* Étant donné mon profil d’inscription est "CoordinateurConseillerNumerique"
* Et un compte médiateur existe pour mon inscription
* Et un compte coordinateur existe pour mon inscription
* Quand je consulte le récapitulatif de mon inscription
* Alors le récapitulatif ne liste aucun lieu d’activité

## Règle: Seul un coordinateur voit le nombre de médiateurs qu'il coordonne

### Scénario: Un coordinateur voit les médiateurs qu'il coordonne encore

* Étant donné mon profil d’inscription est "Coordinateur"
* Et un compte coordinateur existe pour mon inscription
* Et je coordonne 2 médiateurs
* Et un médiateur que je coordonnais a quitté mon équipe
* Quand je consulte le récapitulatif de mon inscription
* Alors le récapitulatif compte 2 médiateurs coordonnés

### Scénario: Un médiateur ne voit pas de médiateurs coordonnés

* Étant donné mon profil d’inscription est "Mediateur"
* Et un compte médiateur existe pour mon inscription
* Quand je consulte le récapitulatif de mon inscription
* Alors le récapitulatif ne compte pas de médiateurs coordonnés

## Règle: Le récapitulatif rapporte l'import des lieux depuis le Dataspace

### Scénario: Un conseiller numérique dont les lieux viennent du Dataspace

* Étant donné mon profil d’inscription est "ConseillerNumerique"
* Et un compte médiateur existe pour mon inscription
* Et mes lieux d’activité ont été importés depuis le Dataspace
* Quand je consulte le récapitulatif de mon inscription
* Alors le récapitulatif rapporte l’import de mes lieux depuis le Dataspace
