/**
 * Mock Flight Data
 * Based on the KQL example showing flights and passengers
 */
// Destination code to city name mapping
export const DEST_MAPPING = {
    TOK: "Tokyo",
    PAR: "Paris",
    SFO: "San Francisco",
    LAX: "Los Angeles",
    JFK: "New York (JFK)",
    LHR: "London",
    CDG: "Paris (CDG)",
};
// Mock flight data
export const FLIGHTS_DATA = [
    { flight_ID: "DL4733", dest_code: "TOK", departure_time: "2025-02-26T08:00:00Z", airline: "Delta" },
    { flight_ID: "UA5554", dest_code: "PAR", departure_time: "2025-02-26T09:30:00Z", airline: "United" },
    { flight_ID: "AL7912", dest_code: "SFO", departure_time: "2025-02-26T10:00:00Z", airline: "Alaska" },
    { flight_ID: "LH5562", dest_code: "LAX", departure_time: "2025-02-26T11:00:00Z", airline: "Lufthansa" },
    { flight_ID: "AL2567", dest_code: "JFK", departure_time: "2025-02-26T12:30:00Z", airline: "Alaska" },
    { flight_ID: "DL4678", dest_code: "JFK", departure_time: "2025-02-26T13:00:00Z", airline: "Delta" },
    { flight_ID: "DL6788", dest_code: "SFO", departure_time: "2025-02-26T14:00:00Z", airline: "Delta" },
    { flight_ID: "LH1278", dest_code: "LAX", departure_time: "2025-02-26T15:00:00Z", airline: "Lufthansa" },
    { flight_ID: "UA5790", dest_code: "LAX", departure_time: "2025-02-26T16:00:00Z", airline: "United" },
    { flight_ID: "ABC324", dest_code: "LAX", departure_time: "2025-02-26T17:00:00Z", airline: "ABC Air" },
    { flight_ID: "YIX124", dest_code: "JFK", departure_time: "2025-02-26T18:00:00Z", airline: "YIX Airways" },
    { flight_ID: "BA1234", dest_code: "LHR", departure_time: "2025-02-26T19:00:00Z", airline: "British Airways" },
    { flight_ID: "AF5678", dest_code: "CDG", departure_time: "2025-02-26T20:00:00Z", airline: "Air France" },
];
// Passenger counts per flight (matching the chart from the images)
const PASSENGER_COUNTS = {
    DL4733: 337, // Top flight to Tokyo
    UA5554: 329, // Second to Paris
    AL7912: 166,
    LH5562: 158,
    AL2567: 148,
    DL4678: 148,
    DL6788: 143,
    LH1278: 139,
    UA5790: 138,
    ABC324: 135,
    YIX124: 130,
    BA1234: 120,
    AF5678: 115,
};
/**
 * Generate mock passenger data
 */
function generatePassengers() {
    const passengers = [];
    let passengerId = 1;
    const seats = ["A", "B", "C", "D", "E", "F"];
    for (const [flightId, count] of Object.entries(PASSENGER_COUNTS)) {
        for (let i = 0; i < count; i++) {
            passengers.push({
                passenger_ID: `PAX${String(passengerId).padStart(6, "0")}`,
                flight_number: flightId,
                name: `Passenger ${passengerId}`,
                seat: `${Math.floor(Math.random() * 40) + 1}${seats[Math.floor(Math.random() * seats.length)]}`,
            });
            passengerId++;
        }
    }
    return passengers;
}
export const PASSENGERS_DATA = generatePassengers();
