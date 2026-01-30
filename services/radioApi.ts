/**
 * Radio Browser API client. Fetches stations, search, tags, countries, languages.
 * Uses apiClient for HTTP; responses are mapped to internal Station type.
 */

import { API_TIMEOUT_MS, RADIO_BROWSER_BASE } from '../constants';
import type { RadioBrowserStationRaw, Station } from '../types/radio';
import { mapApiStationToStation } from '../types/radio';
import { createApiClient } from './apiClient';

const radioClient = createApiClient({
  baseUrl: RADIO_BROWSER_BASE,
  timeoutMs: API_TIMEOUT_MS,
  headers: { 'User-Agent': 'Airwave/1.0' },
});

export interface SearchParams {
  name?: string;
  country?: string;
  tag?: string;
  language?: string;
  limit?: number;
  offset?: number;
}

export const radioApi = {
  async getStationById(uuid: string): Promise<Station | null> {
    try {
      const data = await radioClient.get<RadioBrowserStationRaw[]>(`/stations/byuuid/${uuid}`);
      const list = Array.isArray(data) ? data : [];
      return list.length > 0 ? mapApiStationToStation(list[0]) : null;
    } catch {
      return null;
    }
  },

  async getTopClicked(limit = 20): Promise<Station[]> {
    const data = await radioClient.get<RadioBrowserStationRaw[]>('/stations/topclick', { limit });
    return (Array.isArray(data) ? data : []).map(mapApiStationToStation);
  },

  async getTopVotes(limit = 20): Promise<Station[]> {
    const data = await radioClient.get<RadioBrowserStationRaw[]>('/stations/topvote', { limit });
    return (Array.isArray(data) ? data : []).map(mapApiStationToStation);
  },

  async search(params: SearchParams): Promise<Station[]> {
    const { name, country, tag, language, limit = 30, offset = 0 } = params;
    if (name?.trim()) {
      const data = await radioClient.get<RadioBrowserStationRaw[]>('/stations/search', {
        name: name.trim(),
        limit,
        offset,
      });
      return (Array.isArray(data) ? data : []).map(mapApiStationToStation);
    }
    if (country) {
      const data = await radioClient.get<RadioBrowserStationRaw[]>(
        `/stations/bycountry/${encodeURIComponent(country)}`,
        { limit, offset }
      );
      return (Array.isArray(data) ? data : []).map(mapApiStationToStation);
    }
    if (tag) {
      const data = await radioClient.get<RadioBrowserStationRaw[]>(
        `/stations/bytag/${encodeURIComponent(tag)}`,
        { limit, offset }
      );
      return (Array.isArray(data) ? data : []).map(mapApiStationToStation);
    }
    if (language) {
      const data = await radioClient.get<RadioBrowserStationRaw[]>(
        `/stations/bylanguage/${encodeURIComponent(language)}`,
        { limit, offset }
      );
      return (Array.isArray(data) ? data : []).map(mapApiStationToStation);
    }
    return [];
  },

  async getTags(limit = 100): Promise<string[]> {
    const data = await radioClient.get<{ name: string }[]>('/tags', {
      limit,
      order: 'stationcount',
      reverse: 'true',
    });
    return Array.isArray(data) ? data.map((t) => t.name) : [];
  },

  async getCountries(limit = 250): Promise<{ name: string; code: string }[]> {
    const data = await radioClient.get<{ name: string; stationcount: number }[]>('/countries', {
      limit,
      order: 'stationcount',
      reverse: 'true',
    });
    return Array.isArray(data)
      ? data.map((c) => ({ name: c.name, code: c.name }))
      : [];
  },

  async getLanguages(limit = 100): Promise<string[]> {
    const data = await radioClient.get<{ name: string }[]>('/languages', {
      limit,
      order: 'stationcount',
      reverse: 'true',
    });
    return Array.isArray(data) ? data.map((l) => l.name) : [];
  },
};
