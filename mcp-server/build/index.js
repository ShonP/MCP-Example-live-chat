#!/usr/bin/env node
/**
 * MCP Server with Flight and Passenger Tools
 *
 * This server exposes tools for querying flight and passenger data.
 * Based on the KQL example:
 * - Flights table with flight_ID, dest_code
 * - Passengers table with passenger_ID, flight_number
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getFlights, getPassengersByFlight, countPassengersByFlight, getTopFlightsWithDestinations, getDestinationInfo, } from "./tools.js";
// Create the MCP server
const server = new McpServer({
    name: "flight-data-server",
    version: "1.0.0",
});
// =============================================================================
// Tool Definitions using the new McpServer.tool() API
// =============================================================================
// Tool: get_flights
server.tool("get_flights", "Get list of all flights with their details including flight ID, destination code, departure time, and airline.", {
    dest_code: z.string().optional().describe("Filter by destination code (e.g., 'TOK', 'LAX', 'JFK')"),
    airline: z.string().optional().describe("Filter by airline name"),
}, async ({ dest_code, airline }) => {
    const result = getFlights(dest_code, airline);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(result, null, 2),
            },
        ],
    };
});
// Tool: get_passengers_by_flight
server.tool("get_passengers_by_flight", "Get all passengers for a specific flight number.", {
    flight_number: z.string().describe("The flight number/ID to get passengers for (e.g., 'DL4733')"),
}, async ({ flight_number }) => {
    const result = getPassengersByFlight(flight_number);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(result, null, 2),
            },
        ],
    };
});
// Tool: count_passengers_by_flight
server.tool("count_passengers_by_flight", "Count the number of passengers for each flight. Returns flight numbers sorted by passenger count.", {
    top_n: z.number().optional().describe("Return only top N flights by passenger count. Default is all."),
}, async ({ top_n }) => {
    const result = countPassengersByFlight(top_n);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(result, null, 2),
            },
        ],
    };
});
// Tool: get_top_flights_with_destinations
server.tool("get_top_flights_with_destinations", "Get the top flights by passenger count along with their destination information. This is useful for queries like 'show me top 10 flights with most passengers and their destinations'.", {
    top_n: z.number().optional().default(10).describe("Number of top flights to return. Default is 10."),
}, async ({ top_n }) => {
    const result = getTopFlightsWithDestinations(top_n);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(result, null, 2),
            },
        ],
    };
});
// Tool: get_destination_info
server.tool("get_destination_info", "Get information about a destination by its code.", {
    dest_code: z.string().describe("The destination code (e.g., 'TOK', 'LAX')"),
}, async ({ dest_code }) => {
    const result = getDestinationInfo(dest_code);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(result, null, 2),
            },
        ],
    };
});
// =============================================================================
// Main Entry Point
// =============================================================================
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    // Use console.error for logging (stdout is reserved for MCP protocol)
    console.error("Flight Data MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
