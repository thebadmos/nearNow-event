/**
 * Event Card Component
 * 
 * Displays a single event in a card format with:
 * - Event image/logo
 * - Event name
 * - Date and time
 * - Venue/location
 * - Price (if available)
 * - Save/bookmark button
 */

"use client";

import { Event } from "@/types/event";
import { Heart, MapPin, Calendar, DollarSign, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { isEventSaved, saveEventId, removeEventId } from "@/services/localStorage";
import { toast } from "react-toastify";
import Link from "next/link";

interface EventCardProps {
  event: Event;
  onSaveChange?: () => void; // Callback when save status changes
}

export default function EventCard({ event, onSaveChange }: EventCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  // Check if event is saved on mount
  useEffect(() => {
    setIsSaved(isEventSaved(event.id));
  }, [event.id]);

  // Handle save/unsave
  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isSaved) {
      removeEventId(event.id);
      setIsSaved(false);
      toast.success("Event removed from saved events", {
        position: "top-right",
        autoClose: 2000,
      });
    } else {
      saveEventId(event.id);
      setIsSaved(true);
      toast.success("Event saved!", {
        position: "top-right",
        autoClose: 2000,
      });
    }
    
    // Notify parent component if callback provided
    if (onSaveChange) {
      onSaveChange();
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Format price display
  const formatPrice = () => {
    if (!event.price) {
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

  // Store event data in sessionStorage before navigating
  // This allows the detail page to use the data without an API call
  const handleViewDetails = (e: React.MouseEvent) => {
    // Store the full event data in sessionStorage
    sessionStorage.setItem(`event_${event.id}`, JSON.stringify(event));
  };

  return (
    <Link 
      href={`/dashboard/events/${event.id}`}
      onClick={handleViewDetails}
    >
      <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer">
        {/* Event Header with Category Badge */}
        <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-4">
          {/* Category Badge */}
          {event.category && (
            <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full mb-2">
              {event.category}
            </div>
          )}
          
          {/* Save Button - Top Right */}
          <button
            onClick={handleSaveToggle}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all ${
              isSaved
                ? "bg-red-500 text-white"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
            aria-label={isSaved ? "Remove from saved events" : "Save event"}
          >
            <Heart className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
          </button>

          {/* Online Event Badge */}
          {event.isOnline && (
            <div className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
              Online
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className="p-5">
          {/* Event Name */}
          <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {event.name}
          </h3>

          {/* Date & Time */}
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <Calendar className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
            <span>{formatDate(event.startDate)}</span>
          </div>

          {/* Venue/Location */}
          {event.venue && (
            <div className="flex items-start text-sm text-gray-600 mb-3">
              <MapPin className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-gray-800">{event.venue.name}</div>
                {event.venue.address && event.venue.address !== event.venue.name && (
                  <div className="text-gray-500 text-xs mt-0.5 line-clamp-1">{event.venue.address}</div>
                )}
              </div>
            </div>
          )}

          {/* Price and View Details */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center text-sm font-semibold text-gray-700">
              <DollarSign className="h-4 w-4 mr-1 text-green-500" />
              <span>{formatPrice()}</span>
            </div>
            <div className="flex items-center text-sm text-blue-600 group-hover:text-blue-700 font-medium">
              <span className="mr-1">View Details</span>
              <ExternalLink className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

