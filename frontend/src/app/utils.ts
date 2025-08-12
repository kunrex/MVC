export const serverAddress = 'https://localhost:3000';

const cookies = document.cookie.split('; ').map(c => c.split('='));

export function between(value: number, min: number, max: number) {
  return value >= min && max >= value;
}

export function getCookie(name: string) : string | null {
  for (const [key, value] of cookies)
    if (key === name)
      return decodeURIComponent(value);

  return null;
}
