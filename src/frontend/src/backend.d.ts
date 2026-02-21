import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    email: string;
    phone: string;
    lastName: string;
    firstName: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface RateBreakdown {
    serviceFees: bigint;
    taxes: bigint;
    baseFare: bigint;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Booking {
    id: string;
    costInStripeCents: bigint;
    status: Variant_cancelled_completed_confirmed;
    user: Principal;
    bookingTime: Time;
    route: Route;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface Review {
    id: string;
    bookingId: string;
    user: Principal;
    reviewText: string;
    timestamp: Time;
    rating: bigint;
}
export interface Route {
    id: string;
    destination: string;
    rateBreakdown: RateBreakdown;
    origin: string;
    operatorName: string;
    routeName: string;
    distanceKm: bigint;
    durationMinutes: bigint;
    transportType: TransportType;
    schedule: Array<Time>;
    priceCents: bigint;
}
export enum TransportType {
    bus = "bus",
    train = "train",
    taxi = "taxi"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_cancelled_completed_confirmed {
    cancelled = "cancelled",
    completed = "completed",
    confirmed = "confirmed"
}
export interface backendInterface {
    addReview(bookingId: string, rating: bigint, reviewText: string): Promise<string>;
    addRoute(route: Route): Promise<void>;
    addRouteWithRateBreakdown(transportType: TransportType, id: string, operatorName: string, routeName: string, origin: string, destination: string, distanceKm: bigint, durationMinutes: bigint, schedule: Array<Time>, baseFare: bigint, taxes: bigint, serviceFees: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBooking(booking: Booking): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deleteRoute(routeId: string): Promise<void>;
    getAllRoutes(): Promise<Array<Route>>;
    getAllRoutesForType(transportType: TransportType): Promise<Array<Route>>;
    getBooking(bookingId: string): Promise<Booking>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getReviewsForRoute(routeId: string): Promise<Array<Review>>;
    getRoutesWithAvailableSchedule(afterTime: Time): Promise<Array<Route>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserBookings(user: Principal): Promise<Array<Booking>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    listRoutesByPriceRange(fromCents: bigint, toCents: bigint): Promise<Array<Route>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchRoutesByOperator(operatorName: string): Promise<Array<Route>>;
    searchRoutesByOperatorAndType(operatorName: string, transportType: TransportType): Promise<Array<Route>>;
    searchRoutesByTimeRange(fromTime: Time, toTime: Time): Promise<Array<Route>>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateBooking(booking: Booking): Promise<void>;
    updateRoute(route: Route): Promise<void>;
}
