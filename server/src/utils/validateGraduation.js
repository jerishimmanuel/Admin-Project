export function isGraduated({ startYear, passOutYear, courseDurationYears }) {
  const now = new Date().getFullYear();
  if (passOutYear) return Number(passOutYear) <= now;
  if (startYear && courseDurationYears) return Number(startYear) + Number(courseDurationYears) <= now;
  return false;
}
