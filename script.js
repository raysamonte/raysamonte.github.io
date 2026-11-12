(() => {
  'use strict';
  const config = window.PORTFOLIO || {};
  const $ = (selector) => document.querySelector(selector);
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  const themeButton = $('.theme-toggle');
  const currentTheme = () => document.documentElement.dataset.theme || (systemTheme.matches ? 'dark' : 'light');
  function updateTheme() {
    const dark = currentTheme() === 'dark';
    themeButton.classList.toggle('is-dark', dark);
    themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
    themeButton.title = `Switch to ${dark ? 'light' : 'dark'} mode (right-click to follow device)`;
    $('meta[name="theme-color"]').content = dark ? '#211a1e' : '#f4eee5';
  }
  themeButton.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('portfolio-theme', next); } catch {}
    updateTheme();
  });
  themeButton.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    delete document.documentElement.dataset.theme;
    try { localStorage.removeItem('portfolio-theme'); } catch {}
    updateTheme();
  });
  systemTheme.addEventListener('change', updateTheme);
  updateTheme();
  document.querySelectorAll('[data-display-name]').forEach(el => {
    el.textContent = config.name || 'YOUR NAME';
  });
  if (config.name && config.name !== 'YOUR NAME') document.title = `${config.name} — Multimedia Practitioner`;
  $('#year').textContent = new Date().getFullYear();

  function safeUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value, location.href);
      return ['https:', 'http:', 'file:'].includes(url.protocol) ? url.href : null;
    } catch { return null; }
  }
  const resumeUrl = safeUrl(config.resumeUrl);
  if (resumeUrl) {
    $('#resume-link').href = resumeUrl;
    $('#resume-link').setAttribute('download', '');
    $('#resume-note').hidden = true;
  }
  const contact = $('#contact-actions');
  if (config.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email)) {
    contact.replaceChildren();
    const email = document.createElement('a');
    email.href = `mailto:${config.email}`;
    email.className = 'button button-primary';
    email.textContent = 'Get in touch ↗';
    contact.append(email);
  }
  const linkedin = safeUrl(config.linkedinUrl);
  if (linkedin) {
    contact.querySelector('.contact-placeholder')?.remove();
    const link = document.createElement('a');
    link.href = linkedin; link.textContent = 'LinkedIn ↗'; link.target = '_blank'; link.rel = 'noopener noreferrer';
    contact.append(link);
  }

  function youtubeId(value) {
    if (!value) return null;
    try {
      const url = new URL(value);
      const host = url.hostname.replace(/^www\./, '');
      let id;
      if (host === 'youtu.be') id = url.pathname.split('/')[1];
      if (['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(host)) {
        id = url.searchParams.get('v') || (/^\/(embed|shorts|live)\//.test(url.pathname) ? url.pathname.split('/')[2] : null);
      }
      return /^[a-zA-Z0-9_-]{11}$/.test(id || '') ? id : null;
    } catch { return null; }
  }
  function youtubeLink(id) {
    const link = document.createElement('a');
    link.href = `https://www.youtube.com/watch?v=${id}`;
    link.textContent = 'Watch on YouTube ↗';
    link.className = 'youtube-fallback';
    link.target = '_blank';
    link.rel = 'noopener';
    return link;
  }
  function loadYoutube(shell, id, title) {
    if (!['http:', 'https:'].includes(location.protocol)) {
      const message = document.createElement('p');
      message.className = 'video-preview-message';
      message.textContent = 'To play this video here, open the website through localhost or its published HTTPS address.';
      shell.replaceChildren(message, youtubeLink(id));
      return;
    }
    const frame = document.createElement('iframe');
    // Set the policy before navigation. YouTube requires an HTTP Referer.
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.title = title;
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    const source = new URL(`https://www.youtube-nocookie.com/embed/${id}`);
    source.searchParams.set('autoplay', '1');
    source.searchParams.set('rel', '0');
    source.searchParams.set('origin', location.origin);
    frame.src = source.href;
    // Stop playback in other YouTube embeds before opening this one.
    document.querySelectorAll('.video-shell iframe').forEach(other => {
      const previous = new URL(other.src);
      previous.searchParams.set('autoplay', '0');
      other.src = previous.href;
    });
    shell.replaceChildren(frame);
    frame.focus();
  }
  const videoId = youtubeId(config.youtubeUrl);
  const playButton = $('#play-showreel');
  if (videoId) {
    $('#showreel-note').hidden = true;
    $('#video-helper').textContent = 'Play video · YouTube';
    $('#showreel-note').after(youtubeLink(videoId));
    playButton.addEventListener('click', () => {
      loadYoutube($('#video-shell'), videoId, 'Portfolio showreel');
    });
  } else {
    playButton.disabled = true;
    playButton.setAttribute('aria-label', 'Showreel coming soon');
  }

  // Each project loads a privacy-enhanced YouTube player only on click.
  const projects = Array.isArray(config.videos) ? config.videos.filter(project => project && typeof project === 'object') : [];
  $('#video-empty').hidden = projects.length > 0;
  projects.forEach(project => {
    const article = document.createElement('article');
    article.className = 'video-project';
    const shell = document.createElement('div');
    shell.className = 'video-shell project-player';
    if (safeUrl(project.poster)) {
      const poster = document.createElement('img');
      poster.src = project.poster; poster.alt = ''; poster.loading = 'lazy'; poster.width = 800; poster.height = 450;
      shell.append(poster);
    }
    const id = youtubeId(project.youtubeUrl);
    const cover = document.createElement('div'); cover.className = 'video-cover';
    const play = document.createElement('button'); play.type = 'button'; play.className = 'play-button';
    play.textContent = '▶';
    play.disabled = !id;
    play.setAttribute('aria-label', id ? `Play ${project.title || 'video project'}` : 'Video coming soon');
    const helper = document.createElement('span'); helper.className = 'video-helper'; helper.textContent = id ? 'Watch project · YouTube' : 'Video coming soon';
    cover.append(play, helper); shell.append(cover);
    if (id) play.addEventListener('click', () => {
      loadYoutube(shell, id, project.title || 'Video project');
    });
    const heading = document.createElement('h3'); heading.textContent = project.title || 'Video project';
    article.append(shell, heading);
    if (project.role) { const role = document.createElement('p'); role.className = 'project-role'; role.textContent = project.role; article.append(role); }
    if (project.description) { const description = document.createElement('p'); description.className = 'project-description'; description.textContent = project.description; article.append(description); }
    if (id) article.append(youtubeLink(id));
    $('#video-projects').append(article);
  });

  const photos = (config.photos || []).filter(photo => safeUrl(photo.src));
  const categories = ['All', ...new Set(photos.map(photo => photo.category).filter(Boolean))];
  let filtered = photos;
  let selectedIndex = 0;
  let lastPhotoButton;
  const gallery = $('#gallery');
  const dialog = $('#lightbox');
  const filters = $('.filters');
  filters.replaceChildren();
  categories.forEach((category, index) => {
    const button = document.createElement('button');
    button.className = `filter${index === 0 ? ' active' : ''}`;
    button.textContent = category;
    button.type = 'button';
    button.setAttribute('aria-pressed', String(index === 0));
    button.addEventListener('click', () => {
      filters.querySelectorAll('button').forEach(other => {
        other.classList.toggle('active', other === button);
        other.setAttribute('aria-pressed', String(other === button));
      });
      filtered = category === 'All' ? photos : photos.filter(photo => photo.category === category);
      renderGallery();
    });
    filters.append(button);
  });
  function renderGallery() {
    gallery.replaceChildren();
    filtered.forEach((photo, index) => {
      const figure = document.createElement('figure'); figure.className = 'photo';
      const button = document.createElement('button'); button.className = 'photo-button'; button.type = 'button';
      button.setAttribute('aria-label', `Enlarge ${photo.title}${photo.sample ? ' (sample image)' : ''}`);
      const image = document.createElement('img');
      image.src = photo.src; image.alt = photo.alt || photo.title; image.loading = 'lazy'; image.decoding = 'async'; image.width = 800; image.height = 600;
      const overlay = document.createElement('span'); overlay.className = 'photo-overlay';
      const title = document.createElement('span'); title.className = 'photo-title'; title.textContent = photo.title;
      const category = document.createElement('span'); category.className = 'photo-category'; category.textContent = photo.category;
      overlay.append(title, category); button.append(image, overlay); figure.append(button); gallery.append(figure);
      button.addEventListener('click', () => {
        selectedIndex = index; lastPhotoButton = button; updateLightbox(); dialog.showModal(); document.body.classList.add('modal-open');
      });
    });
    $('#photo-count').textContent = `${filtered.length} photograph${filtered.length === 1 ? '' : 's'}`;
  }
  function updateLightbox() {
    const photo = filtered[selectedIndex];
    $('#lightbox-image').src = photo.fullSrc || photo.src;
    $('#lightbox-image').alt = photo.alt || photo.title;
    $('#lightbox-title').textContent = `${photo.title}${photo.sample ? ' · Sample image' : ''}`;
    $('#lightbox-category').textContent = photo.category;
    $('#lightbox-counter').textContent = `${selectedIndex + 1} / ${filtered.length}`;
  }
  function movePhoto(direction) { selectedIndex = (selectedIndex + direction + filtered.length) % filtered.length; updateLightbox(); }
  $('#previous-photo').addEventListener('click', () => movePhoto(-1));
  $('#next-photo').addEventListener('click', () => movePhoto(1));
  $('#close-lightbox').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); lastPhotoButton?.focus(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('keydown', event => { if (event.key === 'ArrowLeft') { event.preventDefault(); movePhoto(-1); } if (event.key === 'ArrowRight') { event.preventDefault(); movePhoto(1); } });
  $('#sample-note').hidden = !photos.some(photo => photo.sample);
  renderGallery();
})();
