import Array "mo:core/Array";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Order "mo:core/Order";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

actor {
  type ScoreEntry = {
    playerName : Text;
    kills : Nat;
    survivalTime : Nat; // in seconds
    timestamp : Int;
  };

  module ScoreEntry {
    public func compare(entry1 : ScoreEntry, entry2 : ScoreEntry) : Order.Order {
      switch (Nat.compare(entry2.kills, entry1.kills)) {
        case (#equal) { Nat.compare(entry2.survivalTime, entry1.survivalTime) };
        case (order) { order };
      };
    };
  };

  let entries = List.empty<ScoreEntry>();

  public shared ({ caller }) func submitScore(playerName : Text, kills : Nat, survivalTime : Nat) : async () {
    let newEntry : ScoreEntry = {
      playerName;
      kills;
      survivalTime;
      timestamp = Time.now();
    };

    // Add new entry to entries
    entries.add(newEntry);

    // Maintain max 100 entries
    let entriesArray = entries.toArray();
    if (entriesArray.size() > 100) {
      entries.clear();
      let sortedEntries = entriesArray.sort();
      let topEntries = Array.tabulate(100, func(i) { sortedEntries[i] });
      entries.addAll(topEntries.values());
    };
  };

  public query ({ caller }) func getTopScores() : async [ScoreEntry] {
    let entriesArray = (entries).toArray().sort();
    if (entriesArray.size() <= 20) {
      entriesArray;
    } else {
      Array.tabulate<ScoreEntry>(20, func(i) { entriesArray[i] });
    };
  };
};
