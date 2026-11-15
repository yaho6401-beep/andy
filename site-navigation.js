(function () {
  'use strict';

  const pages = [...document.querySelectorAll('[data-site-page]')];
  const navigation = document.querySelector('.site-navigation');
  const links = [...navigation.querySelectorAll('a[href^="#"]')];
  const communityLinks = [...document.querySelectorAll('.community-shortcuts a')];
  const lobby = document.querySelector('.community-lobby');
  const journeys = ['story', 'profile', 'selection'];
  const communitySections = ['gallery', 'feedback'];
  const destinations = new Set([...pages.map(page => page.id), ...journeys, ...communitySections]);

  function render(destination) {
    const isJourney = journeys.includes(destination);
    const isCommunitySection = communitySections.includes(destination);
    const pageId = isJourney ? 'make' : isCommunitySection ? 'community' : destination;

    for (const page of pages) page.hidden = page.id !== pageId;
    for (const link of links) {
      if (link.hash === '#' + (['studio', 'visit'].includes(pageId) ? 'home' : pageId)) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }

    lobby.hidden = isCommunitySection;
    for (const id of communitySections) {
      document.getElementById(id).hidden = id !== destination;
    }
    for (const link of communityLinks) {
      if (link.hash === '#' + destination) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }

    if (isJourney && globalThis.ScentJourney.active !== destination) {
      globalThis.ScentJourney.show(destination, { scroll: false });
    }
  }

  function renderLocation() {
    const hash = location.hash.slice(1);
    const hasSharedBlend = new URLSearchParams(location.search).has('main');
    render(destinations.has(hash) ? hash : hasSharedBlend ? 'make' : 'home');
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey ||
      event.ctrlKey || event.altKey || event.shiftKey) return;

    const destination = link.hash.slice(1);
    if (!destinations.has(destination)) return;
    event.preventDefault();

    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    render(destination);
    window.scrollTo({ top: 0, behavior: 'instant' });

    document.getElementById(destination + '-title')?.focus({ preventScroll: true });
  });

  window.addEventListener('hashchange', renderLocation);
  renderLocation();
})();
