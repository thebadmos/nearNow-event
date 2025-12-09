/**
 * PredictHQ API Service
 * 
 * PredictHQ provides comprehensive event data including local community events,
 * concerts, sports, conferences, and more. Perfect for local event discovery!
 * 
 * API Documentation: https://docs.predicthq.com/
 * Get API Token: https://www.predicthq.com/
 */

import { Event, EventFilters } from "@/types/event";

// PredictHQ API Configuration
// Get API base URL and token from environment variables
const PREDICTHQ_API_BASE = process.env.NEXT_PUBLIC_PREDICTHQ_API_BASE;
const PREDICTHQ_API_TOKEN = process.env.NEXT_PUBLIC_PREDICTHQ_API_TOKEN || "";

// Validate that token and base URL are set
if (!PREDICTHQ_API_TOKEN) {
  console.warn(
    "WARNING: PREDICTHQ_API_TOKEN is not set. Please add NEXT_PUBLIC_PREDICTHQ_API_TOKEN to your .env.local file."
  );
}

if (!PREDICTHQ_API_BASE) {
  console.warn(
    "WARNING: PREDICTHQ_API_BASE is not set. Please add NEXT_PUBLIC_PREDICTHQ_API_BASE to your .env.local file."
  );
}

/**
 * PredictHQ API Event Structure
 */
interface PredictHQEvent {
  id: string;
  title: string;
  description?: string;
  category: string;
  labels: string[];
  start: string; // ISO 8601 format
  end?: string; // ISO 8601 format
  timezone: string;
  duration: number; // in seconds
  location: Array<{
    location: {
      lat: number;
      lon: number;
    };
    address?: {
      name?: string;
      street?: string;
      locality?: string;
      region?: string;
      country?: string;
    };
  }>;
  entities?: Array<{
    entity_id?: string;
    name: string;
    type: string;
    formatted_address?: string;
    url?: string;
    website?: string;
  }>;
  url?: string;
  website?: string;
  ticket_url?: string;
  external_url?: string;
  phq_attendance?: number;
  phq_rank?: number;
  phq_viewing_rank?: number;
  phq_popularity?: number;
  phq_impact_rank?: number;
  phq_rankings?: {
    phq_attendance?: number;
    phq_rank?: number;
    phq_viewing_rank?: number;
    phq_popularity?: number;
    phq_impact_rank?: number;
  };
  state: string;
  private: boolean;
  scope?: string;
  country?: string;
  geo?: {
    geometry: {
      coordinates: [number, number]; // [longitude, latitude]
      type: string;
    };
  };
  relevance?: number;
  local_rank?: number;
  aviation_rank?: number;
  phq_labels?: string[];
  predicted_event_spend?: number;
  predicted_event_spend_industries?: Record<string, number>;
  predicted_dwell?: number;
  predicted_dwell_industries?: Record<string, number>;
  phq_publishing_state?: string;
  phq_created_at?: string;
  phq_updated_at?: string;
  phq_id?: string;
}

/**
 * PredictHQ API Response
 */
interface PredictHQResponse {
  count: number;
  next?: string;
  previous?: string;
  results: PredictHQEvent[];
}

/**
 * Geocoding result from Nominatim API
 */
interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  class?: string;
  importance: number;
  address?: {
    country?: string;
    country_code?: string;
  };
}

/**
 * Geocode a city or country name to coordinates
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 * 
 * @param location - City or country name (e.g., "Lagos", "Nigeria")
 * @returns Promise with coordinates or null if geocoding fails
 */
