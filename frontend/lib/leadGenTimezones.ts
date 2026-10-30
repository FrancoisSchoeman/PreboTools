export const LEAD_GEN_TIMEZONES: { value: string; label: string }[] = [
  { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg (SAST)' },
  { value: 'America/New_York', label: 'America/New_York (Eastern)' },
  { value: 'America/Chicago', label: 'America/Chicago (Central)' },
  { value: 'America/Denver', label: 'America/Denver (Mountain)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (Pacific)' },
  { value: 'America/Phoenix', label: 'America/Phoenix (Arizona)' },
  { value: 'America/Toronto', label: 'America/Toronto' },
  { value: 'America/Vancouver', label: 'America/Vancouver' },
  { value: 'America/Edmonton', label: 'America/Edmonton' },
  { value: 'America/Winnipeg', label: 'America/Winnipeg' },
  { value: 'America/Halifax', label: 'America/Halifax' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/London', label: 'Europe/London' },
];

export const LEAD_GEN_COUNTRY_CODES: { value: string; label: string }[] = [
  { value: 'ZA', label: 'South Africa (ZA)' },
  { value: 'US', label: 'United States (US)' },
  { value: 'CA', label: 'Canada (CA)' },
];

/** Options for a timezone select, keeping a custom current value if not in the list. */
export function timezoneSelectOptions(current?: string | null) {
  const options = [...LEAD_GEN_TIMEZONES];
  if (current && !options.some((o) => o.value === current)) {
    options.unshift({ value: current, label: `${current} (current)` });
  }
  return options;
}
