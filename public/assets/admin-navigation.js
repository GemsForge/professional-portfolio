const navigation = document.querySelector('footer.footer nav[aria-label="Footer navigation"]');

if (navigation) {
  fetch('/api/admin-navigation', { cache: 'no-store', credentials: 'same-origin' })
    .then((response) => {
      if (response.status !== 204) return;

      const link = document.createElement('a');
      link.className = 'button secondary';
      link.href = '/admin/';
      link.textContent = 'Admin';
      navigation.append(link);
    })
    .catch(() => {});
}
