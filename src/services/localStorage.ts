/**
 * LocalStorage Service for NearNow
 * 
 * This service handles saving and retrieving saved events from localStorage.
 * We use localStorage to persist user's saved events across browser sessions.
 * 
 * In the future, this could be replaced with a database or cloud storage.
 */

const SAVED_EVENTS_KEY = "nearnow_saved_events";

/**
 * Get all saved event IDs from localStorage
 * 
 * @returns Array of event IDs
 */
export function getSavedEventIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  
  try {
    const saved = localStorage.getItem(SAVED_EVENTS_KEY);
    if (!saved) {
      return [];
    }
    return JSON.parse(saved);
  } catch (error) {
    console.error("Error reading saved events from localStorage:", error);
    return [];
  }
}

/**
 * Save an event ID to localStorage
 * 
 * @param eventId - Event ID to save
 */
export function saveEventId(eventId: string): void {
  if (typeof window === "undefined") {
    return;
  }
  
  try {
    const saved = getSavedEventIds();
    if (!saved.includes(eventId)) {
      saved.push(eventId);
      localStorage.setItem(SAVED_EVENTS_KEY, JSON.stringify(saved));
    }
  } catch (error) {
    console.error("Error saving event to localStorage:", error);
  }
}

/**
 * Remove an event ID from localStorage
 * 
 * @param eventId - Event ID to remove
 */
export function removeEventId(eventId: string): void {
  if (typeof window === "undefined") {
    return;
  }
  
  try {
    const saved = getSavedEventIds();
    const filtered = saved.filter((id) => id !== eventId);
    localStorage.setItem(SAVED_EVENTS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error removing event from localStorage:", error);
  }
}

/**
 * Check if an event is saved
 * 
 * @param eventId - Event ID to check
 * @returns True if event is saved, false otherwise
 */
export function isEventSaved(eventId: string): boolean {
  const saved = getSavedEventIds();
  return saved.includes(eventId);
}

/**
 * Clear all saved events
 */
export function clearSavedEvents(): void {
  if (typeof window === "undefined") {
    return;
  }
  
  try {
    localStorage.removeItem(SAVED_EVENTS_KEY);
  } catch (error) {
    console.error("Error clearing saved events:", error);
  }
}

