/**
 * Mock Flight Data
 * Based on the KQL example showing flights and passengers
 */
export declare const DEST_MAPPING: Record<string, string>;
export interface Flight {
    flight_ID: string;
    dest_code: string;
    departure_time: string;
    airline: string;
}
export interface Passenger {
    passenger_ID: string;
    flight_number: string;
    name: string;
    seat: string;
}
export declare const FLIGHTS_DATA: Flight[];
export declare const PASSENGERS_DATA: Passenger[];
