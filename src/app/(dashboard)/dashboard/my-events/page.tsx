/**
 * My Events Page
 * 
 * Displays all events that the user has saved/bookmarked.
 * Events are stored in localStorage and fetched from the API when viewing this page.
 */

"use client";

import { useState, useEffect } from "react";
import { Event } from "@/types/event";
import { getEventsByIds } from "@/services/predicthq";
import { getSavedEventIds, clearSavedEvents } from "@/services/localStorage";
import EventCard from "@/components/events/EventCard";
import { Heart, Loader2, Trash2 } from "lucide-react";

export default function MyEventsPage() {
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved events
  const loadSavedEvents = async () => {
    try {
      setLoading(true);
      const savedIds = getSavedEventIds();
      
      if (savedIds.length === 0) {
        setSavedEvents([]);
        setLoading(false);
        return;
      }

      // Fetch event details for all saved IDs
      // The API will handle invalid IDs gracefully
      if (savedIds.length > 0) {
        const events = await getEventsByIds(savedIds);
        setSavedEvents(events);
      } else {
        setSavedEvents([]);
      }
    } catch (err) {
      console.error("Error loading saved events:", err);
      setError("Failed to load saved events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load events on mount
  useEffect(() => {
    loadSavedEvents();
  }, []);

  // Handle save change (when user unsaves an event from a card)
  const handleSaveChange = () => {
    loadSavedEvents();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading your saved events...</span>
      </div>
    );
  }

  if (error) {
    const hasOldEvents = error.includes("old event");
    
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-600 mb-4 font-medium">{error}</p>
          
          {hasOldEvents && (
            <button
              onClick={() => {
                clearSavedEvents();
                setError(null);
                loadSavedEvents();
              }}
              className="flex items-center gap-2 mx-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Clear Old Events
            </button>
          )}
          
          {!hasOldEvents && (
            <button
              onClick={loadSavedEvents}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="h-8 w-8 fill-current" />
          <h1 className="text-3xl font-bold">My Events</h1>
        </div>
        <p className="text-red-100">
          {savedEvents.length > 0
            ? `You have ${savedEvents.length} saved event${savedEvents.length !== 1 ? "s" : ""}`
            : "Events you save will appear here"}
        </p>
      </div>

      {/* Saved Events Grid */}
      {savedEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {savedEvents.map((event) => (
            <EventCard key={event.id} event={event} onSaveChange={handleSaveChange} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Saved Events Yet</h2>
          <p className="text-gray-600 mb-4">
            Start discovering events and save the ones you're interested in!
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            Discover Events →
          </a>
        </div>
      )}
    </div>
  );
}

