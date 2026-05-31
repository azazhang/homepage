// ===== JJJ_B INTERACTIVE MUSIC STUDIO SCRIPT =====
// Modern, high-performance vanilla JavaScript for Alabaster Synth

// Global state for dial knob values to prevent layout thrashing (getComputedStyle) in 60fps loops
const knobState = {
  glow: 0.5,       // Ranges 0.0 to 1.0 (default 50%)
  speed: 0.5,      // Ranges 0.0 to 1.0 (default 50%)
  compressor: 0.6  // Ranges 0.0 to 1.0 (default 60%)
};

document.addEventListener('DOMContentLoaded', () => {
  // ===== CORE INITIALIZATION =====
  initNavigation();
  initScrollReveal();
  initScrollToTop();
  
  // Initialize background Canvas wave animation
  const bgVisualizer = initBackgroundCanvas();

  // Initialize interactive dials/knobs
  initHardwareKnobs(bgVisualizer);

  // Initialize discography & dynamic Bandcamp sync
  initMusicSync();

  // Initialize contact form handler
  initContactForm();
});

// ===== MOBILE DRAWER NAVIGATION =====
function initNavigation() {
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navLinkItems = document.querySelectorAll('.nav-link');
  const header = document.querySelector('.header');

  // Create overlay element dynamically if it doesn't exist
  let navOverlay = document.querySelector('.nav-overlay');
  if (!navOverlay) {
    navOverlay = document.createElement('div');
    navOverlay.className = 'nav-overlay';
    document.body.appendChild(navOverlay);
  }

  if (mobileToggle && navLinks) {
    const toggleMenu = () => {
      mobileToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      navOverlay.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    };

    mobileToggle.addEventListener('click', toggleMenu);
    navOverlay.addEventListener('click', toggleMenu);

    navLinkItems.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navLinks.classList.remove('active');
        navOverlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // Header shrink on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// ===== SCROLL REVEALS USING INTERSECTION OBSERVER =====
function initScrollReveal() {
  const fadeElements = document.querySelectorAll('.fade-in');
  
  if (!fadeElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Trigger once
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -40px 0px'
  });

  fadeElements.forEach(element => {
    observer.observe(element);
  });
}

// ===== SCROLL TO TOP =====
function initScrollToTop() {
  let scrollBtn = document.querySelector('.scroll-to-top');
  
  if (!scrollBtn) {
    scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.innerHTML = '↑';
    scrollBtn.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(scrollBtn);
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > window.innerHeight) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  });

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// ===== INTERACTIVE BACKGROUND CANVAS WAVES =====
function initBackgroundCanvas() {
  const canvas = document.getElementById('wave-canvas');
  if (!canvas) return null;

  const ctx = canvas.getContext('2d');
  let animationFrameId;

  // Option A: Render at a lower resolution scale to significantly reduce GPU pixel fill-rate load.
  // Stretched back to 100vw/100vh using CSS, this cuts drawing computations by 75%.
  const resolutionScale = 0.5;

  // State tracker
  const state = {
    width: 0,
    height: 0,
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    speedScale: 1.0,
    amplitudeScale: 1.0,
    colorAlpha: 0.07,
    time: 0
  };

  let lastWidth = 0;
  function resize() {
    // Only resize if the width actually changed (prevents iOS address bar resize visual flicker)
    if (window.innerWidth === lastWidth && canvas.width > 0) return;
    lastWidth = window.innerWidth;

    state.width = Math.floor(window.innerWidth * resolutionScale);
    state.height = Math.floor(window.innerHeight * resolutionScale);
    canvas.width = state.width;
    canvas.height = state.height;
  }
  resize();
  window.addEventListener('resize', resize);

  // Hover tracking
  window.addEventListener('mousemove', (e) => {
    state.mouse.targetX = e.clientX * resolutionScale;
    state.mouse.targetY = e.clientY * resolutionScale;
  });

  let lastFrameTime = 0;
  // Main render loop
  function draw(timestamp) {
    animationFrameId = requestAnimationFrame(draw);

    // Throttle to ~30 FPS to optimize GPU rendering and battery
    if (timestamp && timestamp - lastFrameTime < 33) return;
    if (timestamp) lastFrameTime = timestamp;

    ctx.clearRect(0, 0, state.width, state.height);

    // Damping mouse position
    state.mouse.x += (state.mouse.targetX - state.mouse.x) * 0.05;
    state.mouse.y += (state.mouse.targetY - state.mouse.y) * 0.05;

    state.colorAlpha = 0.08 + (knobState.glow * 0.22); // knob glow changes line opacity (ranges 8% to 30%)
    state.speedScale = 0.3 + (knobState.speed * 2.0);   // knob speed changes wave frequency
    state.amplitudeScale = 0.2 + (knobState.compressor * 2.2); // knob compressor changes amplitude

    state.time += 0.005 * state.speedScale;

    // Draw three stacked sine waves (higher base amplitude for visibility)
    drawWave(2, 100, 0.001, state.colorAlpha, '#A855F7'); // Purple
    drawWave(3, 70, 0.0015, state.colorAlpha * 0.8, '#06B6D4'); // Teal
    drawWave(1.5, 140, 0.0008, state.colorAlpha * 0.5, '#EC4899'); // Pink
  }

  function drawWave(frequencyScale, baseAmplitude, density, opacity, color) {
    ctx.save();
    ctx.beginPath();

    const midY = state.height / 2;
    // Mouse warp factor
    const warpOffset = (state.mouse.y - midY) * 0.15;
    const freqOffset = (state.mouse.x / state.width) * 0.002;

    ctx.strokeStyle = color;
    ctx.lineWidth = 3.5 * resolutionScale; // scale the line width to display perfectly on-screen
    ctx.globalAlpha = opacity;

    // Smooth drawing step size (in canvas pixels)
    const step = 10;

    for (let x = 0; x < state.width; x += step) {
      const angle = (x * (density / resolutionScale) * frequencyScale) + state.time + freqOffset;
      // Core wave calculation (scaled by resolutionScale to look identical on-screen)
      const waveVal = Math.sin(angle) * (baseAmplitude * resolutionScale) * state.amplitudeScale;
      // Scroll-wave factor
      const scrollFactor = Math.sin(x * (0.005 / resolutionScale) + state.time) * (15 * resolutionScale);
      const y = midY + waveVal + warpOffset + scrollFactor;

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
    ctx.restore();
  }

  draw();

  return {
    updateKnobValues: () => {
      // Prompt CSS refresh triggers automatically
    }
  };
}

// ===== HARDWARE DIALS DRAG-ROTATION CONTROLLERS =====
function initHardwareKnobs(bgVisualizer) {
  const knobs = document.querySelectorAll('.knob');

  knobs.forEach(knob => {
    const needle = knob.querySelector('.knob-needle');
    const propertyMap = {
      'knob-glow': '--glow-strength',
      'knob-speed': '--visualizer-speed',
      'knob-eq': '--compressor-val'
    };
    const propName = propertyMap[knob.id];
    
    // Set initial position based on initial value
    const initialPercent = parseFloat(knob.getAttribute('data-val') || '50') / 100;
    const initialDegrees = (initialPercent * 280) - 140; // -140 to +140 range
    if (needle) needle.style.transform = `rotate(${initialDegrees}deg)`;

    // Rotation dragging state
    let isDragging = false;
    let startY = 0;
    let startVal = parseFloat(knob.getAttribute('data-val') || '50');

    knob.addEventListener('mousedown', (e) => {
      isDragging = true;
      startY = e.clientY;
      startVal = parseFloat(knob.getAttribute('data-val') || '50');
      document.body.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const deltaY = startY - e.clientY; // drag up to increase
      const sensitivity = 0.5; // adjust rotation speed
      let newVal = startVal + (deltaY * sensitivity);
      newVal = Math.max(0, Math.min(100, newVal)); // cap 0-100

      knob.setAttribute('data-val', newVal.toString());

      // Update needle rotation
      const percent = newVal / 100;
      const angle = (percent * 280) - 140;
      if (needle) needle.style.transform = `rotate(${angle}deg)`;

      // Write value to CSS custom property
      const mappedVal = percent; // map to 0.0 - 1.0 range
      document.documentElement.style.setProperty(propName, mappedVal.toString());

      // Update in-memory state to avoid layout thrashing
      if (knob.id === 'knob-glow') knobState.glow = percent;
      if (knob.id === 'knob-speed') knobState.speed = percent;
      if (knob.id === 'knob-eq') knobState.compressor = percent;

      // If active, update background canvas
      if (bgVisualizer) bgVisualizer.updateKnobValues();
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        document.body.style.cursor = '';
      }
    });

    // Touch support for mobile devices
    knob.addEventListener('touchstart', (e) => {
      isDragging = true;
      startY = e.touches[0].clientY;
      startVal = parseFloat(knob.getAttribute('data-val') || '50');
      e.preventDefault();
    });

    document.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const deltaY = startY - e.touches[0].clientY;
      const sensitivity = 0.5;
      let newVal = startVal + (deltaY * sensitivity);
      newVal = Math.max(0, Math.min(100, newVal));
      knob.setAttribute('data-val', newVal.toString());
      const percent = newVal / 100;
      const angle = (percent * 280) - 140;
      if (needle) needle.style.transform = `rotate(${angle}deg)`;
      const mappedVal = percent;
      document.documentElement.style.setProperty(propName, mappedVal.toString());
      
      // Update in-memory state to avoid layout thrashing
      if (knob.id === 'knob-glow') knobState.glow = percent;
      if (knob.id === 'knob-speed') knobState.speed = percent;
      if (knob.id === 'knob-eq') knobState.compressor = percent;

      if (bgVisualizer) bgVisualizer.updateKnobValues();
    });

    document.addEventListener('touchend', () => {
      isDragging = false;
    });
  });
}