async function geocodeLocation(location: string): Promise<{ lat: number; lon: number; isCountry: boolean } | null> {
  try {
    // Use Nominatim API for geocoding (free, no API key required)
    const encodedLocation = encodeURIComponent(location);
    let response: Response;
    
    try {
      response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodedLocation}&format=json&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'EventManagementApp/1.0', // Required by Nominatim
          },
          mode: 'cors',
        }
      );
    } catch (error: any) {
      // Handle network errors (CORS, network failure, etc.)
      console.warn(`Geocoding network error for "${location}":`, error.message);
      return null;
    }

    if (!response.ok) {
      console.warn(`Geocoding failed for "${location}": ${response.statusText}`);
      return null;
    }

    const results: GeocodingResult[] = await response.json();

    if (!results || results.length === 0) {
      console.warn(`No geocoding results found for "${location}"`);
      return null;
    }

    const result = results[0];
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    if (isNaN(lat) || isNaN(lon)) {
      console.warn(`Invalid coordinates from geocoding for "${location}"`);
      return null;
    }

    // Check if it's a country
    // Nominatim returns class="place" and type="country" for countries
    // Also check if the location name matches common country patterns
    const locationLower = location.toLowerCase();
    const isCountry = Boolean(
      (result.class === "place" && result.type === "country") ||
      result.type === "country" ||
      (result.importance < 0.3 && !result.type.includes("city") && !result.type.includes("town")) ||
      locationLower.includes("nigeria") ||
      locationLower.includes("country") ||
      (result.address?.country_code && result.address.country && locationLower.includes(result.address.country.toLowerCase()))
    );

    return { lat, lon, isCountry };
  } catch (error) {
    console.error(`Error geocoding location "${location}":`, error);
    return null;
  }
}

/**
 * Convert PredictHQ event to our simplified Event format
 */
function transformEvent(predicthqEvent: PredictHQEvent): Event {
  const location = predicthqEvent.location?.[0];
  const address = location?.address;
  
  // Get geo coordinates from location or geo field
  let geo: { lat: number; lon: number } | undefined = location?.location;
  if (!geo && predicthqEvent.geo?.geometry?.coordinates) {
    geo = {
      lat: predicthqEvent.geo.geometry.coordinates[1],
      lon: predicthqEvent.geo.geometry.coordinates[0],
    };
  }

  // Find venue entity with formatted_address (most reliable source)
  const venueEntity = predicthqEvent.entities?.find(
    (e) => e.type === "venue"
  );
  
  // Also check other entity types for formatted_address
  const entityWithAddress = predicthqEvent.entities?.find(
    (e) => e.formatted_address
  ) || venueEntity;
  
  // Get venue name from entity or address
  const venueName = venueEntity?.name || entityWithAddress?.name || address?.name || "Event Venue";
  
  // Build address string - prefer formatted_address from entity, then build from parts
  let addressString = entityWithAddress?.formatted_address || venueEntity?.formatted_address;
  
  if (!addressString) {
    // Try to build address from available parts
    const addressParts = [
      address?.street,
      address?.locality,
      address?.region,
      address?.country || predicthqEvent.country, // Use top-level country if address country is missing
    ].filter(Boolean);
    
    if (addressParts.length > 0) {
      addressString = addressParts.join(", ");
    } else if (address?.name && address.name !== venueName) {
      // Use address name if it's different from venue name
      addressString = address.name;
    } else if (predicthqEvent.country) {
      // At minimum, show the country
      addressString = predicthqEvent.country;
    } else if (geo) {
      // If we have coordinates, show a basic location indicator
      addressString = `${geo.lat.toFixed(4)}, ${geo.lon.toFixed(4)}`;
    } else {
      // Last resort: use a generic message
      addressString = "Location available";
    }
  }
  
  // Extract city from formatted_address or use locality
  let city = address?.locality;
  if (!city && venueEntity?.formatted_address) {
    // Try to extract city from formatted address (usually second-to-last part before country)
    const parts = venueEntity.formatted_address.split(",").map(p => p.trim());
    if (parts.length >= 2) {
      city = parts[parts.length - 2]; // Usually city is second-to-last
    }
  }

  // Try to find external URL from PredictHQ API
  // Check in order: ticket_url, external_url, url, website, or entity URLs
  let eventUrl: string | undefined = undefined;
  
  if (predicthqEvent.ticket_url) {
    eventUrl = predicthqEvent.ticket_url;
  } else if (predicthqEvent.external_url) {
    eventUrl = predicthqEvent.external_url;
  } else if (predicthqEvent.url) {
    eventUrl = predicthqEvent.url;
  } else if (predicthqEvent.website) {
    eventUrl = predicthqEvent.website;
  } else if (predicthqEvent.entities) {
    // Check entities for URLs (venue, organizer, etc.)
    const entityWithUrl = predicthqEvent.entities.find(
      (e) => e.url || e.website
    );
    if (entityWithUrl) {
      eventUrl = entityWithUrl.url || entityWithUrl.website;
    }
  }
  
  // If no external URL found, generate a Google search URL for tickets
  // This helps users find tickets even when PredictHQ doesn't provide a direct link
  if (!eventUrl) {
    const searchQuery = encodeURIComponent(`${predicthqEvent.title} tickets ${city || address?.locality || ''}`);
    eventUrl = `https://www.google.com/search?q=${searchQuery}`;
  }

  return {
    id: predicthqEvent.id,
    name: predicthqEvent.title,
    description: predicthqEvent.description || "",
    startDate: predicthqEvent.start,
    endDate: predicthqEvent.end || predicthqEvent.start,
    timezone: predicthqEvent.timezone,
    url: eventUrl,
    // PredictHQ doesn't provide event images directly, but we can use a placeholder or category-based image
    // For now, we'll leave it undefined and the UI will show a nice gradient placeholder
    imageUrl: undefined,
    venue: geo || address || venueEntity
      ? {
          name: venueName,
          address: addressString,
          city: city,
          latitude: geo?.lat,
          longitude: geo?.lon,
        }
      : undefined,
    price: undefined, // PredictHQ doesn't provide pricing info
    category: predicthqEvent.category,
    isOnline: predicthqEvent.private || false,
  };
}

