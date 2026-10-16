const navigation = document.querySelector('nav.links[aria-label="Portfolio navigation"]');

if (navigation) {
  fetch('/api/admin-navigation', { cache: 'no-store', credentials: 'same-origin' })
    .then((response) => {
      if (response.status !== 204) return;

      const link = document.createElement('a');
      link.className = 'nav-contact';
      link.href = '/admin/';
      link.textContent = 'Admin';
      navigation.append(link);
    })
    .catch(() => {});
}