// ===== BANDCAMP AUTO-SYNC SCRAPER & DECKS LOGIC =====
function fixImagePath(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  const isSubdir = window.location.pathname.includes('/music/') || window.location.pathname.includes('/contact/');
  if (isSubdir) {
    if (path.startsWith('../')) return path;
    return '../' + path;
  }
  return path;
}

function initMusicSync() {
  const catalogGrid = document.getElementById('catalog-grid');
  const consoleSelectorsList = document.getElementById('console-selectors-list');
  const syncBanner = document.getElementById('catalog-sync-indicator');

  let activeCatalog = [...window.musicData]; // fallback to static catalog data

  // Helper to fetch with a timeout
  async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 10000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(resource, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  // Sequentially attempt to fetch and parse Bandcamp page using multiple CORS proxies
  async function scrapeBandcamp() {
    const bandcampPage = 'https://jjjb.bandcamp.com/music';
    const proxyList = [
      {
        url: 'https://api.allorigins.win/get?url=' + encodeURIComponent(bandcampPage),
        type: 'json'
      },
      {
        url: 'https://corsproxy.io/?url=' + encodeURIComponent(bandcampPage),
        type: 'text'
      }
    ];

    for (const proxy of proxyList) {
      try {
        console.log(`Attempting Bandcamp sync via: ${proxy.url}`);
        const response = await fetchWithTimeout(proxy.url, { timeout: 10000 });
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        
        let htmlContent = '';
        if (proxy.type === 'json') {
          const json = await response.json();
          htmlContent = json.contents;
        } else {
          htmlContent = await response.text();
        }

        if (!htmlContent) throw new Error('Empty response');

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const gridItems = doc.querySelectorAll('ol#music-grid li.music-grid-item');

        if (!gridItems.length) throw new Error('No items found in Bandcamp HTML');

        const scrapedAlbums = [];
        gridItems.forEach(item => {
          const item_id = item.getAttribute('data-item-id') || '';
          const rawId = item_id.replace('album-', '');
          const link = item.querySelector('a')?.getAttribute('href') || '';
          const title = item.querySelector('p.title')?.textContent.trim() || '';
          const thumbImg = item.querySelector('img')?.getAttribute('src') || '';

          // Scale thumbnail to high-res format
          const coverImg = thumbImg.replace('_2.jpg', '_10.jpg');
          const bandcampUrl = 'https://jjjb.bandcamp.com' + link;

          // Try mapping details to local catalog to keep descriptions, tracks, and years
          const matchedLocal = window.musicData.find(album => album.title.toLowerCase() === title.toLowerCase());

          scrapedAlbums.push({
            id: rawId,
            title: title,
            year: matchedLocal ? matchedLocal.year : '2025',
            genre: matchedLocal ? matchedLocal.genre : 'Ambient / Electronic',
            description: matchedLocal ? matchedLocal.description : 'Explore JJJ_B tracks dynamically synced directly from Bandcamp.',
            bandcampUrl: bandcampUrl,
            coverUrl: coverImg,
            spotifyUrl: matchedLocal ? matchedLocal.spotifyUrl : 'https://open.spotify.com/artist/3KeabuK2JtljSMRhYlcVBc',
            appleMusicUrl: matchedLocal ? matchedLocal.appleMusicUrl : 'https://music.apple.com/us/artist/jjj-b/1586552449',
            tracks: matchedLocal ? matchedLocal.tracks : ['Explore track details on Bandcamp']
          });
        });

        if (scrapedAlbums.length > 0) {
          return scrapedAlbums;
        }
      } catch (err) {
        console.warn(`Proxy scrape attempt failed for ${proxy.url}:`, err);
      }
    }
    throw new Error('All CORS proxies failed or returned empty content.');
  }

  // Execute sync
  scrapeBandcamp()
    .then(scrapedAlbums => {
      activeCatalog = scrapedAlbums;
      if (syncBanner) {
        syncBanner.innerHTML = '🟢 Synced with Bandcamp';
        syncBanner.classList.remove('fallback');
        syncBanner.classList.add('synced');
      }
      renderLayouts(activeCatalog);
    })
    .catch(err => {
      console.warn('Bandcamp sync failed. Using local database fallback. Error details:', err);
      if (syncBanner) {
        syncBanner.innerHTML = '🟡 Loaded Local Database (Offline)';
        syncBanner.classList.remove('synced');
        syncBanner.classList.add('fallback');
      }
      renderLayouts(activeCatalog);
    });

  // Render layouts once catalog is ready
  function renderLayouts(catalog) {
    // 1. RENDER HOMEPAGE SELECTORS ROW
    if (consoleSelectorsList) {
      consoleSelectorsList.innerHTML = '';
      catalog.forEach((album, idx) => {
        const btn = document.createElement('button');
        btn.className = `album-select-btn ${idx === 0 ? 'active' : ''}`;
        btn.setAttribute('data-id', album.id);
        btn.setAttribute('aria-label', `Select album ${album.title}`);
        btn.innerHTML = `
          <div class="select-artwork-box">
            <img src="${fixImagePath(album.coverUrl)}" alt="${album.title} Cover">
          </div>
          <span class="select-title-label">${album.title}</span>
        `;
        btn.addEventListener('click', () => {
          document.querySelectorAll('.album-select-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          loadAlbumIntoConsole(album);
        });
        consoleSelectorsList.appendChild(btn);
      });

      // Load initial album details
      loadAlbumIntoConsole(catalog[0]);
    }

    // 2. RENDER MUSIC PAGE CATALOG GRID
    if (catalogGrid) {
      catalogGrid.innerHTML = '';
      catalog.forEach((album) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'music-card-wrapper fade-in';
        wrapper.innerHTML = `
          <div class="catalog-deck-box">
            <div class="vinyl-sleeve">
              <img src="${fixImagePath(album.coverUrl)}" alt="${album.title} Cover" class="active-album-cover">
            </div>
            <div class="vinyl-record">
              <div class="vinyl-label" style="background-image: url('${fixImagePath(album.coverUrl)}');"></div>
            </div>
          </div>
          <div class="music-card-details">
            <span class="catalog-genre">${album.genre}</span>
            <h3 class="catalog-card-title">${album.title}</h3>
            <span class="catalog-card-meta">${album.year} • ${album.tracks.length} tracks</span>
          </div>
        `;
        wrapper.addEventListener('click', () => {
          // If spotlight widget is on music page, load selected album into it!
          const spotlightTitle = document.getElementById('spotlight-title');
          if (spotlightTitle) {
            loadAlbumIntoSpotlight(album);
            const spotlightDeck = document.getElementById('spotlight-deck');
            if (spotlightDeck) {
              spotlightDeck.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        });
        catalogGrid.appendChild(wrapper);
      });
      initScrollReveal(); // Trigger reveals for newly created cards
    }

    // 3. INITIALIZE SPOTLIGHT PLAYER IF PRESENT
    if (document.getElementById('spotlight-title')) {
      loadAlbumIntoSpotlight(catalog[0]);
    }
  }

  // ===== LOAD ALBUM INTO HOMEPAGE CONSOLE =====
  function loadAlbumIntoConsole(album) {
    const cover = document.getElementById('console-cover');
    const vinylLabel = document.getElementById('console-vinyl-label');
    const title = document.getElementById('console-title');
    const genre = document.getElementById('console-genre');
    const year = document.getElementById('console-year');
    const consoleConsole = document.getElementById('player-console');

    // Embed links
    const bcIframe = document.getElementById('bc-iframe');
    const linkSpotify = document.getElementById('link-spotify');
    const linkBandcamp = document.getElementById('link-bandcamp');
    const linkApple = document.getElementById('link-apple');

    if (cover) cover.src = fixImagePath(album.coverUrl);
    if (vinylLabel) vinylLabel.style.backgroundImage = `url('${fixImagePath(album.coverUrl)}')`;
    if (title) title.textContent = album.title;
    if (genre) genre.textContent = album.genre;
    if (year) year.textContent = album.year;

    // Load active Bandcamp embed
    if (bcIframe) {
      bcIframe.src = `https://bandcamp.com/EmbeddedPlayer/album=${album.id}/size=large/bgcol=faf9f6/linkcol=a855f7/tracklist=true/artwork=none/transparent=true/`;
    }

    // Set streaming destination links
    if (linkSpotify) linkSpotify.href = album.spotifyUrl;
    if (linkBandcamp) linkBandcamp.href = album.bandcampUrl;
    if (linkApple) linkApple.href = album.appleMusicUrl;

    // Trigger spinning record
    if (consoleConsole) {
      consoleConsole.classList.add('playing');
    }

    // Start CRT screen visualizer animation
    startScreenVisualizer();
  }

  // ===== LOAD ALBUM INTO MUSIC PAGE SPOTLIGHT =====
  function loadAlbumIntoSpotlight(album) {
    const cover = document.getElementById('spotlight-cover');
    const vinylLabel = document.getElementById('spotlight-vinyl-label');
    const title = document.getElementById('spotlight-title');
    const genre = document.getElementById('spotlight-genre');
    const year = document.getElementById('spotlight-year');
    const desc = document.getElementById('spotlight-desc');
    const bcIframe = document.getElementById('spotlight-bc-iframe');
    const spotlightDeck = document.getElementById('spotlight-deck');

    if (cover) cover.src = fixImagePath(album.coverUrl);
    if (vinylLabel) vinylLabel.style.backgroundImage = `url('${fixImagePath(album.coverUrl)}')`;
    if (title) title.textContent = album.title;
    if (genre) genre.textContent = album.genre;
    if (year) year.textContent = album.year;
    if (desc) desc.textContent = album.description;

    if (bcIframe) {
      bcIframe.src = `https://bandcamp.com/EmbeddedPlayer/album=${album.id}/size=large/bgcol=faf9f6/linkcol=a855f7/tracklist=true/artwork=none/transparent=true/`;
    }

    if (spotlightDeck) {
      spotlightDeck.classList.add('playing');
    }
  }

  // ===== PLAYER TAB DECK SWITCHERS =====
  // 1. Home page player tabs
  const tabBandcamp = document.getElementById('tab-bandcamp');
  const tabSpotify = document.getElementById('tab-spotify');
  const bcWrapper = document.getElementById('bandcamp-embed-wrapper');
  const spotWrapper = document.getElementById('spotify-embed-wrapper');

  if (tabBandcamp && tabSpotify) {
    tabBandcamp.addEventListener('click', () => {
      tabBandcamp.classList.add('active');
      tabSpotify.classList.remove('active');
      bcWrapper.classList.add('active');
      spotWrapper.classList.remove('active');
    });

    tabSpotify.addEventListener('click', () => {
      tabSpotify.classList.add('active');
      tabBandcamp.classList.remove('active');
      spotWrapper.classList.add('active');
      bcWrapper.classList.remove('active');
    });
  }

  // 2. Music page spotlight tabs
  const spotlightTabBc = document.getElementById('spotlight-tab-bc');
  const spotlightTabSpot = document.getElementById('spotlight-tab-spot');
  const spotlightBcWrapper = document.getElementById('spotlight-bc-wrapper');
  const spotlightSpotWrapper = document.getElementById('spotlight-spot-wrapper');

  if (spotlightTabBc && spotlightTabSpot) {
    spotlightTabBc.addEventListener('click', () => {
      spotlightTabBc.classList.add('active');
      spotlightTabSpot.classList.remove('active');
      spotlightBcWrapper.classList.add('active');
      spotlightSpotWrapper.classList.remove('active');
    });

    spotlightTabSpot.addEventListener('click', () => {
      spotlightTabSpot.classList.add('active');
      spotlightTabBc.classList.remove('active');
      spotlightSpotWrapper.classList.add('active');
      spotlightBcWrapper.classList.remove('active');
    });
  }
}

// ===== CRT SCREEN EQUALIZER WAVEFORM =====
let visualizerInterval = null;
function startScreenVisualizer() {
  const canvas = document.getElementById('console-visualizer-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const vuLeds = document.querySelectorAll('.vu-led');
  
  // Set dimensions
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  if (visualizerInterval) {
    cancelAnimationFrame(visualizerInterval);
  }

  const barsCount = 28;
  const bars = Array.from({ length: barsCount }, () => ({
    targetHeight: Math.random() * canvas.height,
    currentHeight: 0,
    speed: 0.1 + Math.random() * 0.15
  }));

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Read Compressor knob dial multiplier from high-performance JS state
    const scaleFactor = 0.4 + (knobState.compressor * 1.3);

    const barWidth = canvas.width / barsCount;
    let totalHeight = 0;

    for (let i = 0; i < barsCount; i++) {
      const bar = bars[i];
      
      // Interpolate sizes
      if (Math.abs(bar.currentHeight - bar.targetHeight) < 2) {
        bar.targetHeight = Math.random() * canvas.height * scaleFactor;
      }
      bar.currentHeight += (bar.targetHeight - bar.currentHeight) * bar.speed;
      totalHeight += bar.currentHeight;

      // Draw active green visualizer bar
      ctx.fillStyle = '#10B981';
      ctx.fillRect(
        i * barWidth + 1, 
        canvas.height - bar.currentHeight, 
        barWidth - 2, 
        bar.currentHeight
      );
    }

    // Animate physical VU meter LEDs
    const avgHeight = totalHeight / barsCount;
    const heightPercent = avgHeight / canvas.height;
    // Map to active levels (0 to 6)
    const activeLevel = Math.min(6, Math.floor(heightPercent * 10));

    vuLeds.forEach(led => {
      const level = parseInt(led.getAttribute('data-level') || '1');
      if (level <= activeLevel) {
        led.classList.add('active');
      } else {
        led.classList.remove('active');
      }
    });

    visualizerInterval = requestAnimationFrame(animate);
  }

  animate();
}

// ===== CONTACT FORM PATCH-BAY LINK =====
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject') || 'General Inquiry';
    const message = formData.get('message');

    // Build the mailto scheme
    const mailtoSubject = `[JJJ_B Website Inquiry] ${subject}`;
    const mailtoBody = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    const mailtoLink = `mailto:contact@azhang.eu.org?subject=${encodeURIComponent(mailtoSubject)}&body=${encodeURIComponent(mailtoBody)}`;

    // Set dynamic status notice
    let statusDiv = document.getElementById('form-status');
    if (!statusDiv) {
      statusDiv = document.createElement('div');
      statusDiv.id = 'form-status';
      form.appendChild(statusDiv);
    }
    statusDiv.style.display = 'block';

    try {
      window.location.href = mailtoLink;
      statusDiv.textContent = '✅ Message compiled! Opening your email client...';
      statusDiv.className = 'form-status success';
      form.reset();
    } catch (err) {
      statusDiv.textContent = '❌ Failed to open email client. Please send mail manually to: contact@azhang.eu.org';
      statusDiv.className = 'form-status error';
    }

    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 8000);
  });
}