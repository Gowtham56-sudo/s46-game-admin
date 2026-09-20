export const getApiBase = (): string => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('s46_api_base');
    if (custom && custom.trim() && !custom.includes('duckdns.org')) {
      return custom.trim().replace(/\/+$/, '');
    }
  }
  return (
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_API_URL ||
    'https://s46-games-event.onrender.com'
  ).replace(/\/+$/, '');
};

export const setApiBase = (url: string): void => {
  if (typeof window !== 'undefined') {
    const clean = url.trim().replace(/\/+$/, '');
    localStorage.setItem('s46_api_base', clean);
    window.location.reload();
  }
};

export const resetApiBase = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('s46_api_base');
    window.location.reload();
  }
};

export let API_BASE = getApiBase();
