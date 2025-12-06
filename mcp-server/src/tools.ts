/**
 * Tool implementations for the MCP Flight Server
 */

import { FLIGHTS_DATA, PASSENGERS_DATA, DEST_MAPPING, Flight } from "./data.js";

// Response types
export interface FlightsResponse {
  total_count: number;
  flights: Flight[];
}

export interface PassengersResponse {
  flight_number: string;
  passenger_count: number;
  passengers: Array<{
    passenger_ID: string;
    flight_number: string;
    name: string;
    seat: string;
  }>;
  note: string | null;
}

export interface FlightCount {
  flight_number: string;
  passenger_count: number;
}

export interface CountResponse {
  total_flights: number;
  flights: FlightCount[];
}

export interface TopFlightResult {
  flight_number: string;
  passenger_count: number;
  destination: string;
  destination_code: string;
  airline: string;
  departure_time: string;
}

export interface TopFlightsResponse {
  query: string;
  total_results: number;
  results: TopFlightResult[];
}

export interface DestinationResponse {
  destination_code: string;
  city_name: string;
  total_flights: number;
  total_passengers: number;
  flights: Flight[];
}

export interface ErrorResponse {
  error: string;
}

/**
 * Get flights with optional filtering
 */
export function getFlights(destCode?: string, airline?: string): FlightsResponse {
  let flights = [...FLIGHTS_DATA];

  if (destCode) {
    flights = flights.filter(
      (f) => f.dest_code.toUpperCase() === destCode.toUpperCase()
    );
  }

  if (airline) {
    flights = flights.filter((f) =>
      f.airline.toLowerCase().includes(airline.toLowerCase())
    );
  }

  return {
    total_count: flights.length,
    flights: flights,
  };
}

/**
 * Get all passengers for a specific flight
 */
export function getPassengersByFlight(flightNumber: string): PassengersResponse {
  const passengers = PASSENGERS_DATA.filter(
    (p) => p.flight_number === flightNumber.toUpperCase()
  );

  const limitedPassengers = passengers.slice(0, 20);

  return {
    flight_number: flightNumber,
    passenger_count: passengers.length,
    passengers: limitedPassengers,
    note:
      passengers.length > 20
        ? `Showing first 20 of ${passengers.length} passengers`
        : null,
  };
}

/**
 * Count passengers per flight, sorted by count descending
 */
export function countPassengersByFlight(topN?: number): CountResponse {
  const counts: Record<string, number> = {};

  for (const passenger of PASSENGERS_DATA) {
    const flight = passenger.flight_number;
    counts[flight] = (counts[flight] || 0) + 1;
  }

  // Sort by count descending
  let sortedCounts = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  if (topN) {
    sortedCounts = sortedCounts.slice(0, topN);
  }

  const result: FlightCount[] = sortedCounts.map(([flight, count]) => ({
    flight_number: flight,
    passenger_count: count,
  }));

  return {
    total_flights: result.length,
    flights: result,
  };
}

/**
 * Get top flights by passenger count with destination info
 */
export function getTopFlightsWithDestinations(topN: number = 10): TopFlightsResponse {
  // Count passengers per flight
  const counts: Record<string, number> = {};
  for (const passenger of PASSENGERS_DATA) {
    const flight = passenger.flight_number;
    counts[flight] = (counts[flight] || 0) + 1;
  }

  // Sort by count descending and take top N
  const sortedCounts = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);

  // Enrich with flight and destination info
  const results: TopFlightResult[] = [];
  for (const [flightNumber, passengerCount] of sortedCounts) {
    const flightInfo = FLIGHTS_DATA.find((f) => f.flight_ID === flightNumber);
    if (flightInfo) {
      const destCode = flightInfo.dest_code;
      const destName = DEST_MAPPING[destCode] || destCode;
      results.push({
        flight_number: flightNumber,
        passenger_count: passengerCount,
        destination: destName,
        destination_code: destCode,
        airline: flightInfo.airline,
        departure_time: flightInfo.departure_time,
      });
    }
  }

  return {
    query: `Top ${topN} flights by passenger volume`,
    total_results: results.length,
    results: results,
  };
}

/**
 * Get destination information by code
 */
export function getDestinationInfo(destCode: string): DestinationResponse | ErrorResponse {
  destCode = destCode.toUpperCase();
  const cityName = DEST_MAPPING[destCode];

  if (!cityName) {
    return { error: `Unknown destination code: ${destCode}` };
  }

  // Count flights to this destination
  const flightsToDest = FLIGHTS_DATA.filter((f) => f.dest_code === destCode);

  // Count total passengers to this destination
  const flightIds = flightsToDest.map((f) => f.flight_ID);
  const totalPassengers = PASSENGERS_DATA.filter((p) =>
    flightIds.includes(p.flight_number)
  ).length;

  return {
    destination_code: destCode,
    city_name: cityName,
    total_flights: flightsToDest.length,
    total_passengers: totalPassengers,
    flights: flightsToDest,
  };
}
