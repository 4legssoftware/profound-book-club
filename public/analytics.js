(function () {
  if (location.hostname !== 'profound-book-club.org') {
    return;
  }

  const script = document.createElement('script');
  script.defer = true;
  script.src = 'https://cloud.umami.is/script.js';
  script.dataset.websiteId = '637b201e-31d8-4a12-9e9d-1f6c64e0a1c2';
  script.dataset.domains = 'profound-book-club.org';
  document.head.appendChild(script);
})();
