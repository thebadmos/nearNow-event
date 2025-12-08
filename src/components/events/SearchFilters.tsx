/**
 * Search and Filter Component
 * 
 * Provides search functionality and filters for events:
 * - Search bar for keywords
 * - City/Location filter
 * - Date filter (Today, This Weekend, Custom)
 * - Event type filter
 * - Price range filter
 */

"use client";

import { useState } from "react";
import { Search, MapPin, Calendar, Tag, DollarSign, X } from "lucide-react";
import { EventFilters } from "@/types/event";

interface SearchFiltersProps {
  onFiltersChange: (filters: EventFilters) => void;
  initialFilters?: EventFilters;
}

export default function SearchFilters({ onFiltersChange, initialFilters = {} }: SearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState(initialFilters.query || "");
  const [city, setCity] = useState(initialFilters.city || "");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [customDate, setCustomDate] = useState(initialFilters.startDate || "");
  const [priceFilter, setPriceFilter] = useState<string>("");

  // Handle search input
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    applyFilters({ ...getCurrentFilters(), query: value || undefined });
  };

  // Handle city input
  const handleCityChange = (value: string) => {
    setCity(value);
    applyFilters({ ...getCurrentFilters(), city: value || undefined });
  };

  // Handle date filter selection
  const handleDateFilter = (filter: string) => {
    setDateFilter(filter);
    const filters = { ...getCurrentFilters() };
    
    if (filter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filters.startDate = today.toISOString();
      filters.endDate = tomorrow.toISOString();
    } else if (filter === "weekend") {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysUntilSaturday = 6 - dayOfWeek;
      const saturday = new Date(today);
      saturday.setDate(today.getDate() + daysUntilSaturday);
      saturday.setHours(0, 0, 0, 0);
      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() + 1);
      sunday.setHours(23, 59, 59, 999);
      filters.startDate = saturday.toISOString();
      filters.endDate = sunday.toISOString();
    } else if (filter === "custom") {
      // Custom date will be handled separately
    } else {
      filters.startDate = undefined;
      filters.endDate = undefined;
    }
    
    applyFilters(filters);
  };

  // Handle custom date
  const handleCustomDate = (date: string) => {
    setCustomDate(date);
    if (date) {
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      applyFilters({
        ...getCurrentFilters(),
        startDate: selectedDate.toISOString(),
        endDate: nextDay.toISOString(),
      });
    }
  };

  // Handle price filter
  const handlePriceFilter = (filter: string) => {
    setPriceFilter(filter);
    const filters = { ...getCurrentFilters() };
    
    if (filter === "free") {
      filters.price = { min: 0, max: 0 };
    } else if (filter === "low") {
      filters.price = { min: 0, max: 50 };
    } else if (filter === "medium") {
      filters.price = { min: 50, max: 100 };
    } else if (filter === "high") {
      filters.price = { min: 100 };
    } else {
      filters.price = undefined;
    }
    
    applyFilters(filters);
  };

  // Get current filter state
  const getCurrentFilters = (): EventFilters => {
    return {
      query: searchQuery || undefined,
      city: city || undefined,
      startDate: initialFilters.startDate,
      endDate: initialFilters.endDate,
      price: initialFilters.price,
    };
  };

  // Apply filters and notify parent
  const applyFilters = (filters: EventFilters) => {
    onFiltersChange(filters);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setCity("");
    setDateFilter("");
    setCustomDate("");
    setPriceFilter("");
    onFiltersChange({});
  };

  const hasActiveFilters = searchQuery || city || dateFilter || customDate || priceFilter;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search events (e.g., 'rock concert', 'comedy show')..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* City Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="h-4 w-4 inline mr-1" />
            Location
          </label>
          <input
            type="text"
            placeholder="City or address"
            value={city}
            onChange={(e) => handleCityChange(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 inline mr-1" />
            Date
          </label>
          <select
            value={dateFilter}
            onChange={(e) => handleDateFilter(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Any Date</option>
            <option value="today">Today</option>
            <option value="weekend">This Weekend</option>
            <option value="custom">Custom Date</option>
          </select>
          {dateFilter === "custom" && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => handleCustomDate(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          )}
        </div>

        {/* Price Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="h-4 w-4 inline mr-1" />
            Price
          </label>
          <select
            value={priceFilter}
            onChange={(e) => handlePriceFilter(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Any Price</option>
            <option value="free">Free</option>
            <option value="low">$0 - $50</option>
            <option value="medium">$50 - $100</option>
            <option value="high">$100+</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="flex items-end">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

