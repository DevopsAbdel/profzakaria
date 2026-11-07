(function () {
  var C = window.SITE_CONFIG || {};
  var html = document.documentElement;
  var lang = 'ar';
  try { lang = localStorage.getItem('lang') || 'ar'; } catch (e) {}

  function t(ar, fr) { return lang === 'fr' ? fr : ar; }

  function applyLang() {
    html.lang = lang;
    html.dir = lang === 'fr' ? 'ltr' : 'rtl';
    document.querySelectorAll('[data-ar]').forEach(function (el) {
      var v = el.getAttribute('data-' + lang);
      if (v) el.textContent = v;
    });
    document.getElementById('langBtn').textContent = lang === 'fr' ? 'AR' : 'FR';
    document.title = lang === 'fr'
      ? 'Professeur Zakaria — Soutien scolaire en économie (Bac, Maroc)'
      : 'الأستاذ زكريا | Professeur Zakaria — دروس التقوية والدعم في الاقتصاد';
    renderVideos();
  }

  document.getElementById('langBtn').addEventListener('click', function () {
    lang = lang === 'fr' ? 'ar' : 'fr';
    try { localStorage.setItem('lang', lang); } catch (e) {}
    applyLang();
  });

  // theme
  var meta = document.querySelector('meta[name=theme-color]');
  function setTheme(m) {
    html.dataset.theme = m;
    try { localStorage.setItem('theme', m); } catch (e) {}
    if (meta) meta.content = m === 'dark' ? '#071B2E' : '#0B2D4D';
  }
  document.getElementById('themeBtn').addEventListener('click', function () {
    setTheme(html.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  // mobile menu
  var burger = document.getElementById('burger'), menu = document.getElementById('menu');
  burger.addEventListener('click', function () {
    var o = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', o);
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { menu.classList.remove('open'); burger.setAttribute('aria-expanded', false); }
  });

  // socials
  var S = C.social || {}, any = false;
  document.querySelectorAll('#socials a, #footSoc a').forEach(function (a) {
    var u = S[a.dataset.s];
    if (u) { a.href = u; a.hidden = false; any = true; }
  });
  var yt = document.getElementById('ytBtn');
  if (S.youtube) yt.href = S.youtube; else yt.hidden = true;

  // whatsapp
  var wa = document.getElementById('waBtn');
  if (C.whatsapp) {
    wa.href = 'https://wa.me/' + String(C.whatsapp).replace(/\D/g, '');
    wa.hidden = false;
  }

  // resources
  document.querySelectorAll('.res').forEach(function (r) {
    var u = (C.resources || {})[r.dataset.res];
    var a = r.querySelector('.link');
    if (u) { a.href = u; a.target = '_blank'; a.rel = 'noopener'; } else { r.classList.add('off'); }
  });

  // videos
  function renderVideos() {
    var g = document.getElementById('videoGrid');
    g.innerHTML = '';
    var vids = C.videos || [];
    if (vids.length) {
      vids.forEach(function (v) {
        var d = document.createElement('article');
        d.className = 'card vid';
        var f = document.createElement('iframe');
        f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(v.id);
        f.title = v.title || 'video'; f.loading = 'lazy'; f.allowFullscreen = true;
        var h = document.createElement('h3'); h.textContent = v.title || '';
        d.appendChild(f); d.appendChild(h); g.appendChild(d);
      });
    } else {
      [
        [t('شرح مفهوم اقتصادي', 'Expliquer une notion'), t('فيديوهات قصيرة لتبسيط المفاهيم', 'Vidéos courtes pour simplifier les notions')],
        [t('حل تمرين خطوة بخطوة', 'Exercice corrigé pas à pas'), t('طريقة التفكير في نص التمرين', "Comment aborder l'énoncé")],
        [t('منهجية الامتحان', "Méthode d'examen"), t('كيف نبني جوابًا منظمًا', 'Construire une réponse structurée')]
      ].forEach(function (x) {
        var d = document.createElement('article');
        d.className = 'card vid ph';
        d.innerHTML = '<div><div class="play">▶</div><h3></h3><p></p><small></small></div>';
        d.querySelector('h3').textContent = x[0];
        d.querySelector('p').textContent = x[1];
        d.querySelector('small').textContent = t('قريبًا', 'Bientôt');
        g.appendChild(d);
      });
    }
  }

  // form
  var form = document.getElementById('form'), st = document.getElementById('status');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    st.className = 'status'; st.textContent = '';
    var d = new FormData(form);
    if (!d.get('name').trim() || !d.get('contact').trim()) {
      st.className = 'status err';
      st.textContent = t('المرجو إدخال الاسم ووسيلة التواصل.', 'Veuillez renseigner votre nom et un moyen de contact.');
      return;
    }
    var body = [
      'الاسم: ' + d.get('name'), 'الصفة: ' + d.get('role'),
      'المسلك/المستوى: ' + (d.get('level') || '-'), 'للتواصل: ' + d.get('contact'),
      'الرسالة: ' + (d.get('message') || '-')
    ].join('\n');

    if (C.formEndpoint) {
      fetch(C.formEndpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: d })
        .then(function (r) {
          if (!r.ok) throw 0;
          form.reset();
          st.textContent = t('تم إرسال طلبك، شكرًا لك!', 'Votre demande a été envoyée, merci !');
        })
        .catch(function () {
          st.className = 'status err';
          st.textContent = t('تعذّر الإرسال، حاول مجددًا.', "Échec de l'envoi, veuillez réessayer.");
        });
    } else if (C.whatsapp) {
      window.open('https://wa.me/' + String(C.whatsapp).replace(/\D/g, '') + '?text=' + encodeURIComponent(body), '_blank', 'noopener');
    } else if (C.email) {
      location.href = 'mailto:' + C.email + '?subject=' + encodeURIComponent('طلب معلومات — الأستاذ زكريا') + '&body=' + encodeURIComponent(body);
    } else {
      st.className = 'status err';
      st.textContent = t('النموذج غير مفعّل بعد: لم تُضبط وسيلة استقبال الرسائل.', "Le formulaire n'est pas encore activé : aucun canal de réception n'est configuré.");
    }
  });

  document.getElementById('yr').textContent = new Date().getFullYear();
  applyLang();
})();
