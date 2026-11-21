
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
}

// Slideshow
const slides = [...document.querySelectorAll('.slide')];

if (slides.length) {
  let current = 0;
  let paused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const counter = document.querySelector('.slide-counter');
  const pause = document.querySelector('.slide-pause');

  function show(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === current);
    });

    if (counter) {
      counter.textContent =
        String(current + 1).padStart(2, '0') +
        ' / ' +
        String(slides.length);
    }
  }

  document.querySelector('.slide-next')?.addEventListener('click', () => {
    show(current + 1);
  });

  document.querySelector('.slide-prev')?.addEventListener('click', () => {
    show(current - 1);
  });

  if (pause) {
    pause.addEventListener('click', () => {
      paused = !paused;
      pause.textContent = paused ? '▶' : 'Ⅱ';
      pause.setAttribute(
        'aria-label',
        paused ? 'Slideshow starten' : 'Slideshow pausieren'
      );
    });

    if (paused) pause.textContent = '▶';
  }

  setInterval(() => {
    if (!paused) show(current + 1);
  }, 6000);
}

// Shows
const eventsRoot = document.querySelector('#event-list');

if (eventsRoot) {
  const fmt = new Intl.DateTimeFormat('de-CH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  });

  async function loadShows() {
    try {
      const response = await fetch('shows.json');

      if (!response.ok) {
        throw new Error('Shows konnten nicht geladen werden');
      }

      const data = await response.json();

      if (!Array.isArray(data.events)) {
        throw new Error('Ungültiges Shows-Format');
      }

      const today = new Date();
      const localDate =
        today.getFullYear() + '-' +
        String(today.getMonth() + 1).padStart(2, '0') + '-' +
        String(today.getDate()).padStart(2, '0');

      const items = data.events
        .filter(event => event.date >= localDate)
        .sort((a, b) => a.date.localeCompare(b.date));

      eventsRoot.replaceChildren();

      if (!items.length) {
        eventsRoot.textContent = 'Neue Termine folgen bald.';
        return;
      }

      items.forEach(event => {
        const item = document.createElement('article');
        item.className = 'event-item';

        const date = document.createElement('time');
        date.dateTime = event.date;
        date.textContent = fmt.format(
          new Date(event.date + 'T12:00:00Z')
        );

        const content = document.createElement('div');

        const title = document.createElement('h2');
        title.textContent = event.title;

        const location = document.createElement('p');
        location.textContent = [event.venue, event.city]
          .filter(Boolean)
          .join(' · ');

        content.append(title, location);
        item.append(date, content);

        if (event.url) {
          const link = document.createElement('a');
          link.href = event.url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.className = 'event-link';
          link.textContent = 'INFOS / TICKETS ↗';
          item.append(link);
        }

        eventsRoot.append(item);
      });
    } catch (error) {
      console.error(error);
      eventsRoot.textContent =
        'Die Shows konnten gerade nicht geladen werden.';
    }
  }

  loadShows();
}
