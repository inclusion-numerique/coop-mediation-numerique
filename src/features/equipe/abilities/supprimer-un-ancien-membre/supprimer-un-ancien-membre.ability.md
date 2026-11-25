# Fonctionnalité: Supprimer un ancien membre

## Règle: Seul un ancien membre peut être supprimé des archives de l'équipe

> La suppression est définitive : le médiateur sort aussi du périmètre des
> statistiques passées de l'équipe.

### Scénario: Le coordinateur supprime un ancien membre de ses archives

* Étant donné un coordinateur et un ancien membre de son équipe
* Quand le coordinateur supprime cet ancien membre des archives
* Alors la suppression réussit
* Et cet ancien membre n'apparaît plus dans l'équipe

### Scénario: Un membre actif ne peut pas être supprimé des archives

* Étant donné un coordinateur et un membre revenu dans son équipe
* Quand le coordinateur supprime cet ancien membre des archives
* Alors la suppression est refusée
* Et ce membre est toujours actif dans l'équipe
