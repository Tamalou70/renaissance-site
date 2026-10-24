# Site Renaissance Roleplay (24/10/2026)

Site vitrine d'une page, inspiré de la page Eclipse Roleplay (zyo.se) : écran d'accueil flou « Découvrir »,
affiche en fond avec pluie, braises violettes, éclairs et son d'orage (synthétisé, aucun fichier audio),
carte de liens en verre, puis le lore tiré de la BD `Tamalou70/heritage-38eme-parallele`, les trois avenirs,
la ville et le lien vers la BD interactive.

## À publier : seulement ces fichiers
`index.html`, `style.css`, `app.js`, `images/` (6,7 Mo). Le dossier `outils/` ne se publie pas.

## Liens à remplir
En haut de `app.js`, objet `LIENS` : `discord`, `instagram`, `tiktok`, `bd`.
Un lien vide : Discord affiche « bientôt », Instagram et TikTok sont masqués.

## Prévisualiser
Serveur local `outils/serveur.ps1` (config « site-renaissance » de `.claude/launch.json`) : http://localhost:8787/
Un lien direct vers une section (`#lore`, `#avenirs`, `#ville`, `#bd`) saute l'écran d'accueil.

## Images
- `images/affiche.webp` : l'affiche « L'Ordre des Arcanes » (son logo imprimé est caché par un voile dans le héros).
- `images/logo.webp`, `logo-petit.webp` : le logo détouré. Le fichier fourni avait un faux damier dessiné ;
  `outils/detourer.py` (Blender, sans fenêtre) l'enlève : `outils/logo-source.png` → `outils/logo-detoure.png`,
  puis `outils/webp.py` le convertit en WebP (vue « Standard », sinon les couleurs sont délavées).
- `images/lore/` : 11 planches de la BD.
