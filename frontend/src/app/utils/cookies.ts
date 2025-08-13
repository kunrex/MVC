const cookies = document.cookie.split('; ').map(c => c.split('='));

export function getCookie(name: string) : string | null {
  for (const [key, value] of cookies)
    if (key === name)
      return decodeURIComponent(value);

  return null;
}
