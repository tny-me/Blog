---
layout: default
title: Inicio
---

# Bienvenido
Este es mi blog en GitHub Pages con un tema oficial.

## Publicaciones recientes

{% if site.posts == empty %}
*Aún no hay artículos.*
{% else %}
<ul>
{% for post in site.posts %}
  <li>
    <a href="{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a>
    — <small>{{ post.date | date: "%d %b %Y" }}</small>
  </li>
{% endfor %}
</ul>
{% endif %}
