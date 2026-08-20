/* ── ui.js ──
   Line-level text background, side sheet, lightbox, PROCESS section.
   Depends on: window.PROJECTS (loaded from data/projects.csv by js/projects.js)
*/
(function () {
  // ── Cross-disciplinary archive filters ──
  (function () {
    var chips = Array.from(document.querySelectorAll('[data-filter]'));
    function getCards() { return Array.from(document.querySelectorAll('#workGrid .work-card')); }
    var jumpers = Array.from(document.querySelectorAll('[data-set-filter]'));
    var emptyState = document.getElementById('emptyState');
    var workSection = document.getElementById('work');
    var workGrid = document.getElementById('workGrid');
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var canAnimate = !!(window.Element && Element.prototype && Element.prototype.animate);
    var activeFilter = 'all';
    var transitionToken = 0;

    function matchesFilter(card, filter) {
      if (filter === 'all') return true;
      var tags = (card.dataset.tags || '').split(/\s+/).filter(Boolean);
      return tags.indexOf(filter) !== -1;
    }

    function numericOrder(card) {
      var value = parseFloat(card.dataset.order);
      return Number.isFinite(value) ? value : 999999;
    }

    function shuffled(cards) {
      var result = cards.slice();
      for (var i = result.length - 1; i > 0; i -= 1) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = result[i];
        result[i] = result[j];
        result[j] = tmp;
      }

      /* Avoid a no-op shuffle when possible, especially at the top position. */
      if (result.length > 1 && cards.every(function (card, index) { return card === result[index]; })) {
        result.push(result.shift());
      }
      return result;
    }

    function reorderCards(filter, cards) {
      if (!workGrid) return cards;
      var ordered = filter === 'all'
        ? shuffled(cards)
        : cards.slice().sort(function (a, b) { return numericOrder(a) - numericOrder(b); });
      ordered.forEach(function (card) { workGrid.appendChild(card); });
      return ordered;
    }

    function updateControls(filter) {
      chips.forEach(function (chip) {
        var active = chip.dataset.filter === filter;
        chip.classList.toggle('is-active', active);
        chip.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }

    function updateEmptyState(filter) {
      if (!emptyState) return;
      var visibleCount = getCards().filter(function (card) {
        return matchesFilter(card, filter) && !card.classList.contains('is-hidden');
      }).length;
      emptyState.textContent = 'No work has been added to this category yet.';
      emptyState.hidden = visibleCount !== 0;
    }

    function updateHistory(filter) {
      try { history.replaceState(null, '', filter === 'all' ? '#work' : '#work/' + filter); } catch (e) {}
    }

    function cancelCardAnimations() {
      getCards().forEach(function (card) {
        if (!card.getAnimations) return;
        card.getAnimations().forEach(function (animation) {
          try { animation.cancel(); } catch (e) {}
        });
      });
    }

    function applyImmediate(filter, shouldUpdateHistory) {
      var cards = getCards();
      reorderCards(filter, cards);
      cards.forEach(function (card) {
        card.classList.toggle('is-hidden', !matchesFilter(card, filter));
      });
      updateControls(filter);
      updateEmptyState(filter);
      activeFilter = filter;
      if (shouldUpdateHistory !== false) updateHistory(filter);
    }

    function animateFilter(filter) {
      if (!workGrid) return;

      /* Re-clicking a non-All category is intentionally a no-op.
         Re-clicking All always reshuffles. */
      if (filter === activeFilter && filter !== 'all') {
        updateControls(filter);
        return;
      }

      transitionToken += 1;
      var token = transitionToken;
      cancelCardAnimations();

      var cards = getCards();
      var currentVisible = cards.filter(function (card) { return !card.classList.contains('is-hidden'); });
      var targetVisible = cards.filter(function (card) { return matchesFilter(card, filter); });
      var targetSet = new Set(targetVisible);
      var firstRects = new Map();

      currentVisible.forEach(function (card) {
        firstRects.set(card, card.getBoundingClientRect());
      });

      var exiting = currentVisible.filter(function (card) { return !targetSet.has(card); });
      var entering = targetVisible.filter(function (card) { return card.classList.contains('is-hidden'); });

      updateControls(filter);
      activeFilter = filter;
      updateHistory(filter);

      if (reduceMotion || !canAnimate) {
        applyImmediate(filter, false);
        return;
      }

      /* Phase 1: only cards that are no longer needed fade away.
         The rest of the grid stays fully visible. */
      var exitAnimations = exiting.map(function (card) {
        return card.animate(
          [{ opacity: 1 }, { opacity: 0 }],
          { duration: 135, easing: 'cubic-bezier(.4,0,1,1)', fill: 'both' }
        );
      });

      var exitsFinished = exitAnimations.length
        ? Promise.all(exitAnimations.map(function (animation) { return animation.finished.catch(function () {}); }))
        : Promise.resolve();

      exitsFinished.then(function () {
        if (token !== transitionToken) return;

        exiting.forEach(function (card) {
          card.classList.add('is-hidden');
          if (card.getAnimations) card.getAnimations().forEach(function (animation) { try { animation.cancel(); } catch (e) {} });
        });

        /* Make new cards participate in layout at opacity 0. */
        entering.forEach(function (card) {
          card.classList.remove('is-hidden');
          card.style.opacity = '0';
        });

        /* Non-All categories return to their deliberate CSV order.
           All deliberately gets a fresh random order every time. */
        reorderCards(filter, getCards());

        /* Force the target layout before calculating FLIP deltas. */
        void workGrid.offsetWidth;

        var targetCards = getCards().filter(function (card) { return !card.classList.contains('is-hidden'); });
        var moveAnimations = [];

        targetCards.forEach(function (card) {
          if (!firstRects.has(card)) return;
          var first = firstRects.get(card);
          var last = card.getBoundingClientRect();
          var dx = first.left - last.left;
          var dy = first.top - last.top;
          if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;

          moveAnimations.push(card.animate(
            [
              { transform: 'translate(' + dx + 'px,' + dy + 'px)' },
              { transform: 'translate(0,0)' }
            ],
            { duration: 285, easing: 'cubic-bezier(.22,1,.36,1)' }
          ));
        });

        /* Phase 2: only newly required cards fade in. */
        entering.forEach(function (card) {
          card.style.opacity = '';
          card.animate(
            [{ opacity: 0 }, { opacity: 1 }],
            { duration: 190, delay: 35, easing: 'ease-out', fill: 'both' }
          ).finished.catch(function () {}).then(function () {
            if (token !== transitionToken) return;
            if (card.getAnimations) {
              card.getAnimations().forEach(function (animation) {
                if (animation.playState === 'finished') {
                  try { animation.cancel(); } catch (e) {}
                }
              });
            }
          });
        });

        updateEmptyState(filter);
      });
    }

    function setFilter(filter, immediate, shouldUpdateHistory) {
      if (immediate) {
        transitionToken += 1;
        cancelCardAnimations();
        applyImmediate(filter, shouldUpdateHistory);
        return;
      }
      animateFilter(filter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () { setFilter(chip.dataset.filter || 'all'); });
    });

    jumpers.forEach(function (button) {
      button.addEventListener('click', function () {
        setFilter(button.dataset.setFilter || 'all');
        if (workSection) workSection.scrollIntoView({ behavior:'smooth', block:'start' });
      });
    });

    var initial = (location.hash.match(/^#work\/(visual|technology|product|photo|movie)$/) || [])[1];
    if (initial) {
      setFilter(initial, true, false);
    } else {
      /* Start All in a random order too, without rewriting the URL on load. */
      setFilter('all', true, false);
    }

  })();

  // ── Side Sheet logic ──
  (function () {
    const projects = window.PROJECTS || {};

    /* ── YouTube helpers ── */
    function getYouTubeId(url) {
      if (!url || typeof url !== 'string') return '';
      try {
        var parsed = new URL(url, window.location.href);
        var host = parsed.hostname.replace(/^www\./, '').toLowerCase();

        if (host === 'youtu.be') {
          return (parsed.pathname.split('/').filter(Boolean)[0] || '').trim();
        }

        if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com' || host === 'youtube-nocookie.com') {
          if (parsed.pathname === '/watch') return (parsed.searchParams.get('v') || '').trim();
          var parts = parsed.pathname.split('/').filter(Boolean);
          if (parts.length >= 2 && ['embed', 'shorts', 'live'].indexOf(parts[0]) !== -1) {
            return (parts[1] || '').trim();
          }
        }
      } catch (e) {}

      /* Also accept a bare 11-character video ID. */
      if (/^[A-Za-z0-9_-]{11}$/.test(url.trim())) return url.trim();
      return '';
    }

    function getYouTubeEmbedUrl(url) {
      var id = getYouTubeId(url);
      return id ? 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?rel=0' : '';
    }

    function getYouTubeThumbnailUrl(url) {
      var id = getYouTubeId(url);
      return id ? 'https://i.ytimg.com/vi/' + encodeURIComponent(id) + '/hqdefault.jpg' : '';
    }

    /* ── Preload all local project images ── */
    (function preloadProjectImages() {
      Object.keys(projects).forEach(function (key) {
        var images = Array.isArray(projects[key].images) ? projects[key].images : [];
        images.forEach(function (src) {
          var img = new Image();
          img.src = src;
        });
      });
    })();

    /* If a project card has no <img>, use its YouTube thumbnail automatically. */
    (function hydrateYouTubeCardCovers() {
      document.querySelectorAll('a.project-link[data-project]').forEach(function (link) {
        if (link.querySelector('img')) return;
        var data = projects[link.dataset.project];
        if (!data || !data.youtube) return;
        var thumb = getYouTubeThumbnailUrl(data.youtube);
        if (!thumb) return;

        var img = document.createElement('img');
        img.src = thumb;
        img.alt = data.title || 'YouTube video';
        img.loading = 'lazy';
        link.appendChild(img);

        var badge = document.createElement('span');
        badge.className = 'youtube-cover-badge';
        badge.setAttribute('aria-hidden', 'true');
        badge.textContent = '▶';
        link.appendChild(badge);
      });
    })();

    const sheet        = document.getElementById('sideSheet');
    const overlay      = document.getElementById('sheetOverlay');
    const btnBack      = document.getElementById('sheetBack');
    const elTitle      = document.getElementById('sheetTitle');
    const elImages     = document.getElementById('sheetImages');
    const elSummary    = document.getElementById('sheetSummary');
    const elBackground = document.getElementById('sheetBackground');
    const elNotes      = document.getElementById('sheetNotes');
    const elLinks      = document.getElementById('sheetLinks');

    /* ── Slider state ── */
    var sliderTrack = null;
    var sliderIndex = 0;
    var sliderTotal = 0;

    function goSlide(i) {
      if (!sliderTrack || i < 0 || i >= sliderTotal) return;
      sliderIndex = i;
      var slideW = sliderTrack.parentNode.offsetWidth;
      sliderTrack.style.transform = 'translateX(' + -(i * slideW) + 'px)';
      /* Update dots */
      var slider = sliderTrack.parentNode.parentNode;
      var dots = slider.querySelectorAll('.sheet-dot');
      dots.forEach(function (d, di) {
        d.classList.toggle('is-active', di === i);
      });
      /* Update edge shadows on track-wrap */
      var wrap = sliderTrack.parentNode;
      if (wrap) {
        wrap.classList.toggle('has-prev', i > 0);
        wrap.classList.toggle('has-next', i < sliderTotal - 1);
      }
    }

    /* ── Lightbox (Shared Element Transition) ── */
    var lbEl     = document.getElementById('lightbox');
    var lbBg     = document.getElementById('lightboxBg');
    var lbImg    = document.getElementById('lightboxImg');
    var lbSource = null; /* source <img> for return animation */

    function openLightbox(srcImg) {
      lbSource = srcImg;
      lbImg.src = srcImg.src;

      var r = srcImg.getBoundingClientRect();
      lbImg.style.transition = 'none';
      lbImg.style.left   = r.left + 'px';
      lbImg.style.top    = r.top  + 'px';
      lbImg.style.width  = r.width  + 'px';
      lbImg.style.height = r.height + 'px';
      lbImg.style.borderRadius = '6px';

      lbEl.classList.add('is-active');
      void lbImg.offsetWidth;

      var pad = 32;
      var vw = window.innerWidth, vh = window.innerHeight;
      var natW = srcImg.naturalWidth  || r.width;
      var natH = srcImg.naturalHeight || r.height;
      var scale = Math.min((vw - pad * 2) / natW, (vh - pad * 2) / natH, 1);
      var dw = natW * scale, dh = natH * scale;
      var dl = (vw - dw) / 2, dt = (vh - dh) / 2;

      lbImg.style.transition = 'left .38s cubic-bezier(0.22,1,0.36,1), top .38s cubic-bezier(0.22,1,0.36,1), width .38s cubic-bezier(0.22,1,0.36,1), height .38s cubic-bezier(0.22,1,0.36,1), border-radius .38s ease';
      lbImg.style.left   = dl + 'px';
      lbImg.style.top    = dt + 'px';
      lbImg.style.width  = dw + 'px';
      lbImg.style.height = dh + 'px';
      lbImg.style.borderRadius = '0';
    }

    function closeLightbox() {
      if (!lbSource) { lbEl.classList.remove('is-active'); return; }

      var r = lbSource.getBoundingClientRect();
      lbImg.style.transition = 'left .32s cubic-bezier(0.22,1,0.36,1), top .32s cubic-bezier(0.22,1,0.36,1), width .32s cubic-bezier(0.22,1,0.36,1), height .32s cubic-bezier(0.22,1,0.36,1), border-radius .32s ease';
      lbImg.style.left   = r.left + 'px';
      lbImg.style.top    = r.top  + 'px';
      lbImg.style.width  = r.width  + 'px';
      lbImg.style.height = r.height + 'px';
      lbImg.style.borderRadius = '6px';

      lbBg.style.opacity = '0';

      function onEnd() {
        lbImg.removeEventListener('transitionend', onEnd);
        lbEl.classList.remove('is-active');
        lbBg.style.opacity = '';
        lbSource = null;
      }
      lbImg.addEventListener('transitionend', onEnd);
    }

    lbBg.addEventListener('click', closeLightbox);
    lbImg.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lbEl.classList.contains('is-active')) {
        e.stopPropagation();
        closeLightbox();
      }
    });

    function updateEdgeShadows(el) {
      if (!el) return;
      var wrap = el.querySelector('.sheet-slider-track-wrap');
      if (wrap) {
        wrap.classList.toggle('has-prev', sliderIndex > 0);
        wrap.classList.toggle('has-next', sliderIndex < sliderTotal - 1);
      }
    }

    function initSwipe(el) {
      var startX = 0, startY = 0, dx = 0, locked = false, moved = false, captured = false;
      var trackWrap = el.querySelector('.sheet-slider-track-wrap');

      /* Hover side tracking for edge shadows */
      el.addEventListener('mousemove', function (e) {
        if (!trackWrap) return;
        var rect = el.getBoundingClientRect();
        var ratio = (e.clientX - rect.left) / rect.width;
        trackWrap.classList.toggle('hover-left',  ratio < 0.35);
        trackWrap.classList.toggle('hover-right', ratio > 0.65);
      });
      el.addEventListener('mouseleave', function () {
        if (!trackWrap) return;
        trackWrap.classList.remove('hover-left', 'hover-right');
      });

      el.addEventListener('pointerdown', function (e) {
        if (e.target.classList.contains('sheet-dot')) return;
        startX = e.clientX; startY = e.clientY;
        dx = 0; locked = false; moved = false; captured = true;
        if (sliderTotal >= 2) {
          sliderTrack.classList.add('is-dragging');
          el.setPointerCapture(e.pointerId);
        }
      });

      el.addEventListener('pointermove', function (e) {
        if (!captured || !sliderTrack || !sliderTrack.classList.contains('is-dragging')) return;
        dx = e.clientX - startX;
        var dy = e.clientY - startY;
        if (!locked && Math.abs(dy) > Math.abs(dx)) {
          sliderTrack.classList.remove('is-dragging');
          captured = false;
          return;
        }
        locked = true;
        if (Math.abs(dx) > 4) moved = true;
        var slideW = sliderTrack.parentNode.offsetWidth;
        var base = -(sliderIndex * slideW);
        sliderTrack.style.transform = 'translateX(' + (base + dx) + 'px)';
      });

      function end(e) {
        if (!captured) return;
        captured = false;
        if (!sliderTrack) return;
        var wasDragging = sliderTrack.classList.contains('is-dragging');
        sliderTrack.classList.remove('is-dragging');

        if (moved && wasDragging) {
          var threshold = el.offsetWidth * 0.2;
          if (dx < -threshold && sliderIndex < sliderTotal - 1) goSlide(sliderIndex + 1);
          else if (dx > threshold && sliderIndex > 0) goSlide(sliderIndex - 1);
          else goSlide(sliderIndex);
        } else if (!moved) {
          var rect = el.getBoundingClientRect();
          var tapX = (e.clientX - rect.left) / rect.width;
          if (tapX < 0.30) {
            if (sliderIndex > 0) goSlide(sliderIndex - 1);
          } else if (tapX > 0.70) {
            if (sliderIndex < sliderTotal - 1) goSlide(sliderIndex + 1);
          } else {
            var imgs = sliderTrack.querySelectorAll('img');
            if (imgs[sliderIndex]) openLightbox(imgs[sliderIndex]);
          }
        }
        updateEdgeShadows(el);
      }

      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', end);

      updateEdgeShadows(el);
    }

    /* ── PROCESS section (accordion with staggered subsections) ──
       Returns a cleanup function. */
    function renderMarkdownToFragment(markdown) {
      var frag = document.createDocumentFragment();
      if (!markdown || !markdown.toString().trim()) return frag;
      var lines = markdown.replace(/\t/g, '  ').split(/\r?\n/);

      var para = null;
      // currentList tracks the active list element (ul/ol) and its indent level
      var currentList = null;
      var currentListIndent = -1;
      var currentListTag = '';

      function closeParagraph() { para = null; }

      function closeList() {
        currentList = null;
        currentListIndent = -1;
        currentListTag = '';
      }

      lines.forEach(function (raw) {
        var line = raw.replace(/\s+$/, '');
        if (!line.trim()) {
          closeParagraph();
          return;
        }

        var m = line.match(/^(\s*)([-+*]|\d+\.)\s+(.*)$/);
        if (m) {
          var indent = m[1].length;
          var marker = m[2];
          var text = m[3];
          var listType = /\d+\./.test(marker) ? 'ol' : 'ul';

          closeParagraph();

          // Reuse existing list if same indent and same type, otherwise start a new one
          if (!currentList || indent !== currentListIndent || listType !== currentListTag) {
            currentList = document.createElement(listType);
            currentListIndent = indent;
            currentListTag = listType;
            frag.appendChild(currentList);
          }

          var li = document.createElement('li');
          li.textContent = text;
          currentList.appendChild(li);
          return;
        }

        // Non-list line: close any active list
        closeList();

        if (!para) {
          para = document.createElement('p');
          para.textContent = line.trim();
          frag.appendChild(para);
        } else {
          para.textContent += ' ' + line.trim();
        }
      });

      return frag;
    }

    function createProcessSection(parentEl, data) {
      var heading = document.createElement('h3');
      heading.className = 'sheet-section-heading process-heading';
      heading.textContent = 'PROCESS';

      var icon = document.createElement('span');
      icon.className = 'material-symbols-outlined process-heading-icon';
      icon.textContent = 'expand_more';
      heading.appendChild(icon);
      heading.setAttribute('role', 'button');
      heading.setAttribute('tabindex', '0');

      var content = document.createElement('div');
      content.className = 'sheet-process-content';

      // Sections to render under PROCESS
      var sections = [
        { key: 'context',  title: 'Context'  },
        { key: 'approach', title: 'Approach' },
        { key: 'result',   title: 'Result'   }
      ];

      var subsections = [];
      sections.forEach(function (s) {
        var wrap = document.createElement('div');
        wrap.className = 'process-subsection';

        var subh = document.createElement('div');
        subh.className = 'process-subheading';
        subh.textContent = s.title;
        wrap.appendChild(subh);

        var body = document.createElement('div');
        body.className = 'process-body';

        var val = '';
        if (data && data.process) {
          if (data.process[s.key] !== undefined) val = data.process[s.key];
        }

        var mdSource = '';
        if (Array.isArray(val)) mdSource = val.join('\n\n');
        else if (typeof val === 'string') mdSource = val;

        var frag = renderMarkdownToFragment(mdSource || '');
        body.appendChild(frag);

        wrap.appendChild(body);
        content.appendChild(wrap);
        subsections.push(wrap);
      });

      parentEl.appendChild(heading);
      parentEl.appendChild(content);

      var opened = false;
      var timeouts = [];

      function openProc() {
        if (opened) return;
        opened = true;
        icon.textContent = 'expand_less';
        content.classList.add('is-open');
        content.style.maxHeight = (content.scrollHeight + 28) + 'px';
        content.style.opacity = '1';
        subsections.forEach(function (el, i) {
          var t = setTimeout(function () { el.classList.add('is-visible'); }, 70 * i);
          timeouts.push(t);
        });
      }

      function closeProc() {
        if (!opened) return;
        opened = false;
        icon.textContent = 'expand_more';
        subsections.forEach(function (el) { el.classList.remove('is-visible'); });
        content.style.maxHeight = '0px';
        content.style.opacity = '0';
        content.classList.remove('is-open');
        timeouts.forEach(function (id) { clearTimeout(id); });
        timeouts = [];
      }

      function onToggle() { if (opened) closeProc(); else openProc(); }

      heading.addEventListener('click', onToggle);
      heading.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); }
      });

      return function cleanup() {
        heading.removeEventListener('click', onToggle);
        heading.removeEventListener('keydown', onToggle);
        closeProc();
        try { parentEl.removeChild(heading); } catch (e) {}
        try { parentEl.removeChild(content); } catch (e) {}
      };
    }

    function openSheet(key) {
      const data = projects[key];
      if (!data) return;

      elTitle.textContent = data.title;

      /* Clean up previous resize listener */
      var prevSlider = elImages.querySelector('.sheet-slider');
      if (prevSlider && prevSlider._cleanResize) prevSlider._cleanResize();

      elImages.innerHTML = '';
      sliderIndex = 0;

      /* YouTube media from the universal CSV. */
      var youtubeEmbed = getYouTubeEmbedUrl(data.youtube || '');
      if (youtubeEmbed) {
        var ytWrap = document.createElement('div');
        ytWrap.className = 'sheet-youtube';

        var iframe = document.createElement('iframe');
        iframe.src = youtubeEmbed;
        iframe.title = (data.title || 'Project') + ' — YouTube video';
        iframe.loading = 'lazy';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');

        ytWrap.appendChild(iframe);
        elImages.appendChild(ytWrap);
      }

      /* Self-hosted / local video file. Useful for reels that should not use YouTube. */
      var localVideo = String(data.video || '').trim();
      if (localVideo) {
        var videoWrap = document.createElement('div');
        videoWrap.className = 'sheet-video';

        var video = document.createElement('video');
        video.src = localVideo;
        video.controls = true;
        video.preload = 'metadata';
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('controlslist', 'nodownload');
        video.setAttribute('aria-label', (data.title || 'Project') + ' — video');

        videoWrap.appendChild(video);
        elImages.appendChild(videoWrap);
      }

      var projectImages = Array.isArray(data.images) ? data.images : [];
      if (projectImages.length) {
        /* Build slider */
        var slider = document.createElement('div');
        slider.className = 'sheet-slider';

        var trackWrap = document.createElement('div');
        trackWrap.className = 'sheet-slider-track-wrap';
        var track = document.createElement('div');
        track.className = 'sheet-slider-track';
        projectImages.forEach(function (src) {
          var img = document.createElement('img');
          img.src = src;
          img.alt = data.title;
          img.draggable = false;
          track.appendChild(img);
        });
        trackWrap.appendChild(track);
        slider.appendChild(trackWrap);

        /* Dots */
        if (projectImages.length > 1) {
          var dots = document.createElement('div');
          dots.className = 'sheet-dots';
          projectImages.forEach(function (_, i) {
            var d = document.createElement('button');
            d.className = 'sheet-dot' + (i === 0 ? ' is-active' : '');
            d.setAttribute('aria-label', 'Slide ' + (i + 1));
            d.addEventListener('click', function () { goSlide(i); });
            dots.appendChild(d);
          });
          slider.appendChild(dots);
        }

        elImages.appendChild(slider);
        sliderTrack = track;
        sliderTotal = projectImages.length;

        /* Set slide width as CSS var and recalc on resize */
        function syncSlideWidth() {
          var w = trackWrap.offsetWidth;
          sliderTrack.style.setProperty('--slide-w', w + 'px');
          goSlide(sliderIndex);
        }
        syncSlideWidth();
        window.addEventListener('resize', syncSlideWidth);
        slider._cleanResize = function () { window.removeEventListener('resize', syncSlideWidth); };

        initSwipe(slider);
      } else {
        if (!youtubeEmbed && !localVideo) {
          elImages.innerHTML = '<p class="sheet-no-image">No media yet.</p>';
        }
        sliderTrack = null;
        sliderTotal = 0;
      }

      /* Populate textual sections */
      elSummary.textContent = data.summary || '';

      elNotes.innerHTML = '';
      if (data.note) {
        var n = document.createElement('p'); n.className = 'sheet-note'; n.textContent = data.note; elNotes.appendChild(n);
      }
      if (data.note2) {
        var n2 = document.createElement('p'); n2.className = 'sheet-note'; n2.textContent = data.note2; elNotes.appendChild(n2);
      }

      elBackground.innerHTML = '';
      if (data.background) {
        var bg = document.createElement('div'); bg.className = 'sheet-background-text'; bg.textContent = data.background; elBackground.appendChild(bg);
      }
      if (data.background_en) {
        var bgen = document.createElement('div'); bgen.className = 'sheet-background-en'; bgen.textContent = data.background_en; elBackground.appendChild(bgen);
      }

      elLinks.innerHTML = '';
      if (Array.isArray(data.links) && data.links.length) {
        data.links.forEach(function (lnk) {
          var a = document.createElement('a');
          a.href = lnk.url || lnk.href || '#';
          a.target = '_blank';
          a.rel = 'noopener';
          a.textContent = lnk.label || lnk.title || lnk.url || 'Link';
          elLinks.appendChild(a);
        });
      }

      /* Create PROCESS section (cleanup previous if present) */
      if (elBackground._procClean) { elBackground._procClean(); }
      var projectTags = String(data.tags || '').split(/\s+/).filter(Boolean);
      var isMediaProject = projectTags.indexOf('photo') !== -1 || projectTags.indexOf('movie') !== -1;
      elBackground._procClean = isMediaProject
        ? null
        : createProcessSection(elBackground, data);

      /* Show sheet */
      sheet.classList.add('is-open');
      overlay.classList.add('is-visible');
      document.body.classList.add('sheet-open');
      sheet.setAttribute('aria-hidden', 'false');
    }

    function closeSheet() {
      sheet.classList.remove('is-open');
      overlay.classList.remove('is-visible');
      document.body.classList.remove('sheet-open');
      sheet.setAttribute('aria-hidden', 'true');

      /* Cleanup slider resize handler */
      var prevSlider = elImages.querySelector('.sheet-slider');
      if (prevSlider && prevSlider._cleanResize) prevSlider._cleanResize();

      /* Cleanup PROCESS section */
      if (elBackground._procClean) { elBackground._procClean(); delete elBackground._procClean; }

      /* Clear image area */
      elImages.innerHTML = '';
      sliderTrack = null; sliderTotal = 0; sliderIndex = 0;
    }

    /* Delegate project link clicks */
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a.project-link') : null;
      if (!a) return;
      e.preventDefault();
      openSheet(a.dataset.project);
    });

    btnBack.addEventListener('click', closeSheet);
    overlay.addEventListener('click', closeSheet);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSheet();
    });
  })();

})();
