import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";

import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  module Booking {
    public func compareByTime(booking1 : Booking, booking2 : Booking) : Order.Order {
      if (booking1.bookingTime < booking2.bookingTime) { return #less };
      return #greater;
    };
  };

  public type TransportType = {
    #train;
    #bus;
    #taxi;
  };

  public type RateBreakdown = {
    baseFare : Nat;
    taxes : Nat;
    serviceFees : Nat;
  };

  public type Route = {
    transportType : TransportType;
    id : Text;
    operatorName : Text;
    routeName : Text;
    origin : Text;
    destination : Text;
    distanceKm : Nat;
    durationMinutes : Nat;
    schedule : [Time.Time];
    priceCents : Nat; // total price (backward compatibility)
    rateBreakdown : RateBreakdown;
  };

  public type Booking = {
    id : Text;
    user : Principal;
    route : Route;
    bookingTime : Time.Time;
    status : {
      #confirmed;
      #cancelled;
      #completed;
    };
    costInStripeCents : Nat;
  };

  public type Review = {
    id : Text;
    bookingId : Text;
    user : Principal;
    rating : Nat;
    reviewText : Text;
    timestamp : Time.Time;
  };

  // Data stores
  let routes = Map.empty<Text, Route>();
  let reviews = Map.empty<Text, Review>();
  let bookings = Map.empty<Text, Booking>();
  let stripeSessions = Map.empty<Text, Principal>(); // Track session ownership

  // USER AUTHENTICATION & DATA
  public type UserProfile = {
    firstName : Text;
    lastName : Text;
    email : Text;
    phone : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // USER PROFILE MANAGEMENT
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // TRANSPORT DATA MANAGEMENT
  public shared ({ caller }) func addRoute(route : Route) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add routes");
    };
    routes.add(route.id, route);
  };

  public shared ({ caller }) func addRouteWithRateBreakdown(
    transportType : TransportType,
    id : Text,
    operatorName : Text,
    routeName : Text,
    origin : Text,
    destination : Text,
    distanceKm : Nat,
    durationMinutes : Nat,
    schedule : [Time.Time],
    baseFare : Nat,
    taxes : Nat,
    serviceFees : Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add routes");
    };

    let totalPrice = baseFare + taxes + serviceFees;

    let newRoute : Route = {
      transportType;
      id;
      operatorName;
      routeName;
      origin;
      destination;
      distanceKm;
      durationMinutes;
      schedule;
      priceCents = totalPrice;
      rateBreakdown = {
        baseFare;
        taxes;
        serviceFees;
      };
    };

    routes.add(id, newRoute);
  };

  public shared ({ caller }) func updateRoute(route : Route) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update routes");
    };
    routes.add(route.id, route);
  };

  public shared ({ caller }) func deleteRoute(routeId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete routes");
    };
    routes.remove(routeId);
  };

  public query func getAllRoutes() : async [Route] {
    routes.values().toArray();
  };

  // PAYMENT INTEGRATION (Stripe)
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  public query ({ caller }) func isStripeConfigured() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can check Stripe configuration status");
    };
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfig := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check session status");
    };

    switch (stripeSessions.get(sessionId)) {
      case (null) { Runtime.trap("Session not found or access denied") };
      case (?owner) {
        if (owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Access denied: Cannot view other users' payment sessions");
        };
        await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
      };
    };
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    let sessionId = await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
    stripeSessions.add(sessionId, caller);
    sessionId;
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // BOOKING MANAGEMENT
  public shared ({ caller }) func createBooking(booking : Booking) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create bookings");
    };
    if (booking.user != caller) {
      Runtime.trap("Access denied: Cannot create bookings for other users");
    };
    bookings.add(booking.id, booking);
  };

  public shared ({ caller }) func updateBooking(booking : Booking) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update bookings");
    };

    switch (bookings.get(booking.id)) {
      case (null) { Runtime.trap("Booking does not exist") };
      case (?existingBooking) {
        if (existingBooking.user != caller) { Runtime.trap("Access denied: Cannot modify other users' bookings") };
        bookings.add(booking.id, booking);
      };
    };
  };

  public query ({ caller }) func getBooking(bookingId : Text) : async Booking {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bookings");
    };
    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking does not exist") };
      case (?booking) {
        if (booking.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Access denied: Cannot view other users' bookings");
        };
        booking;
      };
    };
  };

  public query ({ caller }) func getUserBookings(user : Principal) : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bookings");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Access denied: Cannot view other users' bookings");
    };
    let allBookings = bookings.values().toArray();
    let userBookings = allBookings.filter(func(b) { b.user == user });
    userBookings.sort(Booking.compareByTime);
  };

  public query func getAllRoutesForType(transportType : TransportType) : async [Route] {
    let allRoutes = routes.values().toArray();
    allRoutes.filter(func(r) { r.transportType == transportType });
  };

  // RATING & REVIEW SYSTEM
  public shared ({ caller }) func addReview(bookingId : Text, rating : Nat, reviewText : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add reviews");
    };

    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking does not exist") };
      case (?booking) {
        if (booking.user != caller or booking.status != #completed) {
          Runtime.trap("Only the booking user can review completed bookings");
        };
        let reviewId = bookingId.concat(caller.toText());
        reviews.add(reviewId, {
          id = reviewId;
          bookingId;
          user = caller;
          rating;
          reviewText;
          timestamp = Time.now();
        });
        reviewId;
      };
    };
  };

  public query func getReviewsForRoute(routeId : Text) : async [Review] {
    let allReviews = reviews.values().toArray();
    allReviews.filter(func(r) { r.bookingId == routeId });
  };

  public query func searchRoutesByOperator(operatorName : Text) : async [Route] {
    let allRoutes = routes.values().toArray();
    allRoutes.filter(func(r) { r.operatorName.contains(#text operatorName) });
  };

  public query func listRoutesByPriceRange(fromCents : Nat, toCents : Nat) : async [Route] {
    let allRoutes = routes.values().toArray();
    allRoutes.filter(func(r) { r.priceCents >= fromCents and r.priceCents <= toCents });
  };

  public query func getRoutesWithAvailableSchedule(afterTime : Time.Time) : async [Route] {
    let filteredRoutes = List.empty<Route>();
    let allRoutes = routes.values().toArray();
    for (route in allRoutes.values()) {
      let hasAvailableSlot = route.schedule.any(func(t) { t > afterTime });
      if (hasAvailableSlot) { filteredRoutes.add(route) };
    };
    filteredRoutes.toArray();
  };

  public query func searchRoutesByTimeRange(fromTime : Time.Time, toTime : Time.Time) : async [Route] {
    let filteredRoutes = List.empty<Route>();
    let allRoutes = routes.values().toArray();
    for (route in allRoutes.values()) {
      let hasMatchingSlot = route.schedule.any(func(t) { t >= fromTime and t <= toTime });
      if (hasMatchingSlot) { filteredRoutes.add(route) };
    };
    filteredRoutes.toArray();
  };

  public query func searchRoutesByOperatorAndType(operatorName : Text, transportType : TransportType) : async [Route] {
    routes.values().toArray().filter(func(r) { r.operatorName.contains(#text operatorName) and r.transportType == transportType });
  };
};
