/**
 * Event Detail Page
 * 
 * Displays detailed information about a single event:
 * - Full event description
 * - Date and time details
 * - Venue information with map integration
 * - Link to purchase tickets
 * - Save/bookmark functionality
 */

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Event } from "@/types/event";
import { getEventById } from "@/services/predicthq";
import { isEventSaved, saveEventId, removeEventId } from "@/services/localStorage";
import { toast } from "react-toastify";
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  ExternalLink, 
  Heart,
  ArrowLeft,
  Loader2
} from "lucide-react";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  // Extract eventId from params - handle both string and array cases
  const eventIdParam = params?.id;
  const eventId = Array.isArray(eventIdParam) ? eventIdParam[0] : (eventIdParam as string | undefined);
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Load event details
  useEffect(() => {
    // Validate eventId before attempting to load
    if (!eventId || typeof eventId !== 'string' || eventId.trim() === '') {
      setError("Invalid event ID. Please check the URL and try again.");
      setLoading(false);
      return;
    }

    const loadEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const eventData = await getEventById(eventId);
        setEvent(eventData);
        setIsSaved(isEventSaved(eventId));
      } catch (err: any) {
        // Show the actual error message from the API for better debugging
        setError(err?.message || "Failed to load event details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  // Handle save/unsave
  const handleSaveToggle = () => {
    if (!eventId) {
      toast.error("Cannot save event: Event ID is missing.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (isSaved) {
      removeEventId(eventId);
      setIsSaved(false);
      toast.success("Event removed from saved events", {
        position: "top-right",
        autoClose: 2000,
      });
    } else {
      saveEventId(eventId);
      setIsSaved(true);
      toast.success("Event saved!", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    };
  };

  // Format price display
  const formatPrice = () => {
    if (!event?.price) {
      return "Free";
    }
    if (event.price.min === 0) {
      return "Free";
    }
    if (event.price.min && event.price.max && event.price.min !== event.price.max) {
      return `$${event.price.min} - $${event.price.max}`;
    }
    return `$${event.price.min}`;
  };

  // Get Google Maps URL
  const getMapUrl = () => {
    if (event?.venue?.latitude && event?.venue?.longitude) {
      return `https://www.google.com/maps?q=${event.venue.latitude},${event.venue.longitude}`;
    }
    if (event?.venue?.address) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue.address)}`;
    }
    return null;
  };

  // Validate and handle ticket URL click
  const handleGetTickets = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // First check if event exists
    if (!event) {
      e.preventDefault();
      toast.error("Event information is not available. Please refresh the page.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Check if event ID exists
    if (!eventId || !event.id) {
      e.preventDefault();
      toast.error("Event ID is missing. Please try refreshing the page.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Check if URL exists
    if (!event.url) {
      e.preventDefault();
      toast.error("Ticket information is not available for this event.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Validate URL format
    try {
      const url = new URL(event.url);
      // If URL is valid, let the default link behavior proceed
      // URL could be: ticket_url, external_url, website, entity URL, or Google search
    } catch (error) {
      e.preventDefault();
      toast.error("Invalid ticket URL. Please try searching for this event online.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Check if URL is a Google search URL (fallback when no external link available)
  const isGoogleSearchUrl = event?.url?.includes("google.com/search");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading event details...</span>
      </div>
    );
  }

  if (error || !event) {
    const isNotFound = error?.includes("not found") || error?.includes("invalid");
    const isSaved = eventId ? isEventSaved(eventId) : false;
    
    // Handle removing invalid event from saved events
    const handleRemoveFromSaved = () => {
      if (isSaved && eventId) {
        removeEventId(eventId);
        setIsSaved(false);
      }
    };
    
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-600 mb-4 font-medium">{error || "Event not found"}</p>
          
          {isNotFound && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              <p className="mb-2">
                This event ID may be from a previous API or the event may no longer be available.
              </p>
              {isSaved && (
                <div className="mt-3 pt-3 border-t border-yellow-300">
                  <p className="mb-2">This event is saved in your "My Events" list.</p>
                  <button
                    onClick={handleRemoveFromSaved}
                    className="px-3 py-1.5 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm font-medium transition-colors"
                  >
                    Remove from Saved Events
                  </button>
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-yellow-300">
                <p className="mb-2">To find new events:</p>
                <ol className="list-decimal list-inside space-y-1 text-left">
                  <li>Go back to the Discover Events page</li>
                  <li>Search for new events</li>
                  {isSaved && <li>Remove old saved events from "My Events"</li>}
                </ol>
              </div>
            </div>
          )}
          
          <div className="mt-6 flex gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Go back
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Search Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  const dateInfo = formatDate(event.startDate);
  const mapUrl = getMapUrl();

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Events</span>
      </button>

      {/* Event Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Event Header with Category */}
        <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-6 md:p-8">
          {/* Category Badge */}
          {event.category && (
            <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-full mb-4">
              {event.category}
            </div>
          )}
          
          {/* Save Button */}
          <button
            onClick={handleSaveToggle}
            className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-sm transition-all ${
              isSaved
                ? "bg-red-500 text-white"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
            aria-label={isSaved ? "Remove from saved events" : "Save event"}
          >
            <Heart className={`h-6 w-6 ${isSaved ? "fill-current" : ""}`} />
          </button>

          {/* Online Event Badge */}
          {event.isOnline && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full">
              Online Event
            </div>
          )}
        </div>

        {/* Event Info */}
        <div className="p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.name}</h1>

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-gray-500">Date & Time</div>
                <div className="text-gray-900">{dateInfo.date}</div>
                <div className="text-gray-600">{dateInfo.time}</div>
              </div>
            </div>

            {/* Venue/Location */}
            {event.venue && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Location</div>
                  <div className="text-gray-900">{event.venue.name}</div>
                  <div className="text-gray-600">{event.venue.address}</div>
                  {mapUrl && (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm mt-1 inline-flex items-center gap-1"
                    >
                      View on Map
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-gray-500">Price</div>
                <div className="text-gray-900 font-semibold">{formatPrice()}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">About This Event</h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {event.url ? (
              <div className="flex-1">
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleGetTickets}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                  title={isGoogleSearchUrl ? "Search for tickets online" : "Get tickets for this event"}
                >
                  <span>Get Tickets</span>
                  <ExternalLink className="h-5 w-5" />
                </a>
                {isGoogleSearchUrl && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Searching for tickets online. Click to find ticket vendors.
                  </p>
                )}
              </div>
            ) : (
              <button
                disabled
                className="flex-1 flex items-center justify-center gap-2 bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold cursor-not-allowed opacity-60"
                title="Ticket information is not available for this event"
              >
                <span>Get Tickets</span>
                <ExternalLink className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={handleSaveToggle}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all border-2 ${
                isSaved
                  ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Heart className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
              <span>{isSaved ? "Saved" : "Save Event"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

