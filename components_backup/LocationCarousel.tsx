"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin, Plus, X, Loader2, Loader, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { LocationCoordinates, CombinedWeatherData } from '@/types/weather.types';

export function LocationCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [locations, setLocations] = useState<(LocationCoordinates & { temp?: number; condition?: string; weatherData?: CombinedWeatherData })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [geoError, setGeoError] = useState('');

  // Load locations from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('weatherLocations');
    if (saved) {
      try {
        setLocations(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading locations:', e);
        setLocations([]);
      }
    }
  }, []);

  // Auto-detect user location using Geolocation API
  useEffect(() => {
    const autoDetectLocation = () => {
      if (!navigator.geolocation) {
        setGeoError('Geolocation not supported');
        return;
      }

      // Check if already have locations
      const saved = localStorage.getItem('weatherLocations');
      if (saved && JSON.parse(saved).length > 0) {
        // Already have saved locations, don't auto-detect
        return;
      }

      setIsDetectingLocation(true);
      setGeoError('');

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            // Reverse geocode to get location name
            const response = await fetch(
              `https://geocoding-api.open-meteo.com/v1/search?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`
            );
            const data = await response.json();

            if (data.results && data.results.length > 0) {
              const result = data.results[0];
              const newLocation: LocationCoordinates = {
                latitude: result.latitude,
                longitude: result.longitude,
                name: `${result.name}${result.admin1 ? ', ' + result.admin1 : ''}${result.country ? ', ' + result.country : ''}`,
              };

              // Fetch weather for detected location
              const weatherData = await fetchWeatherForLocation(newLocation);

              const locationWithWeather = {
                ...newLocation,
                temp: weatherData ? Math.round(weatherData.hourly[0]?.temperature || 0) : 0,
                condition: weatherData ? getWeatherCondition(weatherData.hourly[0]?.weatherCode || 0) : 'Unknown',
                weatherData,
              };

              setLocations([locationWithWeather]);
              localStorage.setItem('weatherLocations', JSON.stringify([locationWithWeather]));
            }
          } catch (err) {
            console.error('Error in reverse geocoding:', err);
            setGeoError('Failed to detect location name');
          } finally {
            setIsDetectingLocation(false);
          }
        },
        (error) => {
          console.log('Geolocation error:', error.message);
          setGeoError(`GPS Error: ${error.message}. Tap "Add Location" to manually select.`);
          setIsDetectingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    };

    autoDetectLocation();
  }, []);

  // Save locations to localStorage
  useEffect(() => {
    if (locations.length > 0) {
      localStorage.setItem('weatherLocations', JSON.stringify(locations));
    }
  }, [locations]);

  // Fetch weather for a location
  const fetchWeatherForLocation = async (location: LocationCoordinates) => {
    try {
      const params = new URLSearchParams({
        lat: location.latitude.toString(),
        lon: location.longitude.toString(),
        name: location.name,
        hourly: 'true',
        hourlyCount: '24',
      });

      const response = await fetch(`/api/weather/forecast?${params.toString()}`);
      const result = await response.json();

      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error?.message || 'Failed to fetch weather');
    } catch (err) {
      console.error('Error fetching weather:', err);
      return null;
    }
  };

  // Add location
  const handleAddLocation = async () => {
    if (!input.trim()) {
      setError('Please enter a location');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // Geocode using Open-Meteo Geocoding API
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(input)}&count=1&language=en&format=json`
      );
      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        setError('Location not found. Please try another search.');
        setIsLoading(false);
        return;
      }

      const result = data.results[0];
      const newLocation: LocationCoordinates = {
        latitude: result.latitude,
        longitude: result.longitude,
        name: `${result.name}${result.admin1 ? ', ' + result.admin1 : ''}${result.country ? ', ' + result.country : ''}`,
      };

      // Fetch weather for new location
      const weatherData = await fetchWeatherForLocation(newLocation);

      const locationWithWeather = {
        ...newLocation,
        temp: weatherData ? Math.round(weatherData.hourly[0]?.temperature || 0) : 0,
        condition: weatherData ? getWeatherCondition(weatherData.hourly[0]?.weatherCode || 0) : 'Unknown',
        weatherData,
      };

      setLocations([...locations, locationWithWeather]);
      setInput('');
      setShowAddModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add location');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove location
  const handleRemoveLocation = (index: number) => {
    const newLocations = locations.filter((_, i) => i !== index);
    setLocations(newLocations);
    if (currentIndex >= newLocations.length && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Get weather condition text
  const getWeatherCondition = (weatherCode: number): string => {
    if (weatherCode <= 3) return 'Clear';
    if (weatherCode <= 48) return 'Cloudy';
    if (weatherCode <= 55) return 'Drizzle';
    if (weatherCode <= 65) return 'Rainy';
    if (weatherCode <= 77) return 'Snowy';
    if (weatherCode <= 82) return 'Showers';
    if (weatherCode <= 99) return 'Thunderstorm';
    return 'Unknown';
  };

  const nextLocation = () => {
    if (locations.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % locations.length);
    }
  };

  const prevLocation = () => {
    if (locations.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + locations.length) % locations.length);
    }
  };

  if (isDetectingLocation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700/50"
      >
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-3 flex justify-center"
          >
            <div className="relative w-12 h-12">
              <Loader className="w-12 h-12 text-[#2F80ED] animate-spin" />
              <Zap className="w-4 h-4 absolute bottom-0 right-0 text-yellow-500 animate-pulse" />
            </div>
          </motion.div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Detecting your location...
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Please enable GPS
          </p>
        </div>
      </motion.div>
    );
  }

  if (locations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700/50"
      >
        <div className="text-center mb-4">
          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            No location detected
          </p>
          {geoError && (
            <p className="text-xs text-red-500 mb-3">{geoError}</p>
          )}
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#2F80ED] to-[#56CCF2] text-white rounded-xl font-medium hover:shadow-lg transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Location Manually
        </button>

        {/* Add Location Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Add Location
                </h2>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
                  placeholder="Enter city name..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl mb-2 focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/20 dark:bg-gray-700 dark:text-white"
                  autoFocus
                />

                {error && (
                  <p className="text-sm text-red-500 mb-4">{error}</p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddLocation}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-[#2F80ED] to-[#56CCF2] text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Location'
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide"
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={prevLocation}
          className="w-8 h-8 rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 flex items-center justify-center flex-shrink-0 hover:bg-white dark:hover:bg-gray-700"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </motion.button>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {locations.map((location, index) => (
            <motion.div
              key={`${location.name}-${index}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{
                opacity: 1,
                x: 0,
                scale: index === currentIndex ? 1 : 0.95,
              }}
              whileHover={{ scale: 1.05 }}
              className={`min-w-max px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-all relative group ${index === currentIndex
                  ? 'bg-gradient-to-r from-[#2F80ED] to-[#56CCF2] text-white shadow-lg'
                  : 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 text-gray-700 dark:text-gray-300'
                }`}
              onClick={() => setCurrentIndex(index)}
            >
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <div className="text-sm">
                <span className="font-medium">{location.name}</span>
                <span className="ml-2">{location.temp}°</span>
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveLocation(index);
                }}
                className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}

          {/* Add button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAddModal(true)}
            className="w-8 h-8 rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 flex items-center justify-center flex-shrink-0 hover:bg-white dark:hover:bg-gray-700"
          >
            <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </motion.button>
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={nextLocation}
          className="w-8 h-8 rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 flex items-center justify-center flex-shrink-0 hover:bg-white dark:hover:bg-gray-700"
        >
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </motion.button>
      </motion.div>

      {/* Add Location Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Add Location
              </h2>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
                placeholder="Enter city name..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl mb-2 focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/20 dark:bg-gray-700 dark:text-white"
                autoFocus
              />

              {error && (
                <p className="text-sm text-red-500 mb-4">{error}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLocation}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#2F80ED] to-[#56CCF2] text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Location'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
