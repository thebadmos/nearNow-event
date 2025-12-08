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

// Validate that token is set
if (!PREDICTHQ_API_TOKEN) {
  console.warn(
    "WARNING: PREDICTHQ_API_TOKEN is not set. Please add NEXT_PUBLIC_PREDICTHQ_API_TOKEN to your .env.local file."
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
    name: string;
    type: string;
  }>;
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

  // Build address string
  const addressParts = [
    address?.name,
    address?.street,
    address?.locality,
    address?.region,
    address?.country,
  ].filter(Boolean);

  return {
    id: predicthqEvent.id,
    name: predicthqEvent.title,
    description: predicthqEvent.description || "",
    startDate: predicthqEvent.start,
    endDate: predicthqEvent.end || predicthqEvent.start,
    timezone: predicthqEvent.timezone,
    url: `https://www.predicthq.com/events/${predicthqEvent.id}`,
    // PredictHQ doesn't provide event images directly, but we can use a placeholder or category-based image
    // For now, we'll leave it undefined and the UI will show a nice gradient placeholder
    imageUrl: undefined,
    venue: geo || address
      ? {
          name: address?.name || "Event Venue",
          address: addressParts.join(", ") || "Location available",
          city: address?.locality,
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
  // Validate API token before making request
  if (!PREDICTHQ_API_TOKEN) {
    throw new Error(
      "PredictHQ API token is not configured. Please set NEXT_PUBLIC_PREDICTHQ_API_TOKEN in your .env.local file."
    );
  }

  try {
    // Build query parameters
    const params = new URLSearchParams();
    
    // Add location filters
    if (filters.latitude && filters.longitude) {
      // PredictHQ location format: location_around.origin=lat,lon&location_around.radius=XXkm
      params.append("location_around.origin", `${filters.latitude},${filters.longitude}`);
      params.append("location_around.radius", `${filters.radius || 25}km`); // PredictHQ uses km
    } else if (filters.city) {
      // For city search, use the 'q' parameter for keyword search
      params.append("q", filters.city);
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
    const response = await fetch(
      `${PREDICTHQ_API_BASE}/events/?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${PREDICTHQ_API_TOKEN}`,
          Accept: "application/json",
        },
      }
    );
    
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
      
      console.error("PredictHQ API Error Details:", {
        status: response.status,
        statusText: response.statusText,
        url: `${PREDICTHQ_API_BASE}/events/`,
        errorDetails,
        tokenSet: !!PREDICTHQ_API_TOKEN,
        tokenLength: PREDICTHQ_API_TOKEN?.length || 0,
      });
      
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
    console.error("Error searching events:", error);
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
    filters.radius = 50; // Wider radius for popular events (50km)
  } else if (city) {
    filters.city = city;
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
  // Validate API token
  if (!PREDICTHQ_API_TOKEN) {
    throw new Error(
      "PredictHQ API token is not configured. Please set NEXT_PUBLIC_PREDICTHQ_API_TOKEN in your .env.local file."
    );
  }

  try {
    // PredictHQ API uses the search endpoint with 'id' parameter to get event details
    // Format: /v1/events/?id={eventId}
    const searchUrl = `${PREDICTHQ_API_BASE}/events/?id=${encodeURIComponent(eventId)}`;
    
    console.log("🔍 Fetching event by ID using search endpoint:", {
      eventId,
      eventIdLength: eventId.length,
      eventIdType: typeof eventId,
      url: searchUrl,
      apiBase: PREDICTHQ_API_BASE,
    });
    
    const response = await fetch(
      searchUrl,
      {
        headers: {
          Authorization: `Bearer ${PREDICTHQ_API_TOKEN}`,
          Accept: "application/json",
        },
      }
    );
    
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
      
      console.error("❌ PredictHQ API Error Details:", {
        status: response.status,
        statusText: response.statusText,
        url: searchUrl,
        eventId,
        eventIdLength: eventId.length,
        errorDetails,
        fullErrorResponse: JSON.stringify(errorDetails, null, 2),
      });
      
      // Provide helpful error message based on status code
      if (response.status === 404) {
        errorMessage = `Event not found. The event ID "${eventId}" may be invalid, the event may no longer be available, or it might be from a different API. Please try searching for events again.`;
      } else if (response.status === 401 || response.status === 403) {
        errorMessage = `Authentication failed. Please check your PredictHQ API token.`;
      }
      
      throw new Error(errorMessage);
    }
    
    const responseData: PredictHQResponse = await response.json();
    
    console.log("✅ API Response received:", {
      eventId,
      responseKeys: Object.keys(responseData),
      hasResults: !!responseData.results,
      resultsLength: responseData.results?.length || 0,
      responseData: JSON.stringify(responseData, null, 2).substring(0, 1000), // First 1000 chars
    });
    
    // PredictHQ returns events in a results array
    if (!responseData.results || responseData.results.length === 0) {
      throw new Error(`Event not found. The event ID "${eventId}" may be invalid or the event may no longer be available.`);
    }
    
    // Find the event with matching ID (should be the first one, but let's be safe)
    const predicthqEvent = responseData.results.find((e: PredictHQEvent) => e.id === eventId);
    
    if (!predicthqEvent) {
      console.error("❌ Event ID not found in results:", {
        eventId,
        returnedIds: responseData.results.map((e: PredictHQEvent) => e.id),
      });
      throw new Error(`Event not found. The event ID "${eventId}" was not found in the API response.`);
    }
    
    console.log("📦 Event found in results:", {
      id: predicthqEvent.id,
      title: predicthqEvent.title,
      totalResults: responseData.results.length,
    });
    
    const event = transformEvent(predicthqEvent);
    
    console.log("✨ Transformed event:", {
      id: event.id,
      name: event.name,
      hasVenue: !!event.venue,
      hasDescription: !!event.description,
    });
    
    return event;
  } catch (error) {
    console.error("Error fetching event:", error);
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
        // Log error for individual events but don't fail the entire request
        console.warn(`Failed to fetch event ${id}:`, error?.message || error);
        return null; // Return null for failed events
      })
    );
    
    const results = await Promise.all(promises);
    // Filter out null values (failed events)
    return results.filter((event): event is Event => event !== null);
  } catch (error) {
    console.error("Error fetching events by IDs:", error);
    return [];
  }
}

