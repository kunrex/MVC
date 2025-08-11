export const serverAddress = 'https://localhost:3000';

export function between(value: number, min: number, max: number) : boolean {
  return value >= min && value <= max;
}

const cookies = document.cookie.split('; ').map(c => c.split('='));

export function getCookie(name: string) : string | null {
  for (const [key, value] of cookies)
    if (key === name)
      return decodeURIComponent(value);

  return null;
}
