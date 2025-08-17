export function pad(n: number) : string {
  return String(n).padStart(2, '0');
}

export function toLocalTime(dateTimeUTC: string) : string {
  const date =  new Date((dateTimeUTC + 'Z').replace(' ', 'T'));
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function timeStampPrettyPrint(timestamp: string) : string {
  const times = timestamp.split(':').map((x: string) => parseInt(x));

  const stamps: string[] = []
  if(times[0] > 0)
    stamps.push(`${pad(times[0])} hours`)
  if(times[1] > 0)
    stamps.push(`${pad(times[1])} minutes`)
  if(times[2] > 0)
    stamps.push(`${pad(times[2])} seconds`)

  return stamps.join(',');
}
