// Fetch API same-origin shorthand to easily enable session cookies
// Sets credentials: to default to 'same-origin' (but overridable)
export function fetch(url, settings) {
  settings = settings || {};
  settings.credentials = settings.credentials || 'same-origin';

  return fetch(url, settings);
}
