/**
 * Event Types for NearNow Application
 * 
 * These types define the structure of event data from PredictHQ API
 * and how we use it throughout the application.
 */

// PredictHQ API Event Structure (kept for reference, not currently used)
export interface PredictHQEventType {
  id: string;
  name: {
    text: string;
    html: string;
  };
  description: {
    text: string;
    html: string;
  };
  start: {
    timezone: string;
    local: string;
    utc: string;
  };
  end: {
    timezone: string;
    local: string;
    utc: string;
  };
  url: string;
  venue_id?: string;
  online_event?: boolean;
  status: string;
  currency?: string;
  logo?: {
    url: string;
  };
  category_id?: string;
  subcategory_id?: string;
  format_id?: string;
  ticket_availability?: {
    has_available_tickets: boolean;
    minimum_ticket_price?: {
      currency: string;
      value: number;
      display: string;
    };
    maximum_ticket_price?: {
      currency: string;
      value: number;
      display: string;
    };
  };
  venue?: {
    id: string;
    name: string;
    address: {
      address_1?: string;
      address_2?: string;
      city?: string;
      region?: string;
      postal_code?: string;
      country?: string;
      localized_area_display?: string;
    };
    latitude?: string;
    longitude?: string;
  };
}

// Simplified Event type for our application
export interface Event {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  timezone: string;
  url: string;
  imageUrl?: string;
  venue?: {
    name: string;
    address: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  price?: {
    min?: number;
    max?: number;
    currency: string;
    display: string;
  };
  category?: string;
  isOnline: boolean;
}

// Event Search Filters
export interface EventFilters {
  city?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // in miles
  startDate?: string;
  endDate?: string;
  category?: string;
  price?: {
    min?: number;
    max?: number;
  };
  query?: string; // search keywords
}

// PredictHQ API Response (kept for reference, not currently used)
export interface PredictHQResponseType {
  count: number;
  next?: string;
  previous?: string;
  results: PredictHQEventType[];
}

