/**
 * SecretlustAI – Landing page engine
 *
 * 1. Reads SECRETLUST_VIDEOS from data/videos.js
 * 2. Admin overrides from localStorage (set by admin.html)
 * 3. Renders first INITIAL_BATCH cards immediately (SEO + speed)
 * 4. Lazy-loads remaining cards on scroll via IntersectionObserver
 * 5. Videos play on hover only (saves bandwidth)
 */
(function () {
  // Merge localStorage admin overrides with default data
  var videos = getVideos();
  var featured = videos.find(function(v){ return v.featured; }) || videos[0];
  var grid = videos.filter(function(v){ return !v.featured; });

  var rendered = 0;
  var gridEl = document.getElementById('video-grid');
  var sentinel = document.getElementById('scroll-sentinel');
  var spinner = document.getElementById('loading-spinner');

  // ─── Featured card ─────────────────────────────────────────────────
  if (featured) {
    var featVid = document.getElementById('featured-video');
    var featTitle = document.getElementById('featured-title');
    var featUsers = document.getElementById('featured-users');

    if (featTitle) featTitle.textContent = featured.title || 'Untitled';
    if (featUsers) featUsers.textContent = (featured.used || '0') + ' Users';
    if (featVid && featured.src) {
      featVid.src = featured.src;
      featVid.load();
    }

    var featCard = document.getElementById('featured-card');
    if (featCard) {
      featCard.addEventListener('click', function(e){
        if (e.target.tagName !== 'A') window.location.href = 'login.html';
      });
    }
  }

  // ─── Card builder ────────────────────────────────────────────────────
  function buildCard(v) {
    var card = document.createElement('div');
    card.className = 'video-card';
    card.setAttribute('data-id', v.id);

    // Inner HTML – thumb first, video loaded on hover
    card.innerHTML = [
      '<div class="card-media">',
        v.thumb
          ? '<img loading="lazy" src="' + v.thumb + '" alt="' + escHtml(v.title) + '" onerror="this.style.display=\'none\'">'
          : '<div class="card-placeholder"><div class="card-placeholder-icon"></div></div>',
        '<video preload="none" loop muted playsinline data-src="' + escHtml(v.src) + '" style="display:none;position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"></video>',
        '<div class="card-gradient"></div>',
        '<a href="login.html" class="card-hover-cta" aria-label="Use template">',
          '<span class="use-template-btn">USE TEMPLATE</span>',
        '</a>',
        '<div class="card-info">',
          '<div class="card-title">' + escHtml(v.title) + '</div>',
          '<div class="card-used">',
            '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><circle cx="5.5" cy="4.5" r="2.5" stroke="rgba(255,255,255,0.55)" stroke-width="1.2"/><path d="M1 12c0-2.2 2-4 4.5-4s4.5 1.8 4.5 4" stroke="rgba(255,255,255,0.55)" stroke-width="1.2" stroke-linecap="round"/></svg>',
            escHtml(v.used || '0') + ' used',
          '</div>',
        '</div>',
      '</div>'
    ].join('');

    // Play video on hover, pause on leave
    var video = card.querySelector('video');
    var img = card.querySelector('img');

    card.addEventListener('mouseenter', function(){
      if (!video) return;
      if (!video.src && video.getAttribute('data-src')) {
        video.src = video.getAttribute('data-src');
        video.load();
      }
      if (video.src) {
        video.style.display = 'block';
        if (img) img.style.opacity = '0';
        video.play().catch(function(){});
      }
    });
    card.addEventListener('mouseleave', function(){
      if (!video) return;
      video.pause();
      video.style.display = 'none';
      if (img) img.style.opacity = '1';
    });

    return card;
  }

  // ─── Render a batch of cards ──────────────────────────────────────────
  function renderBatch(count) {
    var frag = document.createDocumentFragment();
    var end = Math.min(rendered + count, grid.length);
    for (var i = rendered; i < end; i++) {
      frag.appendChild(buildCard(grid[i]));
    }
    gridEl.appendChild(frag);
    rendered = end;
  }

  // ─── Initial batch (in DOM for SEO) ─────────────────────────────────
  renderBatch(typeof INITIAL_BATCH !== 'undefined' ? INITIAL_BATCH : 10);

  // ─── Infinite scroll via IntersectionObserver ─────────────────────────
  var sentinelObserver = new IntersectionObserver(function(entries){
    if (!entries[0].isIntersecting) return;
    if (rendered >= grid.length) { sentinelObserver.disconnect(); return; }
    spinner.style.display = 'flex';
    // Small delay simulates network (remove in production with real API)
    setTimeout(function(){
      renderBatch(typeof SCROLL_BATCH !== 'undefined' ? SCROLL_BATCH : 10);
      spinner.style.display = 'none';
      if (rendered >= grid.length) sentinelObserver.disconnect();
    }, 300);
  }, { rootMargin: '200px' });

  if (sentinel) sentinelObserver.observe(sentinel);

  // ─── Utils ────────────────────────────────────────────────────────────
  function escHtml(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function getVideos() {
    // Check for admin overrides in localStorage
    try {
      var stored = localStorage.getItem('secretlust_videos');
      if (stored) {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch(e){}
    // Fall back to data/videos.js
    return (typeof SECRETLUST_VIDEOS !== 'undefined') ? SECRETLUST_VIDEOS : [];
  }
})();
