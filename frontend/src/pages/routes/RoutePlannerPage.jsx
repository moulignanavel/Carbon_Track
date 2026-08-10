/**
 * RoutePlannerPage.jsx  —  Green Journey & Interactive Map Route Calculator
 * ─────────────────────────────────────────────────────────────────────────────
 * Side-by-side layout: Trip Configuration on the left (7 cols),
 * Interactive Leaflet Map on the right (5 cols).
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Navigation, MapPin, Bike, Train, Car, Bus, Plane, Fuel,
  TrendingDown, Leaf, Award, CheckCircle2, Loader2, ArrowRight,
  Plus, Users, Sparkles, ShieldCheck, Zap, Map as MapIcon, Globe, LocateFixed, RotateCcw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useActivity } from '@/context/ActivityContext';
import { Card, Badge, Button } from '@/components/ui';
import activityService from '@/services/api/activityService';
import { formatEmission } from '@/utils/formatters';

// Fix Leaflet marker default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/* ── Custom Pins for Leaflet ── */
const originIcon = L.divIcon({
  className: 'custom-leaflet-pin-origin',
  html: `<div style="background-color: #10b981; width: 22px; height: 22px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); text-align: center; color: white; font-weight: bold; font-size: 11px; line-height: 17px;">A</div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const destIcon = L.divIcon({
  className: 'custom-leaflet-pin-dest',
  html: `<div style="background-color: #ef4444; width: 22px; height: 22px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); text-align: center; color: white; font-weight: bold; font-size: 11px; line-height: 17px;">B</div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

/* ── Indian Major Cities with Coordinates ── */
const INDIAN_CITIES = [
  { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
  { name: 'Coimbatore', lat: 11.0168, lon: 76.9558 },
  { name: 'Madurai', lat: 9.9252, lon: 78.1198 },
  { name: 'Trichy (Tiruchirappalli)', lat: 10.7905, lon: 78.7047 },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { name: 'Pune', lat: 18.5204, lon: 73.8567 },
  { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
  { name: 'Kochi (Cochin)', lat: 9.9312, lon: 76.2673 },
  { name: 'Delhi / NCR', lat: 28.6139, lon: 77.2090 },
  { name: 'Jaipur', lat: 26.9124, lon: 75.7873 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
  { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714 },
  { name: 'Goa', lat: 15.2993, lon: 74.1240 },
];

/* ── Popular Indian Route Presets ── */
const INDIAN_ROUTE_PRESETS = [
  { label: 'Chennai ➔ Bengaluru', origin: 'Chennai', dest: 'Bengaluru', distance: 350 },
  { label: 'Mumbai ➔ Pune', origin: 'Mumbai', dest: 'Pune', distance: 150 },
  { label: 'Chennai ➔ Coimbatore', origin: 'Chennai', dest: 'Coimbatore', distance: 500 },
  { label: 'Bengaluru ➔ Hyderabad', origin: 'Bengaluru', dest: 'Hyderabad', distance: 570 },
  { label: 'Delhi ➔ Jaipur', origin: 'Delhi / NCR', dest: 'Jaipur', distance: 280 },
  { label: 'Kochi ➔ Madurai', origin: 'Kochi (Cochin)', dest: 'Madurai', distance: 210 },
];

/* Haversine distance calculator */
function calcHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(1, Math.round(R * c));
}

/* ── Emission factors per passenger-km (in kg CO2e / km) ── */
const TRANSIT_MODES = [
  {
    id: 'bike',
    modeKey: 'bike',
    title: 'Bicycle / Walking',
    category: 'transport',
    backendMode: 'bike',
    factor: 0.0,
    icon: Bike,
    color: 'emerald',
    badgeText: 'Zero Emission',
    badgeVariant: 'success',
    desc: 'Pure human-powered transport. Zero carbon emissions and high health benefits.',
  },
  {
    id: 'train',
    modeKey: 'train',
    title: 'Vande Bharat / Express Train',
    category: 'transport',
    backendMode: 'train',
    factor: 0.041,
    icon: Train,
    color: 'teal',
    badgeText: 'Ultra Low Impact',
    badgeVariant: 'success',
    desc: 'Electrified Indian Railways network. Efficient shared passenger transit.',
  },
  {
    id: 'car_electric',
    modeKey: 'car_electric',
    title: 'Electric Vehicle (EV Car)',
    category: 'transport',
    backendMode: 'car_electric',
    factor: 0.053,
    icon: Zap,
    color: 'green',
    badgeText: 'Clean Energy',
    badgeVariant: 'success',
    desc: 'Zero tailpipe emissions EV. Eco-friendly city and highway commuting.',
  },
  {
    id: 'bus',
    modeKey: 'bus',
    title: 'KSRTC / State / Private Bus',
    category: 'transport',
    backendMode: 'bus',
    factor: 0.082,
    icon: Bus,
    color: 'cyan',
    badgeText: 'Low Impact',
    badgeVariant: 'info',
    desc: 'High occupancy intercity and Volvo bus travel.',
  },
  {
    id: 'car_petrol',
    modeKey: 'car_petrol',
    title: 'Petrol Sedan / Hatchback',
    category: 'transport',
    backendMode: 'car_petrol',
    factor: 0.192,
    icon: Car,
    color: 'amber',
    badgeText: 'Moderate Impact',
    badgeVariant: 'warning',
    desc: 'Standard gasoline passenger car.',
  },
  {
    id: 'car_diesel',
    modeKey: 'car_diesel',
    title: 'Diesel SUV / Taxi',
    category: 'transport',
    backendMode: 'car_diesel',
    factor: 0.245,
    icon: Fuel,
    color: 'rose',
    badgeText: 'High Impact',
    badgeVariant: 'danger',
    desc: 'Heavy fuel usage and high particulate emissions per km.',
  },
  {
    id: 'flight_short',
    modeKey: 'flight',
    title: 'Domestic Flight',
    category: 'transport',
    backendMode: 'flight_short',
    factor: 0.265,
    icon: Plane,
    color: 'purple',
    badgeText: 'Extreme Impact',
    badgeVariant: 'danger',
    desc: 'Domestic aviation jet fuel combustion and high altitude emissions.',
  },
];

const DISTANCE_PRESETS = [10, 25, 50, 150, 350, 500];

export default function RoutePlannerPage() {
  const { t } = useTranslation();
  const { fetchActivities } = useActivity();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const originMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const polylineRef = useRef(null);

  /* State */
  const [originCoords, setOriginCoords] = useState({ lat: 13.0827, lon: 80.2707, name: 'Chennai (Point A)' });
  const [destCoords, setDestCoords] = useState({ lat: 12.9716, lon: 77.5946, name: 'Bengaluru (Point B)' });
  const [originText, setOriginText] = useState('Chennai');
  const [destText, setDestText] = useState('Bengaluru');
  const [distance, setDistance] = useState(350); // km
  const [passengers, setPassengers] = useState(1);
  const [frequency, setFrequency] = useState('single');
  const [loggingId, setLoggingId] = useState(null);
  const [clickStep, setClickStep] = useState(0);

  /* Initialize Leaflet Map on right panel */
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [15.5, 79.0],
      zoom: 5,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(map);

    mapInstanceRef.current = map;

    const oMarker = L.marker([originCoords.lat, originCoords.lon], { icon: originIcon, draggable: true }).addTo(map);
    const dMarker = L.marker([destCoords.lat, destCoords.lon], { icon: destIcon, draggable: true }).addTo(map);

    oMarker.bindTooltip('Origin A', { permanent: false });
    dMarker.bindTooltip('Destination B', { permanent: false });

    originMarkerRef.current = oMarker;
    destMarkerRef.current = dMarker;

    const line = L.polyline([
      [originCoords.lat, originCoords.lon],
      [destCoords.lat, destCoords.lon],
    ], { color: '#10b981', weight: 3.5, dashArray: '5, 7' }).addTo(map);

    polylineRef.current = line;

    map.fitBounds(line.getBounds(), { padding: [30, 30] });

    oMarker.on('dragend', () => {
      const pos = oMarker.getLatLng();
      setOriginCoords((prev) => ({ ...prev, lat: pos.lat, lon: pos.lng }));
    });

    dMarker.on('dragend', () => {
      const pos = dMarker.getLatLng();
      setDestCoords((prev) => ({ ...prev, lat: pos.lat, lon: pos.lng }));
    });

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      setClickStep((prevStep) => {
        if (prevStep === 0) {
          oMarker.setLatLng([lat, lng]);
          setOriginCoords({ lat, lon: lng, name: `Pin A (${lat.toFixed(2)}, ${lng.toFixed(2)})` });
          setOriginText(`Custom Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`);
          toast.success('Origin (Point A) set!');
          return 1;
        } else {
          dMarker.setLatLng([lat, lng]);
          setDestCoords({ lat, lon: lng, name: `Pin B (${lat.toFixed(2)}, ${lng.toFixed(2)})` });
          setDestText(`Custom Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`);
          toast.success('Destination (Point B) set!');
          return 0;
        }
      });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  /* Sync Leaflet map when coordinates change */
  useEffect(() => {
    if (!mapInstanceRef.current || !originMarkerRef.current || !destMarkerRef.current) return;

    originMarkerRef.current.setLatLng([originCoords.lat, originCoords.lon]);
    destMarkerRef.current.setLatLng([destCoords.lat, destCoords.lon]);

    if (polylineRef.current) {
      polylineRef.current.setLatLngs([
        [originCoords.lat, originCoords.lon],
        [destCoords.lat, destCoords.lon],
      ]);
    }

    const dist = calcHaversine(originCoords.lat, originCoords.lon, destCoords.lat, destCoords.lon);
    setDistance(dist);
  }, [originCoords, destCoords]);

  /* Handle City Selection */
  const handleOriginCitySelect = (cityName) => {
    setOriginText(cityName);
    const city = INDIAN_CITIES.find((c) => c.name === cityName);
    if (city) {
      setOriginCoords({ lat: city.lat, lon: city.lon, name: city.name });
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([city.lat, city.lon], 7);
      }
    }
  };

  const handleDestCitySelect = (cityName) => {
    setDestText(cityName);
    const city = INDIAN_CITIES.find((c) => c.name === cityName);
    if (city) {
      setDestCoords({ lat: city.lat, lon: city.lon, name: city.name });
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([city.lat, city.lon], 7);
      }
    }
  };

  const handleApplyPreset = (preset) => {
    setOriginText(preset.origin);
    setDestText(preset.dest);
    setDistance(preset.distance);

    const oCity = INDIAN_CITIES.find((c) => c.name.includes(preset.origin));
    const dCity = INDIAN_CITIES.find((c) => c.name.includes(preset.dest));
    if (oCity) setOriginCoords({ lat: oCity.lat, lon: oCity.lon, name: oCity.name });
    if (dCity) setDestCoords({ lat: dCity.lat, lon: dCity.lon, name: dCity.name });

    if (oCity && dCity && mapInstanceRef.current && polylineRef.current) {
      const bounds = L.latLngBounds([[oCity.lat, oCity.lon], [dCity.lat, dCity.lon]]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30] });
    }
  };

  /* Calculations */
  const calculations = useMemo(() => {
    const multiplier = frequency === 'weekly' ? 5 * 52 : 1;
    const effectivePassengers = Math.max(1, passengers);

    const modeEmissions = TRANSIT_MODES.map((mode) => {
      const isCar = mode.id.startsWith('car_');
      const passDivisor = isCar ? effectivePassengers : 1;
      const perTripEmissions = (mode.factor * distance) / passDivisor;
      const totalPeriodEmissions = perTripEmissions * multiplier;

      return {
        ...mode,
        perTripEmissions,
        totalPeriodEmissions,
      };
    });

    const petrolMode = modeEmissions.find((m) => m.id === 'car_petrol');
    const maxEmissionMode = modeEmissions.reduce((max, m) => (m.perTripEmissions > max.perTripEmissions ? m : max), modeEmissions[0]);

    return {
      modes: modeEmissions,
      petrolBaseline: petrolMode ? petrolMode.perTripEmissions : 0,
      maxEmissions: maxEmissionMode.perTripEmissions || 1,
    };
  }, [distance, passengers, frequency]);

  /* Log selected transit option */
  const handleLogActivity = async (mode) => {
    setLoggingId(mode.id);
    try {
      const today = new Date().toISOString().split('T')[0];
      const notesStr = `Route: ${originText} to ${destText} (${distance} km via ${mode.title})`;

      await activityService.logTransportActivity({
        transportMode: mode.backendMode,
        distance: Number(distance),
        unit: 'km',
        logDate: today,
        notes: notesStr,
      });

      toast.success(`Logged ${distance} km ${mode.title} trip (${formatEmission(mode.perTripEmissions)})!`);
      
      // Dispatch global activity-logged event so Challenges & Dashboard update immediately
      window.dispatchEvent(new Event('activity-logged'));

      if (fetchActivities) {
        await fetchActivities();
      }
    } catch (err) {
      console.error('Failed to log route activity:', err);
      toast.error('Failed to log activity. Please try again.');
    } finally {
      setLoggingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-900/90 dark:via-teal-900/90 dark:to-cyan-900/90 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mr-12 -mt-12 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t('routePlanner.indiaGreenTransit', { defaultValue: 'India Green Transit Intelligence' })}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('routePlanner.title', { defaultValue: 'Green Journey & Route Emissions Calculator' })}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-emerald-50 opacity-95 leading-relaxed">
            {t('routePlanner.subtitle', { defaultValue: 'Select origin and destination on the map or city selectors. Compare carbon footprints across Indian Railways, EV, Bus, Petrol Sedan, SUV, and Domestic Flights.' })}
          </p>
        </div>
      </div>

      {/* Main 2-Column Section: Form on Left (7 cols), Map on Right (5 cols) */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Column (7 cols): Configuration Form */}
        <Card className="md:col-span-7 p-6 border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Navigation className="h-5 w-5 text-emerald-500" />
              {t('routePlanner.routeConfig', { defaultValue: 'Route Configuration & Shortcuts' })}
            </h2>

            {/* Preset Buttons */}
            <div className="mb-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                {t('routePlanner.popularRoutes', { defaultValue: 'Popular Indian Routes:' })}
              </span>
              <div className="flex flex-wrap gap-2">
                {INDIAN_ROUTE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handleApplyPreset(preset)}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-all flex items-center gap-1"
                  >
                    <LocateFixed className="h-3 w-3" />
                    {preset.label} ({preset.distance} km)
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {/* Origin & Destination City Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    {t('routePlanner.originCity', { defaultValue: 'Origin City (Point A)' })}
                  </label>
                  <select
                    value={originText}
                    onChange={(e) => handleOriginCitySelect(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {INDIAN_CITIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        🟢 {c.name}
                      </option>
                    ))}
                    {!INDIAN_CITIES.some((c) => c.name === originText) && (
                      <option value={originText}>🟢 {originText}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    {t('routePlanner.destCity', { defaultValue: 'Destination City (Point B)' })}
                  </label>
                  <select
                    value={destText}
                    onChange={(e) => handleDestCitySelect(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {INDIAN_CITIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        🔴 {c.name}
                      </option>
                    ))}
                    {!INDIAN_CITIES.some((c) => c.name === destText) && (
                      <option value={destText}>🔴 {destText}</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Distance Slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t('routePlanner.tripDistance', { defaultValue: 'Trip Distance (km):' })}
                  </label>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    {distance} km
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="1000"
                  value={distance}
                  onChange={(e) => setDistance(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />

                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mr-1 self-center">Presets:</span>
                  {DISTANCE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setDistance(preset)}
                      className={`px-2 py-0.5 text-xs font-semibold rounded-lg transition-all ${
                        distance === preset
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {preset} km
                    </button>
                  ))}
                </div>
              </div>

              {/* Passengers & Horizon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-emerald-500" />
                    {t('routePlanner.passengers', { defaultValue: 'Passengers in Vehicle:' })}
                  </label>
                  <select
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value={1}>{t('routePlanner.soloTraveler', { defaultValue: 'Solo Traveler (1 person)' })}</option>
                    <option value={2}>{t('routePlanner.sharedRide', { defaultValue: '2 Passengers (Shared Ride)' })}</option>
                    <option value={3}>{t('routePlanner.carpool', { defaultValue: '3 Passengers (Carpool)' })}</option>
                    <option value={4}>{t('routePlanner.fullCar', { defaultValue: '4 Passengers (Full Car)' })}</option>
                    <option value={5}>{t('routePlanner.vanpool', { defaultValue: '5 Passengers (Vanpool)' })}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <Leaf className="h-3.5 w-3.5 text-emerald-500" />
                    {t('routePlanner.calcFrequency', { defaultValue: 'Calculation Frequency:' })}
                  </label>
                  <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setFrequency('single')}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        frequency === 'single'
                          ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {t('routePlanner.singleTrip', { defaultValue: 'Single Trip' })}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFrequency('weekly')}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        frequency === 'weekly'
                          ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {t('routePlanner.weeklyCommute', { defaultValue: 'Annual Commute' })}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Column (5 cols): Interactive Leaflet Map Card */}
        <Card className="md:col-span-5 p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shadow-sm overflow-hidden">
          <div>
            {/* Map Header */}
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <MapIcon className="h-4 w-4" />
                {t('routePlanner.interactiveMap', { defaultValue: 'Interactive Leaflet Route Map' })}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setClickStep(0);
                  toast(t('routePlanner.clickMapToSelect', { defaultValue: 'Click map to select Point A (Origin)' }));
                }}
                className="gap-1 text-[11px] h-7 px-2"
              >
                <RotateCcw className="h-3 w-3" />
                {t('routePlanner.resetPins', { defaultValue: 'Reset Pins' })}
              </Button>
            </div>

            {/* Map Canvas */}
            <div className="relative w-full h-[270px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 z-0 mb-3">
              <div ref={mapContainerRef} className="w-full h-full" />

              <div className="absolute top-2 left-2 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                {clickStep === 0
                  ? t('routePlanner.setOriginPin', { defaultValue: '🟢 Set Origin A' })
                  : t('routePlanner.setDestPin', { defaultValue: '🔴 Set Destination B' })}
              </div>
            </div>

            {/* Compact Route Summary */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">
                  {t('routePlanner.routeSummary', { defaultValue: 'Route:' })}
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white truncate max-w-[170px]">
                  {originText} ➔ {destText}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">
                  {t('routePlanner.distanceSummary', { defaultValue: 'Distance:' })}
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{distance} km</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">
                  {t('routePlanner.petrolCarFootprint', { defaultValue: 'Petrol Car Footprint:' })}
                </span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{formatEmission(calculations.petrolBaseline)}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>{t('routePlanner.geodesicDistance', { defaultValue: 'Geodesic Distance' })}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{distance} km</span>
          </div>
        </Card>
      </div>

      {/* Transit Modes Comparison Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {t('routePlanner.modeComparison', { defaultValue: 'Transit Mode Emissions Comparison' })}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Per-passenger carbon footprint for a {distance} km trip ({originText} to {destText})
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {calculations.modes.map((mode) => {
            const Icon = mode.icon;
            const isLogging = loggingId === mode.id;
            const emissions = mode.perTripEmissions;
            const intensityPct = Math.min(100, Math.max(4, (emissions / calculations.maxEmissions) * 100));

            return (
              <Card
                key={mode.id}
                className="p-5 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between bg-white dark:bg-slate-900 group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">
                          {t(`routePlanner.modes.${mode.id}.title`, { defaultValue: mode.title })}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {mode.factor === 0 ? '0 g CO₂ / km' : `${(mode.factor * 1000).toFixed(0)} g CO₂ / km`}
                        </p>
                      </div>
                    </div>
                    <Badge variant={mode.badgeVariant}>
                      {t(`routePlanner.modes.${mode.id}.badge`, { defaultValue: mode.badgeText })}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                    {t(`routePlanner.modes.${mode.id}.desc`, { defaultValue: mode.desc })}
                  </p>

                  {/* Emission KPI Display */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 mb-4 border border-slate-100 dark:border-slate-700/50">
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {frequency === 'weekly'
                          ? t('routePlanner.annualCommuteImpact', { defaultValue: 'Annual Commute Impact' })
                          : t('routePlanner.tripFootprint', { defaultValue: 'Trip Footprint' })}
                      </span>
                      <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                        {emissions === 0 ? '0.00 kg CO₂e' : formatEmission(frequency === 'weekly' ? mode.totalPeriodEmissions : emissions)}
                      </span>
                    </div>

                    {/* Intensity Bar */}
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          mode.factor === 0
                            ? 'bg-emerald-500'
                            : mode.factor < 0.06
                            ? 'bg-teal-500'
                            : mode.factor < 0.1
                            ? 'bg-cyan-500'
                            : mode.factor < 0.2
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${mode.factor === 0 ? 5 : intensityPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Log Action Button */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {distance} km
                  </span>

                  <Button
                    size="sm"
                    variant={mode.factor < 0.1 ? 'primary' : 'outline'}
                    disabled={isLogging}
                    onClick={() => handleLogActivity(mode)}
                    className="gap-1.5 text-xs font-bold"
                  >
                    {isLogging ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    <span>{t('routePlanner.logTrip', { mode: t(`routePlanner.modes.${mode.id}.title`, { defaultValue: mode.title }), defaultValue: `Log ${mode.title} Trip` })}</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
