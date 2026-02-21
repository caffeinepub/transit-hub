import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type OldRoute = {
    transportType : { #train; #bus; #taxi };
    id : Text;
    operatorName : Text;
    routeName : Text;
    origin : Text;
    destination : Text;
    distanceKm : Nat;
    durationMinutes : Nat;
    schedule : [Int];
    priceCents : Nat;
    rateBreakdown : {
      baseFare : Nat;
      taxes : Nat;
      serviceFees : Nat;
    };
  };

  type OldBooking = {
    id : Text;
    user : Principal;
    route : OldRoute;
    bookingTime : Int;
    status : { #confirmed; #cancelled; #completed };
    costInStripeCents : Nat;
  };

  type OldReview = {
    id : Text;
    bookingId : Text;
    user : Principal;
    rating : Nat;
    reviewText : Text;
    timestamp : Int;
  };

  type OldUserProfile = {
    firstName : Text;
    lastName : Text;
    email : Text;
    phone : Text;
  };

  type OldActor = {
    routes : Map.Map<Text, OldRoute>;
    reviews : Map.Map<Text, OldReview>;
    bookings : Map.Map<Text, OldBooking>;
    stripeSessions : Map.Map<Text, Principal>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    // Add more persistent state fields as needed
  };

  public func run(old : OldActor) : { routes : Map.Map<Text, OldRoute>; reviews : Map.Map<Text, OldReview>; bookings : Map.Map<Text, OldBooking>; stripeSessions : Map.Map<Text, Principal>; userProfiles : Map.Map<Principal, OldUserProfile> } {
    {
      routes = old.routes;
      reviews = old.reviews;
      bookings = old.bookings;
      stripeSessions = old.stripeSessions;
      userProfiles = old.userProfiles;
    };
  };
};
