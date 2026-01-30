export interface RadioBrowserStationRaw {
  changeuuid: string;
  stationuuid: string;
  serveruuid: string;
  name: string;
  url: string;
  url_resolved: string;
  homepage: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  state: string;
  language: string;
  languagecodes: string;
  votes: number;
  lastchangetime: string;
  lastchangetime_iso8601: string;
  codec: string;
  bitrate: number;
  hls: number;
  lastcheckok: number;
  lastchecktime: string;
  lastchecktime_iso8601: string;
  lastcheckoktime: string;
  lastcheckfailtime: string;
  lastlocalchecktime: string;
  clicktimestamp: string;
  clickcount: number;
  clicktrend: number;
  ssl_error: number;
  geo_lat: string | null;
  geo_long: string | null;
  has_extended_info: boolean;
}

export interface Station {
  id: string;
  name: string;
  streamUrl: string;
  homepage: string;
  favicon: string;
  tags: string[];
  country: string;
  countryCode: string;
  state: string;
  language: string;
  votes: number;
  clickCount: number;
  codec: string;
  bitrate: number;
  lastCheckOk: boolean;
}

export const mapApiStationToStation = (raw: RadioBrowserStationRaw): Station => ({
  id: raw.stationuuid,
  name: raw.name,
  streamUrl: raw.url_resolved || raw.url,
  homepage: raw.homepage || '',
  favicon: raw.favicon && raw.favicon.trim() !== '' ? raw.favicon : '',
  tags: raw.tags ? raw.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
  country: raw.country || '',
  countryCode: raw.countrycode || '',
  state: raw.state || '',
  language: raw.language || '',
  votes: raw.votes ?? 0,
  clickCount: raw.clickcount ?? 0,
  codec: raw.codec || '',
  bitrate: raw.bitrate ?? 0,
  lastCheckOk: raw.lastcheckok === 1,
});

export const FALLBACK_ARTWORK =
  'https://api.radio-browser.info/api/v2/assets/station/placeholder.png';
