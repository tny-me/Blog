---
layout: default
title: Inicio
---

<style>
/* --- Bio + lista de posts (estilo limpio) --- */
.hero { max-width: 980px; margin: 0 auto 32px; display: grid; grid-template-columns: 1fr 220px; gap: 24px; align-items: start; }
.hero h1 { margin: 0 0 8px; font-size: 30px; }
.hero p { margin: 10px 0; }
.hero .links a { margin-right: 14px; text-decoration: underline; }
.hero .photo { width: 200px; height: 200px; border-radius: 999px; object-fit: cover; box-shadow: 0 6px 20px rgba(0,0,0,.08); }

.section-title { text-align: center; font-size: 24px; margin: 36px 0 10px; }
.section-sub { text-align: center; margin-bottom: 22px; }

.post-list { max-width: 920px; margin: 0 auto; }
.post-item { display: grid; grid-template-columns: 110px 1fr; gap: 18px; padding: 18px 0; }
.post-thumb { width: 110px; height: 110px; border-radius: 8px; object-fit: cover; background:#f2f2f2; border:1px solid #e5e5e5; }
.post-title { font-size: 20px; margin: 0 0 6px; line-height: 1.25; }
.post-title a { color: inherit; text-decoration: none; }
.post-title a:hover { text-decoration: underline; }
.post-date { color:#6b7280; margin: 0 0 6px; font-size: 14px; }
.post-excerpt { color:#4b5563; margin: 0; }
.post-sep { border:0; border-top:1px solid #e5e7eb; margin: 10px 0; }
@media (max-width: 780px){
  .hero { grid-template-columns: 1fr; }
  .hero .photo { width: 140px; height: 140px; justify-self: center; }
  .post-item { grid-template-columns: 90px 1fr; }
  .post-thumb { width: 90px; height: 90px; }
}
</style>

<!-- BIO -->
<div class="hero">
  <div>
    <h1>{{ site.author.name }}</h1>
    <p><em>{{ site.author.role }}</em></p>
    <p>{{ site.author.bio }}</p>
    <p class="links">
      <a href="{{ site.baseurl }}/feed.xml">Feed RSS</a>
      {% if site.author.newsletter %}<a href="{{ site.author.newsletter }}">Suscríbete por correo</a>{% endif %}
      {% if site.author.linkedin %}<a href="{{ site.author.linkedin }}">LinkedIn</a>{% endif %}
      {% if site.author.twitter %}<a href="{{ site.author.twitter }}">Twitter</a>{% endif %}
      <a href="mailto:{{ site.author.email }}">Contacto</a>
    </p>
  </div>
  <div>
    <img class="photo" src="{{ site.author.photo }}" alt="{{ site.author.name }}">
  </div>
</div>

<!-- LISTA DE POSTS -->
<h2 class="section-title">Notas y entradas de blog recientes</h2>
<p class="section-sub">Ver <a href="{{ site.baseurl }}/archive/">Archivo de blogs y notas</a> para todas las entradas.</p>

<div class="post-list">
  {% assign posts = site.posts %}
  {% if posts == empty %}
    <p>*Aún no hay artículos.*</p>
  {% else %}
    {% for post in posts %}
      <article class="post-item">
        <a href="{{ site.baseurl }}{{ post.url }}">
          {% if post.image %}
            <img class="post-thumb" src="{{ post.image | relative_url }}" alt="{{ post.title | escape }}">
          {% else %}
            <img class="post-thumb" src="{{ site.baseurl }}/assets/img/posts/placeholder.png" alt="">
          {% endif %}
        </a>
        <div>
          <h3 class="post-title"><a href="{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></h3>
          <p class="post-date">{{ post.date | date: "%-d de %B de %Y" }}</p>
          <p class="post-excerpt">{{ post.excerpt | strip_html | truncate: 220 }}</p>
        </div>
      </article>
      {% unless forloop.last %}<hr class="post-sep">{% endunless %}
    {% endfor %}
  {% endif %}
</div>
