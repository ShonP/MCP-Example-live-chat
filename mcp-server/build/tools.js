/**
 * Tool implementations for the MCP Flight Server
 */
import { FLIGHTS_DATA, PASSENGERS_DATA, DEST_MAPPING } from "./data.js";
/**
 * Get flights with optional filtering
 */
export function getFlights(destCode, airline) {
    let flights = [...FLIGHTS_DATA];
    if (destCode) {
        flights = flights.filter((f) => f.dest_code.toUpperCase() === destCode.toUpperCase());
    }
    if (airline) {
        flights = flights.filter((f) => f.airline.toLowerCase().includes(airline.toLowerCase()));
    }
    return {
        total_count: flights.length,
        flights: flights,
    };
}
/**
 * Get all passengers for a specific flight
 */
export function getPassengersByFlight(flightNumber) {
    const passengers = PASSENGERS_DATA.filter((p) => p.flight_number === flightNumber.toUpperCase());
    const limitedPassengers = passengers.slice(0, 20);
    return {
        flight_number: flightNumber,
        passenger_count: passengers.length,
        passengers: limitedPassengers,
        note: passengers.length > 20
            ? `Showing first 20 of ${passengers.length} passengers`
            : null,
    };
}
/**
 * Count passengers per flight, sorted by count descending
 */
export function countPassengersByFlight(topN) {
    const counts = {};
    for (const passenger of PASSENGERS_DATA) {
        const flight = passenger.flight_number;
        counts[flight] = (counts[flight] || 0) + 1;
    }
    // Sort by count descending
    let sortedCounts = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (topN) {
        sortedCounts = sortedCounts.slice(0, topN);
    }
    const result = sortedCounts.map(([flight, count]) => ({
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
export function getTopFlightsWithDestinations(topN = 10) {
    // Count passengers per flight
    const counts = {};
    for (const passenger of PASSENGERS_DATA) {
        const flight = passenger.flight_number;
        counts[flight] = (counts[flight] || 0) + 1;
    }
    // Sort by count descending and take top N
    const sortedCounts = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN);
    // Enrich with flight and destination info
    const results = [];
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
export function getDestinationInfo(destCode) {
    destCode = destCode.toUpperCase();
    const cityName = DEST_MAPPING[destCode];
    if (!cityName) {
        return { error: `Unknown destination code: ${destCode}` };
    }
    // Count flights to this destination
    const flightsToDest = FLIGHTS_DATA.filter((f) => f.dest_code === destCode);
    // Count total passengers to this destination
    const flightIds = flightsToDest.map((f) => f.flight_ID);
    const totalPassengers = PASSENGERS_DATA.filter((p) => flightIds.includes(p.flight_number)).length;
    return {
        destination_code: destCode,
        city_name: cityName,
        total_flights: flightsToDest.length,
        total_passengers: totalPassengers,
        flights: flightsToDest,
    };
}
