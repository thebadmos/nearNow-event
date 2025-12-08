/**
 * Event ID Validator
 * 
 * Validates event IDs to check if they're valid for PredictHQ API
 */

/**
 * Check if an event ID looks like it's from a different/old API
 * PredictHQ IDs are typically numeric or shorter alphanumeric strings
 * Old/invalid IDs are typically longer alphanumeric strings (15+ characters)
 */
export function isOldApiId(eventId: string): boolean {
  // PredictHQ IDs are usually numeric or shorter alphanumeric strings
  // Old API IDs are typically 15+ character alphanumeric strings
  return eventId.length >= 15 && /^[a-zA-Z0-9]+$/.test(eventId);
}

/**
 * Check if an event ID is valid for PredictHQ
 * PredictHQ IDs are typically numeric or shorter alphanumeric strings
 */
export function isValidPredictHQId(eventId: string): boolean {
  // PredictHQ IDs are usually numeric or shorter alphanumeric strings
  return eventId.length < 15 || /^\d+$/.test(eventId);
}

/**
 * Get a user-friendly error message for invalid event IDs
 */
export function getEventIdErrorMessage(eventId: string): string {
  if (isOldApiId(eventId)) {
    return `This event ID appears to be from a previous API. ` +
           `Please clear your saved events and search for new events. ` +
           `Event ID: "${eventId}"`;
  }
  return `Invalid event ID format. Event ID: "${eventId}"`;
}