/**
 * Search for events based on filters
 * 
 * @param filters - Search filters (city, date, category, price, etc.)
 * @returns Promise with array of events
 */
export async function searchEvents(filters: EventFilters = {}): Promise<Event[]> {
  // Validate API token and base URL before making request
  if (!PREDICTHQ_API_TOKEN) {
    throw new Error(
      "PredictHQ API token is not configured. Please set NEXT_PUBLIC_PREDICTHQ_API_TOKEN in your .env.local file."
    );
  }

  if (!PREDICTHQ_API_BASE) {
    throw new Error(
      "PredictHQ API base URL is not configured. Please set NEXT_PUBLIC_PREDICTHQ_API_BASE in your .env.local file."
    );
  }

  try {
    // Build query parameters
    const params = new URLSearchParams();
    
    // Add location filters
    let searchLatitude = filters.latitude;
    let searchLongitude = filters.longitude;
    let searchRadius = filters.radius;

    // If we have a city but no coordinates, geocode it first
    if (!searchLatitude && !searchLongitude && filters.city) {
      const geocodeResult = await geocodeLocation(filters.city);
      if (geocodeResult) {
        searchLatitude = geocodeResult.lat;
        searchLongitude = geocodeResult.lon;
        
        // Use larger radius for countries (e.g., Nigeria) and smaller for cities
        // Note: radius is in miles per EventFilters interface
        if (geocodeResult.isCountry) {
          searchRadius = searchRadius || 300; // 300 miles (~480km) for countries
        } else {
          searchRadius = searchRadius || 30; // 30 miles (~48km) for cities
        }
      } else {
        // If geocoding fails, fall back to keyword search
        console.warn(`Geocoding failed for "${filters.city}", falling back to keyword search`);
        params.append("q", filters.city);
      }
    }

    // Use location-based search if we have coordinates
    if (searchLatitude && searchLongitude) {
      // PredictHQ location format: location_around.origin=lat,lon&location_around.radius=XXkm
      params.append("location_around.origin", `${searchLatitude},${searchLongitude}`);
      // Convert radius from miles to km (EventFilters.radius is in miles)
      const radiusKm = searchRadius ? searchRadius * 1.60934 : 50;
      params.append("location_around.radius", `${Math.round(radiusKm)}km`);
    }
    
    // Add date filters
    if (filters.startDate) {
      params.append("start.gte", new Date(filters.startDate).toISOString());
    } else {
      // Default to events starting from now
      params.append("start.gte", new Date().toISOString());
    }
    
    if (filters.endDate) {
      params.append("start.lte", new Date(filters.endDate).toISOString());
    }
    
    // Add search query (keyword search)
    if (filters.query) {
      params.append("q", filters.query);
    }
    
    // Add category filter
    if (filters.category) {
      // PredictHQ categories: concerts, sports, conferences, community, performing-arts, etc.
      params.append("category", filters.category);
    }
    
    // Only show public events
    params.append("private", "false");
    
    // Set result limit
    params.append("limit", "50");
    
    // Sort by rank (descending - most popular first)
    // Valid sort values: rank, phq_attendance, start, relevance, etc.
    params.append("sort", "-rank");
    
    // Make API request
    let response: Response;
    try {
      response = await fetch(
        `${PREDICTHQ_API_BASE}/events/?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${PREDICTHQ_API_TOKEN}`,
            Accept: "application/json",
          },
          mode: 'cors',
        }
      );
    } catch (error: any) {
      // Handle network errors
      throw new Error(`Failed to connect to PredictHQ API: ${error.message}. Please check your internet connection and API configuration.`);
    }
    
    if (!response.ok) {
      // Try to get more detailed error information
      let errorMessage = `PredictHQ API error: ${response.status} ${response.statusText}`;
      let errorDetails: any = null;
      
      try {
        const errorData = await response.json();
        errorDetails = errorData;
        
        if (errorData.detail) {
          errorMessage = `PredictHQ API error: ${errorData.detail}`;
        } else if (errorData.message) {
          errorMessage = `PredictHQ API error: ${errorData.message}`;
        } else if (errorData.error) {
          errorMessage = `PredictHQ API error: ${errorData.error}`;
        }
      } catch (e) {
        // If we can't parse the error, try to get text response
        try {
          const text = await response.text();
          errorDetails = { rawResponse: text };
        } catch (textError) {
          // If we can't get text either, use the status text
        }
      }
      
      // Provide helpful error message based on status code
      if (response.status === 401 || response.status === 403) {
        errorMessage = `Authentication failed. Please check your PredictHQ API token. ${errorMessage}`;
      } else if (response.status === 404) {
        errorMessage = `API endpoint not found. ${errorMessage}`;
      } else if (response.status >= 500) {
        errorMessage = `PredictHQ API server error. ${errorMessage}`;
      }
      
      throw new Error(errorMessage);
    }
    
    const data: PredictHQResponse = await response.json();
    
    // Transform events to our format
    if (!data.results || data.results.length === 0) {
      return [];
    }
    
    return data.results.map(transformEvent);
  } catch (error) {
    throw error;
  }
}

