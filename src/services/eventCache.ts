/**
 * Event Cache Service
 * 
 * Simple in-memory cache for events to avoid unnecessary API calls.
 * When events are fetched from search, they're stored here.
 * The detail page checks this cache first before making an API call.
 */

import { Event } from "@/types/event";

// In-memory cache: eventId -> Event
const eventCache = new Map<string, Event>();

/**
 * Store an event in the cache
 */
export function cacheEvent(event: Event): void {
  eventCache.set(event.id, event);
}

/**
 * Store multiple events in the cache
 */
export function cacheEvents(events: Event[]): void {
  events.forEach((event) => {
    eventCache.set(event.id, event);
  });
}

/**
 * Get an event from the cache
 */
export function getCachedEvent(eventId: string): Event | undefined {
  return eventCache.get(eventId);
}

/**
 * Clear the cache (useful for testing or memory management)
 */
export function clearCache(): void {
  eventCache.clear();
}

/**
 * Remove a specific event from the cache
 */
export function removeCachedEvent(eventId: string): void {
  eventCache.delete(eventId);
}

