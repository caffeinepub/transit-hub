import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

module {
  type OldBooking = {
    id : Text;
    user : Principal;
    route : OldRoute;
    bookingTime : Time.Time;
    status : {
      #confirmed;
      #cancelled;
      #completed;
    };
    costInStripeCents : Nat;
  };

  type OldRoute = {
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
    rateBreakdown : {
      baseFare : Nat;
      taxes : Nat;
      serviceFees : Nat;
    };
  };

  type OldUserProfile = {
    firstName : Text;
    lastName : Text;
    email : Text;
    phone : Text;
  };

  type OldReview = {
    id : Text;
    bookingId : Text;
    user : Principal;
    rating : Nat;
    reviewText : Text;
    timestamp : Time.Time;
  };

  type OldActor = {
    routes : Map.Map<Text, OldRoute>;
    bookings : Map.Map<Text, OldBooking>;
    reviews : Map.Map<Text, OldReview>;
    stripeSessions : Map.Map<Text, Principal>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
  };

  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, { name : Text }>(
      func(_principal, oldUserProfile) {
        {
          name = oldUserProfile.firstName # " " # oldUserProfile.lastName;
        };
      }
    );
    { userProfiles = newUserProfiles };
  };
};
