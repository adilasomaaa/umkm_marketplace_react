export function parseDate(date: string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function parseDateTime(date: string) {
  return new Date(date).toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function parseTime(date: string) {
  return new Date(date).toLocaleTimeString("id-ID", {
    hour: "numeric",
    minute: "numeric",
  });
}
