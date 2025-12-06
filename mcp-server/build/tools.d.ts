/**
 * Tool implementations for the MCP Flight Server
 */
import { Flight } from "./data.js";
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
export declare function getFlights(destCode?: string, airline?: string): FlightsResponse;
/**
 * Get all passengers for a specific flight
 */
export declare function getPassengersByFlight(flightNumber: string): PassengersResponse;
/**
 * Count passengers per flight, sorted by count descending
 */
export declare function countPassengersByFlight(topN?: number): CountResponse;
/**
 * Get top flights by passenger count with destination info
 */
export declare function getTopFlightsWithDestinations(topN?: number): TopFlightsResponse;
/**
 * Get destination information by code
 */
export declare function getDestinationInfo(destCode: string): DestinationResponse | ErrorResponse;