/**
 * Get popular/trending events in a city
 * 
 * @param city - City name or coordinates
 * @returns Promise with array of popular events
 */
export async function getPopularEvents(city?: string, lat?: number, lon?: number): Promise<Event[]> {
  const filters: EventFilters = {};
  
  if (lat && lon) {
    filters.latitude = lat;
    filters.longitude = lon;
    filters.radius = 50; // Wider radius for popular events (50 miles = ~80km)
  } else if (city) {
    filters.city = city;
    // Let searchEvents handle geocoding and determine appropriate radius
  } else {
    filters.city = "New York"; // Default city
  }
  
  // Get events sorted by rank (most popular first)
  const events = await searchEvents(filters);
  
  // Return first 12 events as "popular"
  return events.slice(0, 12);
}

/**
 * Get event details by ID
 * 
 * @param eventId - Event ID from PredictHQ
 * @returns Promise with event details
 */
export async function getEventById(eventId: string): Promise<Event> {
  // Validate API token and base URL
  if (!PREDICTHQ_API_TOKEN) {
    throw new Error(
      "PredictHQ API token is not configured. Please set NEXT_PUBLIC_PREDICTHQ_API_TOKEN in your .env.local file."
    );
  }

  if (!PREDICTHQ_API_BASE) {
    throw new Error(
      "PredictHQ API base URL is not configured. Please set NEXT_PUBLIC_PREDICTHQ_API_BASE in your .env.local file."
    );
  }

  try {
    // PredictHQ API uses the search endpoint with 'id' parameter to get event details
    // Format: /v1/events/?id={eventId}
    const searchUrl = `${PREDICTHQ_API_BASE}/events/?id=${encodeURIComponent(eventId)}`;
    
    let response: Response;
    try {
      response = await fetch(
        searchUrl,
        {
          headers: {
            Authorization: `Bearer ${PREDICTHQ_API_TOKEN}`,
            Accept: "application/json",
          },
          mode: 'cors',
        }
      );
    } catch (error: any) {
      throw new Error(`Failed to connect to PredictHQ API: ${error.message}. Please check your internet connection and API configuration.`);
    }
    
    if (!response.ok) {
      let errorMessage = `PredictHQ API error: ${response.status} ${response.statusText}`;
      let errorDetails: any = null;
      
      try {
        const errorData = await response.json();
        errorDetails = errorData;
        if (errorData.detail) {
          errorMessage = `PredictHQ API error: ${errorData.detail}`;
        } else if (errorData.message) {
          errorMessage = `PredictHQ API error: ${errorData.message}`;
        } else if (errorData.error) {
          errorMessage = `PredictHQ API error: ${errorData.error}`;
        }
      } catch (e) {
        // If we can't parse the error, use the status text
      }
      
      // Provide helpful error message based on status code
      if (response.status === 404) {
        errorMessage = `Event not found. The event ID "${eventId}" may be invalid, the event may no longer be available, or it might be from a different API. Please try searching for events again.`;
      } else if (response.status === 401 || response.status === 403) {
        errorMessage = `Authentication failed. Please check your PredictHQ API token.`;
      }
      
      throw new Error(errorMessage);
    }
    
    const responseData: PredictHQResponse = await response.json();
    
    // PredictHQ returns events in a results array
    if (!responseData.results || responseData.results.length === 0) {
      throw new Error(`Event not found. The event ID "${eventId}" may be invalid or the event may no longer be available.`);
    }
    
    // Find the event with matching ID (should be the first one, but let's be safe)
    const predicthqEvent = responseData.results.find((e: PredictHQEvent) => e.id === eventId);
    
    if (!predicthqEvent) {
      throw new Error(`Event not found. The event ID "${eventId}" was not found in the API response.`);
    }
    
    const event = transformEvent(predicthqEvent);
    
    return event;
  } catch (error) {
    throw error;
  }
}

/**
 * Get multiple events by their IDs
 * Useful for "My Events" page
 * 
 * @param eventIds - Array of event IDs
 * @returns Promise with array of events
 */
export async function getEventsByIds(eventIds: string[]): Promise<Event[]> {
  try {
    // Fetch all events in parallel, but handle individual failures gracefully
    const promises = eventIds.map((id) => 
      getEventById(id).catch((error) => {
        // Return null for failed events (don't fail the entire request)
        return null;
      })
    );
    
    const results = await Promise.all(promises);
    // Filter out null values (failed events)
    return results.filter((event): event is Event => event !== null);
  } catch (error) {
    return [];
  }
}

