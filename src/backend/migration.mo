import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  // Old type definitions
  public type OldRoute = {
    transportType : {
      #train;
      #bus;
      #taxi;
    };
    id : Text;
    operatorName : Text;
    routeName : Text;
    schedule : [Time.Time];
    priceCents : Nat;
  };

  public type OldBooking = {
    id : Text;
    user : Principal;
    route : {
      transportType : {
        #train;
        #bus;
        #taxi;
      };
      id : Text;
      operatorName : Text;
      routeName : Text;
      schedule : [Time.Time];
      priceCents : Nat;
    };
    bookingTime : Time.Time;
    status : {
      #confirmed;
      #cancelled;
      #completed;
    };
    costInStripeCents : Nat;
  };

  public type OldActor = {
    routes : Map.Map<Text, OldRoute>;
    bookings : Map.Map<Text, OldBooking>;
  };

  // New type definitions
  public type NewRoute = {
    transportType : {
      #train;
      #bus;
      #taxi;
    };
    id : Text;
    operatorName : Text;
    routeName : Text;
    origin : Text;
    destination : Text;
    distanceKm : Nat;
    durationMinutes : Nat;
    schedule : [Time.Time];
    priceCents : Nat;
  };

  public type NewBooking = {
    id : Text;
    user : Principal;
    route : NewRoute;
    bookingTime : Time.Time;
    status : {
      #confirmed;
      #cancelled;
      #completed;
    };
    costInStripeCents : Nat;
  };

  public type NewActor = {
    routes : Map.Map<Text, NewRoute>;
    bookings : Map.Map<Text, NewBooking>;
  };

  // Transformation functions
  func transformRouteToNew(oldRoute : OldRoute) : NewRoute {
    {
      oldRoute with
      origin = "";
      destination = "";
      distanceKm = 0;
      durationMinutes = 0;
    };
  };

  func transformBookingToNew(oldBooking : OldBooking) : NewBooking {
    {
      oldBooking with
      route = transformRouteToNew(oldBooking.route);
    };
  };

  // Main migration function
  public func run(old : OldActor) : NewActor {
    let newRoutes = old.routes.map<Text, OldRoute, NewRoute>(
      func(_id, oldRoute) {
        transformRouteToNew(oldRoute);
      }
    );

    let newBookings = old.bookings.map<Text, OldBooking, NewBooking>(
      func(_id, oldBooking) {
        transformBookingToNew(oldBooking);
      }
    );

    {
      routes = newRoutes;
      bookings = newBookings;
    };
  };
};
