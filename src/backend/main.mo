import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import Stripe "mo:caffeineai-stripe/stripe";

import Float "mo:core/Float";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";


actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ── Existing user profile types ──────────────────────────────────────────

  public type UserProfile = {
    name : Text;
  };

  // ── BizControl domain types ───────────────────────────────────────────────

  public type TransactionType = { #income; #expense };

  public type Transaction = {
    id : Text;
    amount : Float;
    category : Text;
    description : Text;
    transactionType : TransactionType;
    date : Text;
    notes : Text;
    userId : Principal;
    createdAt : Int;
  };

  public type InvoiceItem = {
    description : Text;
    quantity : Float;
    rate : Float;
    amount : Float;
  };

  public type Invoice = {
    id : Text;
    invoiceNumber : Text;
    businessName : Text;
    businessGst : Text;
    customerName : Text;
    customerAddress : Text;
    items : [InvoiceItem];
    subtotal : Float;
    gstRate : Float;
    gstAmount : Float;
    total : Float;
    date : Text;
    dueDate : Text;
    status : Text;
    userId : Principal;
    createdAt : Int;
  };

  public type QrCheckResult = { #safe; #suspicious; #warning };

  public type QrCheck = {
    id : Text;
    qrData : Text;
    upiId : Text;
    merchantName : Text;
    amount : ?Float;
    result : QrCheckResult;
    reason : Text;
    checkedAt : Int;
    userId : Principal;
  };

  public type AlertType = { #lowBalance; #unusualSpending; #pendingInvoice; #custom };

  public type Alert = {
    id : Text;
    alertType : AlertType;
    message : Text;
    isRead : Bool;
    createdAt : Int;
    userId : Principal;
  };

  public type BusinessProfile = {
    businessName : Text;
    gstId : Text;
    contactName : Text;
    email : Text;
    phone : Text;
    address : Text;
    planType : Text;
    userId : Principal;
  };

  public type AlertSettings = {
    lowBalanceThreshold : Float;
    unusualSpendingMultiplier : Float;
    pendingInvoiceDays : Nat;
  };

  // ── State ─────────────────────────────────────────────────────────────────

  let userProfiles = Map.empty<Principal, UserProfile>();
  let transactions = Map.empty<Principal, List.List<Transaction>>();
  let invoices = Map.empty<Principal, List.List<Invoice>>();
  let qrChecks = Map.empty<Principal, List.List<QrCheck>>();
  let alerts = Map.empty<Principal, List.List<Alert>>();
  let businessProfiles = Map.empty<Principal, BusinessProfile>();
  let alertSettings = Map.empty<Principal, AlertSettings>();
  let invoiceCounters = Map.empty<Principal, Nat>();

  // ── Existing user profile methods ─────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
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

  // ── Stripe integration ────────────────────────────────────────────────────

  var stripeConfig : ?Stripe.StripeConfiguration = null;

  public query func isStripeConfigured() : async Bool {
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

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // ── Internal helpers ──────────────────────────────────────────────────────

  func getUserTransactions(user : Principal) : List.List<Transaction> {
    switch (transactions.get(user)) {
      case (?list) { list };
      case (null) {
        let list = List.empty<Transaction>();
        transactions.add(user, list);
        list;
      };
    };
  };

  func getUserInvoicesList(user : Principal) : List.List<Invoice> {
    switch (invoices.get(user)) {
      case (?list) { list };
      case (null) {
        let list = List.empty<Invoice>();
        invoices.add(user, list);
        list;
      };
    };
  };

  func getUserAlertsList(user : Principal) : List.List<Alert> {
    switch (alerts.get(user)) {
      case (?list) { list };
      case (null) {
        let list = List.empty<Alert>();
        alerts.add(user, list);
        list;
      };
    };
  };

  func getUserPlan(user : Principal) : Text {
    switch (businessProfiles.get(user)) {
      case (?bp) { bp.planType };
      case (null) { "free" };
    };
  };

  // ── Alerts engine ─────────────────────────────────────────────────────────

  func generateAlerts(user : Principal) {
    let alertList = getUserAlertsList(user);
    let now = Time.now();

    let settings : AlertSettings = switch (alertSettings.get(user)) {
      case (?s) { s };
      case (null) {
        { lowBalanceThreshold = 1000.0; unusualSpendingMultiplier = 2.0; pendingInvoiceDays = 7 };
      };
    };

    let userTxs : [Transaction] = switch (transactions.get(user)) {
      case (?list) { list.toArray() };
      case (null) { [] };
    };

    let userInvs : [Invoice] = switch (invoices.get(user)) {
      case (?list) { list.toArray() };
      case (null) { [] };
    };

    // ── Low balance check ─────────────────────────────────────────────────
    var totalIncome : Float = 0.0;
    var totalExpense : Float = 0.0;
    for (tx in userTxs.values()) {
      switch (tx.transactionType) {
        case (#income) { totalIncome := totalIncome + tx.amount };
        case (#expense) { totalExpense := totalExpense + tx.amount };
      };
    };
    let balance = totalIncome - totalExpense;
    if (balance < settings.lowBalanceThreshold) {
      let existing = alertList.find(func(a : Alert) : Bool {
        a.alertType == #lowBalance and not a.isRead
      });
      if (existing == null) {
        alertList.add({
          id = now.toText() # "-lb-" # user.toText();
          alertType = #lowBalance;
          message = "Low balance: Current balance is " # balance.toText() # ", below threshold of " # settings.lowBalanceThreshold.toText();
          isRead = false;
          createdAt = now;
          userId = user;
        });
      };
    };

    // ── Unusual spending check ────────────────────────────────────────────
    var expenseCount : Nat = 0;
    var expenseTotal : Float = 0.0;
    for (tx in userTxs.values()) {
      switch (tx.transactionType) {
        case (#expense) { expenseCount := expenseCount + 1; expenseTotal := expenseTotal + tx.amount };
        case (#income) {};
      };
    };
    if (expenseCount > 0) {
      let avgExpense = expenseTotal / expenseCount.toFloat();
      let threshold = avgExpense * settings.unusualSpendingMultiplier;
      for (tx in userTxs.values()) {
        switch (tx.transactionType) {
          case (#expense) {
            if (tx.amount > threshold) {
              let existing = alertList.find(func(a : Alert) : Bool {
                a.alertType == #unusualSpending and not a.isRead
              });
              if (existing == null) {
                alertList.add({
                  id = now.toText() # "-us-" # user.toText();
                  alertType = #unusualSpending;
                  message = "Unusual spending: " # tx.amount.toText() # " in '" # tx.category # "' is " # settings.unusualSpendingMultiplier.toText() # "x above avg " # avgExpense.toText();
                  isRead = false;
                  createdAt = now;
                  userId = user;
                });
              };
            };
          };
          case (#income) {};
        };
      };
    };

    // ── Pending invoice check ─────────────────────────────────────────────
    let dayNs : Int = 86_400_000_000_000;
    let pendingThresholdNs : Int = Int.fromNat(settings.pendingInvoiceDays) * dayNs;
    for (inv in userInvs.values()) {
      if (inv.status == "pending" and (now - inv.createdAt) > pendingThresholdNs) {
        let existing = alertList.find(func(a : Alert) : Bool {
          a.alertType == #pendingInvoice and not a.isRead
        });
        if (existing == null) {
          alertList.add({
            id = now.toText() # "-pi-" # user.toText();
            alertType = #pendingInvoice;
            message = "Overdue invoice: " # inv.invoiceNumber # " for " # inv.customerName # " pending over " # settings.pendingInvoiceDays.toText() # " days";
            isRead = false;
            createdAt = now;
            userId = user;
          });
        };
      };
    };
  };

  // ── Transaction methods ───────────────────────────────────────────────────

  public shared ({ caller }) func addTransaction(tx : Transaction) : async { #ok : Text; #err : Text } {
    let userTxList = getUserTransactions(caller);
    if (getUserPlan(caller) == "free" and userTxList.size() >= 50) {
      return #err("Free plan limit: maximum 50 transactions. Upgrade to add more.");
    };
    let now = Time.now();
    let txId = now.toText() # "-" # caller.toText();
    userTxList.add({ tx with id = txId; userId = caller; createdAt = now });
    generateAlerts(caller);
    #ok(txId);
  };

  public query ({ caller }) func getTransactions() : async [Transaction] {
    switch (transactions.get(caller)) {
      case (?list) { list.toArray() };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func updateTransaction(id : Text, tx : Transaction) : async { #ok : Text; #err : Text } {
    let userTxList = getUserTransactions(caller);
    var found = false;
    userTxList.mapInPlace(func(existing : Transaction) : Transaction {
      if (existing.id == id and Principal.equal(existing.userId, caller)) {
        found := true;
        { tx with id = id; userId = caller; createdAt = existing.createdAt };
      } else {
        existing;
      };
    });
    if (found) {
      generateAlerts(caller);
      #ok("Transaction updated");
    } else {
      #err("Transaction not found");
    };
  };

  public shared ({ caller }) func deleteTransaction(id : Text) : async { #ok : Text; #err : Text } {
    switch (transactions.get(caller)) {
      case (null) { #err("Transaction not found") };
      case (?list) {
        let sizeBefore = list.size();
        let filtered = list.filter(func(tx : Transaction) : Bool { tx.id != id });
        list.clear();
        list.append(filtered);
        if (list.size() < sizeBefore) {
          generateAlerts(caller);
          #ok("Transaction deleted");
        } else {
          #err("Transaction not found");
        };
      };
    };
  };

  // ── Invoice methods ───────────────────────────────────────────────────────

  public shared ({ caller }) func addInvoice(invoice : Invoice) : async { #ok : Text; #err : Text } {
    let userInvList = getUserInvoicesList(caller);
    if (getUserPlan(caller) == "free" and userInvList.size() >= 5) {
      return #err("Free plan limit: maximum 5 invoices. Upgrade to add more.");
    };
    let now = Time.now();
    let invId = now.toText() # "-inv-" # caller.toText();
    let counter = switch (invoiceCounters.get(caller)) {
      case (?c) { c + 1 };
      case (null) { 1 };
    };
    invoiceCounters.add(caller, counter);
    let invNumber = "INV-" # counter.toText();
    userInvList.add({ invoice with id = invId; invoiceNumber = invNumber; userId = caller; createdAt = now });
    generateAlerts(caller);
    #ok(invId);
  };

  public query ({ caller }) func getInvoices() : async [Invoice] {
    switch (invoices.get(caller)) {
      case (?list) { list.toArray() };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func updateInvoice(id : Text, invoice : Invoice) : async { #ok : Text; #err : Text } {
    let userInvList = getUserInvoicesList(caller);
    var found = false;
    userInvList.mapInPlace(func(existing : Invoice) : Invoice {
      if (existing.id == id and Principal.equal(existing.userId, caller)) {
        found := true;
        { invoice with id = id; userId = caller; createdAt = existing.createdAt; invoiceNumber = existing.invoiceNumber };
      } else {
        existing;
      };
    });
    if (found) {
      generateAlerts(caller);
      #ok("Invoice updated");
    } else {
      #err("Invoice not found");
    };
  };

  public shared ({ caller }) func deleteInvoice(id : Text) : async { #ok : Text; #err : Text } {
    switch (invoices.get(caller)) {
      case (null) { #err("Invoice not found") };
      case (?list) {
        let sizeBefore = list.size();
        let filtered = list.filter(func(inv : Invoice) : Bool { inv.id != id });
        list.clear();
        list.append(filtered);
        if (list.size() < sizeBefore) {
          generateAlerts(caller);
          #ok("Invoice deleted");
        } else {
          #err("Invoice not found");
        };
      };
    };
  };

  // ── QR check methods ──────────────────────────────────────────────────────

  func extractParam(queryStr : Text, param : Text) : ?Text {
    let parts = queryStr.split(#char '&');
    var found : ?Text = null;
    parts.forEach(func(part : Text) {
      let kvArr = part.split(#char '=').toArray();
      if (kvArr.size() >= 2 and kvArr[0] == param) {
        found := ?kvArr[1];
      };
    });
    found;
  };

  func isValidUpiId(upiId : Text) : Bool {
    if (upiId.size() == 0) return false;
    let parts = upiId.split(#char '@').toArray();
    if (parts.size() != 2) return false;
    let prefix = parts[0];
    let suffix = parts[1];
    if (prefix.size() == 0 or suffix.size() == 0) return false;
    let isSuspicious = func(c : Char) : Bool {
      not ((c >= 'a' and c <= 'z') or (c >= 'A' and c <= 'Z') or
           (c >= '0' and c <= '9') or c == '.' or c == '_' or c == '-')
    };
    not (prefix.toIter().any(isSuspicious) or suffix.toIter().any(isSuspicious));
  };

  public shared ({ caller }) func addQrCheck(check : QrCheck) : async { #ok : Text; #err : Text } {
    let qrData = check.qrData;
    let (upiId, merchantName, amount, qrResult, reason) : (Text, Text, ?Float, QrCheckResult, Text) =
      if (qrData.contains(#text "upi://pay")) {
        let ps = qrData.split(#char '?').toArray();
        let afterQ = if (ps.size() >= 2) ps[1] else "";
        let extractedUpiId = switch (extractParam(afterQ, "pa")) { case (?v) v; case null "" };
        let extractedMerchant = switch (extractParam(afterQ, "pn")) { case (?v) v; case null "" };
        let extractedAmount : ?Float = switch (extractParam(afterQ, "am")) {
          case (?v) {
            let dotParts = v.split(#char '.').toArray();
            switch (Nat.fromText(dotParts[0])) {
              case (?intPart) {
                if (dotParts.size() >= 2) {
                  switch (Nat.fromText(dotParts[1])) {
                    case (?fracPart) {
                      let divisor = label pw : Float {
                        var d : Float = 1.0;
                        var i = 0;
                        while (i < dotParts[1].size()) { d := d * 10.0; i += 1 };
                        break pw d;
                      };
                      ?(intPart.toFloat() + fracPart.toFloat() / divisor);
                    };
                    case null ?intPart.toFloat();
                  };
                } else { ?intPart.toFloat() };
              };
              case null null;
            };
          };
          case null null;
        };
        let amountVal : Float = switch (extractedAmount) { case (?f) f; case null 0.0 };
        let (cr, rr) : (QrCheckResult, Text) =
          if (not isValidUpiId(extractedUpiId)) (#suspicious, "UPI ID appears malformed")
          else if (extractedMerchant.size() == 0) (#warning, "Merchant name missing from QR")
          else if (amountVal <= 0.0) (#warning, "Amount is zero or missing")
          else (#safe, "Valid UPI QR with merchant and amount");
        (extractedUpiId, extractedMerchant, extractedAmount, cr, rr);
      } else {
        (check.upiId, check.merchantName, check.amount, #warning, "Not a UPI payment QR");
      };

    let now = Time.now();
    let checkId = now.toText() # "-qr-" # caller.toText();
    let enriched : QrCheck = {
      check with id = checkId; upiId = upiId; merchantName = merchantName;
      amount = amount; result = qrResult; reason = reason; checkedAt = now; userId = caller;
    };
    let userChecks = switch (qrChecks.get(caller)) {
      case (?existing) existing;
      case null List.empty<QrCheck>();
    };
    let newList = List.empty<QrCheck>();
    newList.add(enriched);
    newList.append(userChecks);
    qrChecks.add(caller, newList);
    #ok(checkId);
  };

  public query ({ caller }) func getQrChecks() : async [QrCheck] {
    switch (qrChecks.get(caller)) {
      case (?list) { list.toArray() };
      case (null) { [] };
    };
  };

  // ── Alert methods ─────────────────────────────────────────────────────────

  public query ({ caller }) func getAlerts() : async [Alert] {
    switch (alerts.get(caller)) {
      case (?list) { list.toArray() };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func markAlertRead(id : Text) : async { #ok : Text; #err : Text } {
    switch (alerts.get(caller)) {
      case (null) { #err("Alert not found") };
      case (?list) {
        var found = false;
        list.mapInPlace(func(alert : Alert) : Alert {
          if (alert.id == id) { found := true; { alert with isRead = true } }
          else { alert };
        });
        if (found) { #ok("Alert marked as read") } else { #err("Alert not found") };
      };
    };
  };

  public shared ({ caller }) func dismissAlert(id : Text) : async { #ok : Text; #err : Text } {
    switch (alerts.get(caller)) {
      case (null) { #err("Alert not found") };
      case (?list) {
        let sizeBefore = list.size();
        let filtered = list.filter(func(alert : Alert) : Bool { alert.id != id });
        list.clear();
        list.append(filtered);
        if (list.size() < sizeBefore) { #ok("Alert dismissed") }
        else { #err("Alert not found") };
      };
    };
  };

  // ── Business profile methods ──────────────────────────────────────────────

  public shared ({ caller }) func saveBusinessProfile(profile : BusinessProfile) : async { #ok : Text; #err : Text } {
    businessProfiles.add(caller, { profile with userId = caller });
    #ok("Business profile saved");
  };

  public query ({ caller }) func getBusinessProfile() : async ?BusinessProfile {
    businessProfiles.get(caller);
  };

  // ── Alert settings methods ────────────────────────────────────────────────

  public shared ({ caller }) func saveAlertSettings(settings : AlertSettings) : async { #ok : Text; #err : Text } {
    alertSettings.add(caller, settings);
    generateAlerts(caller);
    #ok("Alert settings saved");
  };

  public query ({ caller }) func getAlertSettings() : async ?AlertSettings {
    switch (alertSettings.get(caller)) {
      case (?s) { ?s };
      case (null) {
        ?{ lowBalanceThreshold = 1000.0; unusualSpendingMultiplier = 2.0; pendingInvoiceDays = 7 };
      };
    };
  };
};
