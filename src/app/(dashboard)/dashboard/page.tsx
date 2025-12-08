/**
 * Event Discovery Page (Home Screen)
 * 
 * This is the main page where users discover events.
 * Features:
 * - Current location detection
 * - Popular/trending events section
 * - Search and filter functionality
 * - Event results display
 */

"use client";

import { useState, useEffect } from "react";
import { Event, EventFilters } from "@/types/event";
import { searchEvents, getPopularEvents } from "@/services/predicthq";
import EventCard from "@/components/events/EventCard";
import SearchFilters from "@/components/events/SearchFilters";
import { MapPin, TrendingUp, Loader2 } from "lucide-react";

export default function DiscoverEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [popularEvents, setPopularEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filters, setFilters] = useState<EventFilters>({});
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showPopular, setShowPopular] = useState(true);

  // Get user's current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          // Location error is expected if user denies permission or browser doesn't support it
          // This is not a critical error - user can still search by city
          console.log("Location not available:", error.message || "Permission denied or not supported");
          setLocationError("Unable to get your location. Please enter a city to search.");
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  }, []);

  // Load popular events on mount or when location is available
  useEffect(() => {
    const loadPopularEvents = async () => {
      try {
        setLoading(true);
        let popular: Event[] = [];
        
        if (userLocation) {
          popular = await getPopularEvents(undefined, userLocation.lat, userLocation.lon);
        } else if (filters.city) {
          popular = await getPopularEvents(filters.city);
        } else {
          // Default to a major city if no location
          popular = await getPopularEvents("New York");
        }
        
        setPopularEvents(popular);
      } catch (error) {
        console.error("Error loading popular events:", error);
      } finally {
        setLoading(false);
      }
    };

    if (showPopular && popularEvents.length === 0) {
      loadPopularEvents();
    }
  }, [userLocation, filters.city, showPopular]);

  // Search events when filters change
  useEffect(() => {
    const searchEventsWithFilters = async () => {
      if (Object.keys(filters).length === 0 && !showPopular) {
        return; // Don't search if no filters and showing popular
      }

      try {
        setSearchLoading(true);
        setShowPopular(false);

        const searchFilters: EventFilters = {
          ...filters,
        };

        // Add location to filters if available
        if (userLocation && !filters.city) {
          searchFilters.latitude = userLocation.lat;
          searchFilters.longitude = userLocation.lon;
          searchFilters.radius = 25; // 25 mile radius
        }

        const results = await searchEvents(searchFilters);
        setEvents(results);
      } catch (error) {
        console.error("Error searching events:", error);
      } finally {
        setSearchLoading(false);
      }
    };

    // Only search if filters are applied
    if (Object.keys(filters).length > 0) {
      searchEventsWithFilters();
    }
  }, [filters, userLocation]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: EventFilters) => {
    setFilters(newFilters);
    
    // If filters are cleared (empty), reset to show popular events seamlessly
    if (Object.keys(newFilters).length === 0) {
      setShowPopular(true);
      setEvents([]);
      // Reload popular events without showing loading state (seamless reset)
      const reloadPopular = async () => {
        try {
          let popular: Event[] = [];
          
          if (userLocation) {
            popular = await getPopularEvents(undefined, userLocation.lat, userLocation.lon);
          } else {
            popular = await getPopularEvents("New York");
          }
          
          setPopularEvents(popular);
        } catch (error) {
          console.error("Error loading popular events:", error);
        }
      };
      reloadPopular();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Discover Events Near You</h1>
        <p className="text-blue-100">
          Find exciting events happening in your area right now
        </p>
        {userLocation && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4" />
            <span>Using your current location</span>
          </div>
        )}
        {locationError && (
          <div className="mt-3 text-sm text-yellow-200">
            {locationError}
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <SearchFilters onFiltersChange={handleFiltersChange} initialFilters={filters} />

      {/* Loading State */}
      {(loading || searchLoading) && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading events...</span>
        </div>
      )}

      {/* Popular Events Section */}
      {showPopular && !loading && popularEvents.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Popular Events</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {popularEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {!showPopular && !searchLoading && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {events.length > 0 ? `Found ${events.length} Events` : "No Events Found"}
          </h2>
          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-600 mb-2">No events match your search criteria.</p>
              <p className="text-sm text-gray-500">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      )}

      {/* Empty State - No filters, no popular events */}
      {!showPopular && !searchLoading && events.length === 0 && Object.keys(filters).length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-600 mb-2">Start exploring events!</p>
          <p className="text-sm text-gray-500">Use the search and filters above to find events near you.</p>
        </div>
      )}
    </div>
  );
}
