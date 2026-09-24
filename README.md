# Café Crypto

Marchés & actualités crypto : prix en temps réel, graphique BTC, tendances, gagnants et perdants du jour.

Site : https://cafecrypto.fr

## Déploiement (GitHub Pages)

1. Poussez tous les fichiers à la **racine** du dépôt.
2. `Settings` → `Pages` → Source : *Deploy from a branch* → branche `main`, dossier `/ (root)`.
3. Domaine personnalisé : `cafecrypto.fr` (le fichier `CNAME` est déjà inclus), puis cochez *Enforce HTTPS*.
4. DNS chez votre registrar :
   - `A` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` `www` → `<votre-utilisateur>.github.io`

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Le site |
| `404.html` | Page d'erreur (servie automatiquement par GitHub Pages) |
| `sitemap.xml` | Plan du site pour Google |
| `robots.txt` | Consignes aux robots + lien vers le sitemap |
| `CNAME` | Domaine personnalisé |
| `.nojekyll` | Désactive le traitement Jekyll |
| `site.webmanifest` | Métadonnées PWA / mobile |
| `og-image.png` | Image d'aperçu (1200×630) pour les partages |
