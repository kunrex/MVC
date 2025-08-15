export function between(value: number, min: number, max: number) {
  return value >= min && value <= max;
}

export function timeStampPrettyPrint(timestamp: string) : string {
  const times = timestamp.split(':').map((x: string) => parseInt(x));

  const stamps: string[] = []
  if(times[0] > 0)
    stamps.push(`${times[0]} hours`)
  if(times[1] > 0)
    stamps.push(`${times[1]} minutes`)
  if(times[2] > 0)
    stamps.push(`${times[2]} seconds`)

  return stamps.join(',');
}
