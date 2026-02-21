import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  type TransportType = {
    #train;
    #bus;
    #taxi;
  };

  type RateBreakdown = {
    baseFare : Nat;
    taxes : Nat;
    serviceFees : Nat;
  };

  type Route = {
    transportType : TransportType;
    id : Text;
    operatorName : Text;
    routeName : Text;
    origin : Text;
    destination : Text;
    distanceKm : Nat;
    durationMinutes : Nat;
    schedule : [Time.Time];
    priceCents : Nat;
    rateBreakdown : RateBreakdown;
  };

  type Booking = {
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

  type Review = {
    id : Text;
    bookingId : Text;
    user : Principal;
    rating : Nat;
    reviewText : Text;
    timestamp : Time.Time;
  };

  type UserProfile = {
    firstName : Text;
    lastName : Text;
    email : Text;
    phone : Text;
  };

  type OldActor = {
    routes : Map.Map<Text, Route>;
    reviews : Map.Map<Text, Review>;
    bookings : Map.Map<Text, Booking>;
    stripeSessions : Map.Map<Text, Principal>;
    userProfiles : Map.Map<Principal, UserProfile>;
    stripeConfig : ?{
      secretKey : Text;
      allowedCountries : [Text];
    };
  };

  public func run(old : OldActor) : OldActor {
    old;
  };
};
