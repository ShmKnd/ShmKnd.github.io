/* ── CSV project loader ──
   Portfolio content lives in: data/projects.csv
   One project = one CSV record.

   This single CSV manages every project type:
     Visual / Photo / Movie / Technology / Product / mixed projects

   Media fields can be used independently or together:
     images : path1.webp | path2.webp
     youtube: https://youtu.be/...
     video  : assets/media/movie/demo.mp4
     links  : GitHub::https://... | Website::https://...

   After loading the CSV this file:
     1. builds window.PROJECTS for ui.js
     2. generates every portfolio card in #workGrid
*/
(function () {
  'use strict';

  function unescapeCell(value) {
    var out = '';
    var escaped = false;
    value = value || '';
    for (var i = 0; i < value.length; i += 1) {
      var ch = value[i];
      if (!escaped) {
        if (ch === '\\') escaped = true;
        else out += ch;
        continue;
      }
      if (ch === 'n') out += '\n';
      else if (ch === 'r') out += '\r';
      else if (ch === 't') out += '\t';
      else out += ch;
      escaped = false;
    }
    if (escaped) out += '\\';
    return out;
  }

  function parseCSV(text) {
    /* RFC 4180-compatible enough for Excel / Google Sheets exports.
       Supports quoted commas, escaped double quotes, CRLF, and real
       newlines inside quoted cells. */
    text = String(text || '').replace(/^\uFEFF/, '');
    var matrix = [];
    var row = [];
    var cell = '';
    var quoted = false;

    for (var i = 0; i < text.length; i += 1) {
      var ch = text[i];

      if (quoted) {
        if (ch === '"') {
          if (text[i + 1] === '"') {
            cell += '"';
            i += 1;
          } else {
            quoted = false;
          }
        } else {
          cell += ch;
        }
        continue;
      }

      if (ch === '"' && cell === '') {
        quoted = true;
      } else if (ch === ',') {
        row.push(cell);
        cell = '';
      } else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && text[i + 1] === '\n') i += 1;
        row.push(cell);
        matrix.push(row);
        row = [];
        cell = '';
      } else {
        cell += ch;
      }
    }

    if (cell !== '' || row.length) {
      row.push(cell);
      matrix.push(row);
    }
    if (!matrix.length) return [];

    var headers = matrix.shift().map(function (h) { return h.trim(); });
    return matrix.map(function (cells) {
      var rowObject = {};
      headers.forEach(function (header, index) {
        rowObject[header] = unescapeCell(cells[index] || '');
      });
      return rowObject;
    }).filter(function (rowObject) {
      var first = headers.length ? rowObject[headers[0]] : '';
      return String(first || '').trim() && !/^\s*#/.test(first);
    });
  }

  function splitPipe(value) {
    if (!value || !value.trim()) return [];
    return value.split(/\s*\|\s*/).map(function (v) { return v.trim(); }).filter(Boolean);
  }

  function parseLinks(value) {
    return splitPipe(value).map(function (item) {
      var marker = item.indexOf('::');
      if (marker < 0) return { label: item, url: item };
      return {
        label: item.slice(0, marker).trim() || 'Link',
        url: item.slice(marker + 2).trim()
      };
    }).filter(function (item) { return item.url; });
  }

  function enabled(value) {
    return !/^(0|false|no|off)$/i.test(String(value || '').trim());
  }

  function getYouTubeId(url) {
    if (!url || typeof url !== 'string') return '';
    try {
      var parsed = new URL(url, window.location.href);
      var host = parsed.hostname.replace(/^www\./, '').toLowerCase();
      if (host === 'youtu.be') return (parsed.pathname.split('/').filter(Boolean)[0] || '').trim();
      if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com' || host === 'youtube-nocookie.com') {
        if (parsed.pathname === '/watch') return (parsed.searchParams.get('v') || '').trim();
        var parts = parsed.pathname.split('/').filter(Boolean);
        if (parts.length >= 2 && ['embed', 'shorts', 'live'].indexOf(parts[0]) !== -1) return (parts[1] || '').trim();
      }
    } catch (e) {}
    if (/^[A-Za-z0-9_-]{11}$/.test(url.trim())) return url.trim();
    return '';
  }

  function youtubeThumbnail(url) {
    var id = getYouTubeId(url);
    return id ? 'https://i.ytimg.com/vi/' + encodeURIComponent(id) + '/hqdefault.jpg' : '';
  }

  function titleCaseTag(tag) {
    return tag ? tag.charAt(0).toUpperCase() + tag.slice(1) : '';
  }

  function rowToProject(row) {
    return {
      title: row.title || row.id,
      tags: String(row.tags || '').trim().toLowerCase(),
      images: splitPipe(row.images),
      youtube: row.youtube || '',
      video: row.video || '',
      summary: row.summary || '',
      note: row.note || '',
      note2: row.note2 || '',
      background: row.background || '',
      background_en: row.background_en || '',
      process: {
        context: row.context || '',
        approach: row.approach || '',
        result: row.result || ''
      },
      links: parseLinks(row.links)
    };
  }

  function renderCards(rows, projects) {
    var grid = document.getElementById('workGrid');
    if (!grid) return;
    grid.innerHTML = '';

    rows.filter(function (row) {
      return row.id && enabled(row.enabled);
    }).sort(function (a, b) {
      return (parseFloat(a.order) || 999999) - (parseFloat(b.order) || 999999);
    }).forEach(function (row) {
      var data = projects[row.id];
      if (!data) return;

      var tags = String(row.tags || '').trim().toLowerCase();
      var tagList = tags.split(/\s+/).filter(Boolean);
      var label = row.card_label || tagList.map(titleCaseTag).join(' · ');
      var cover = row.cover || (data.images && data.images[0]) || youtubeThumbnail(data.youtube);

      var article = document.createElement('article');
      article.className = 'work-card';
      article.dataset.tags = tags;
      article.dataset.order = row.order || '';

      var link = document.createElement('a');
      link.href = '#';
      link.className = 'work-cover project-link';
      link.dataset.project = row.id;
      link.setAttribute('aria-label', 'Open ' + data.title);

      if (cover) {
        var img = document.createElement('img');
        img.src = cover;
        img.alt = data.title;
        img.loading = 'lazy';
        link.appendChild(img);
      } else {
        var empty = document.createElement('span');
        empty.className = 'work-cover-empty';
        empty.textContent = data.title;
        link.appendChild(empty);
      }

      if (data.youtube || data.video) {
        var badge = document.createElement('span');
        badge.className = 'youtube-cover-badge';
        badge.setAttribute('aria-hidden', 'true');
        badge.textContent = '▶';
        link.appendChild(badge);
      }

      var meta = document.createElement('div');
      meta.className = 'work-meta';
      var title = document.createElement('h2');
      title.textContent = data.title;
      var tagText = document.createElement('p');
      tagText.textContent = label;
      meta.appendChild(title);
      meta.appendChild(tagText);

      article.appendChild(link);
      article.appendChild(meta);
      grid.appendChild(article);
    });
  }

  function loadFromText(text) {
    var rows = parseCSV(text);
    var projects = {};

    rows.forEach(function (row) {
      if (!row.id || !enabled(row.enabled)) return;
      projects[row.id] = rowToProject(row);
    });

    window.PROJECTS = projects;
    renderCards(rows, projects);
    return projects;
  }

  function showLoadError(error) {
    console.error('[Portfolio]', error);
    var grid = document.getElementById('workGrid');
    if (grid) grid.innerHTML = '<p class="data-load-error">Could not load portfolio data.</p>';
    return {};
  }

  window.PROJECTS = {};

  /*
     Local preview and GitHub Pages both work:

     - file://  -> use the generated fallback in assets/js/projects-data.js
     - http(s)  -> fetch data/projects.csv so CSV remains the source of truth

     If the network fetch fails on http(s), fall back to the generated copy.
  */
  var fallbackText = typeof window.PORTFOLIO_CSV_FALLBACK === 'string'
    ? window.PORTFOLIO_CSV_FALLBACK
    : '';

  if (window.location.protocol === 'file:') {
    try {
      window.PORTFOLIO_READY = Promise.resolve(loadFromText(fallbackText));
    } catch (error) {
      window.PORTFOLIO_READY = Promise.resolve(showLoadError(error));
    }
  } else {
    window.PORTFOLIO_READY = fetch('data/projects.csv', { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) throw new Error('Could not load data/projects.csv (' + response.status + ')');
        return response.text();
      })
      .then(loadFromText)
      .catch(function (error) {
        if (fallbackText) {
          console.warn('[Portfolio] CSV fetch failed; using bundled fallback.', error);
          try { return loadFromText(fallbackText); } catch (fallbackError) { return showLoadError(fallbackError); }
        }
        return showLoadError(error);
      });
  }

})();
