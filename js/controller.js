// var app = angular.filter("tag", function(tag) {
//   return function(input, tg) {
//     input = input || "";
//     if (input.tag.indexOf("hype") !== -1) {
//       console.log(input);
//       console.log(this);
//     }
//   };
// });

app.controller("dataController", [
  "$scope",
  "calcHelper",
  function($scope, calcHelper) {
    //mLab API Key - Un-mm4UdPQsFEX65W4eplZvLGtEBjJws

    //Show all databases for this API Key
    ///https://api.mlab.com/api/1/databases?apiKey=Un-mm4UdPQsFEX65W4eplZvLGtEBjJws

    //Show all collections for database
    //https://api.mlab.com/api/1/databases/eyecoin/collections?apiKey=Un-mm4UdPQsFEX65W4eplZvLGtEBjJws

    //Show all transactions(items) in a collection
    //https://api.mlab.com/api/1/databases/eyecoin/collections/transactions?apiKey=Un-mm4UdPQsFEX65W4eplZvLGtEBjJws

    //Initialize with Some Dummy Data.
    // [] => .name , .price, .date, .sold, .tags
    $scope.transactions = [
      {
        name: "Supreme Example",
        price: 120,
        date: new Date("10/17/17 19:27"),
        tags: ["hype", "flip"]
      },
      {
        name: "Kith Example",
        price: 100,
        date: new Date("10/17/17 19:28:01"),
        tags: ["hype", "flip"]
      }
    ];
    $scope.cH = calcHelper;
    // console.log("$scope ", $scope)
    // console.log(
    //   "$scope.cH = calcHelper , calcHelper.getTotalForMonthYear($scope.transactions, 'price')",
    //   calcHelper,
    //   calcHelper.getTotalForMonthYear($scope.transactions, "price")
    // );
    //Get previous transactions if available.
    var transactionLog = JSON.parse(localStorage.getItem("transactionLog"));

    if (transactionLog && transactionLog.length > 0) {
      console.log("Using localStorage transactionLog ", transactionLog);
      $scope.transactions = transactionLog;
    }

    // Called after addingItem, or updatingItemTags.
    // Get transactions from database, and set as $scope data.
    $scope.getDBTransactions = function() {
      console.log("getDBTransactions: calling AJAX");
      $.ajax({
        url:
          "https://api.mlab.com/api/1/databases/eyecoin/collections/transactions?apiKey=Un-mm4UdPQsFEX65W4eplZvLGtEBjJws",
        type: "GET",
        contentType: "application/json"
      }).done(function(data) {
        $scope.$apply(function() {
          $scope.transactions = data;
          $scope.convertData();

          // Format for Calendar
          // {
          //   title: "Eddie Bauer Flannel", // The title of the event
          //   type: "info",
          //   startsAt: new Date("9/1/2018 11:00"),
          //   endsAt: new Date("9/1/2018 12:00"),
          //   editable: false,
          //   deletable: false,
          //   incrementsBadgeTotal: true,
          //   price: 3.89
          // },
          $scope.mappedCalendar = $scope.transactions.map(function(trans) {
            var mapped = {};
            mapped.title = trans.name;
            mapped.startsAt = new Date(trans.date);
            mapped.editable = false;
            mapped.deletable = false;
            mapped.incrementsBadgeTotal = true;
            mapped.price = trans.price;

            return mapped;
          });
        });
        console.log(
          "getDBTransactions: finished AJAX call. $scope.transactions",
          $scope.transactions,
          "$scope.days",
          $scope.days
        );
      });
    };

    $scope.getDBTransactions();

    // Make a seprate array that each element is a Day with transactions
    $scope.convertData = function(data) {
      // data
      // 0:{_id: {…}, name: "Crota", price: "9.99", sold: "49.99", date: "2017-11-01T16:46:44.895Z", …}
      // convertedData
      // { 11/2017 : {date: Wed Nov 01 2017 12:46:44 GMT-0400 (Eastern Daylight Time), monthYear: "11/2017", transactions: Array(11), $$hashKey: "object:5"}}
      // days
      // [{date: Wed Nov 01 2017 12:46:44 GMT-0400 (Eastern Daylight Time), monthYear: "11/2017", transactions: Array(11), $$hashKey: "object:5"}]

      var convertedData = {};

      for (var i = 0; i < $scope.transactions.length; i++) {
        var currentTransaction = $scope.transactions[i];
        var currentTransDate = new Date(currentTransaction.date);
        var currentTransMonthYear =
          currentTransDate.getMonth() +
          1 +
          "/" +
          (currentTransDate.getYear() + 1900);

        // If MonthYear not defined, add first transAction.  else push
        if (convertedData[currentTransMonthYear] === undefined) {
          var transActionData = {};
          transActionData.date = currentTransDate;
          transActionData.monthYear = currentTransMonthYear;
          transActionData.transactions = [];
          transActionData.transactions.push(currentTransaction);

          convertedData[currentTransMonthYear] = transActionData;
        } else {
          convertedData[currentTransMonthYear].transactions.push(
            currentTransaction
          );
        }
      }

      $scope.convertedData = convertedData;
      console.log("$scope.convertedData: ", $scope.convertedData);

      $scope.days = Object.keys($scope.convertedData).map(function(key) {
        // Take Date Key 5/2/2018
        // Create Array of Objects with date and exercises
        return $scope.convertedData[key];
      });

      // [{date: Wed Nov 01 2017 12:46:44 GMT-0400 (Eastern Daylight Time), monthYear: "11/2017", transactions: Array(11), $$hashKey: "object:5"}]
      $scope.days = $scope.days.map(function(day) {
        // For each day, create a .tags property that is an object with keys: tag, object: array of transactions
        var tagged = {};

        day.transactions.forEach(function(trans) {
          // Get each transaction
          if (trans.tags) {
            // For each tag, add that transaction to tag
            trans.tags.forEach(function(tag) {
              tag = tag.trimStart().trimEnd();

              if (!tagged[tag]) {
                tagged[tag] = [];
              }
              tagged[tag].push(trans);
            });

            day.tags = tagged;
          } else {
            console.log("No tags for ", trans, day);
          }
        });
        console.log("Mapped tags");
        return day;
      });

      console.log("$scope.days: ", $scope.days);
      $scope.convertDataWeek();
    };

    $scope.convertDataWeek = function(data) {
      var convertedData = {};

      for (var i = 0; i < $scope.transactions.length; i++) {
        var currentTransaction = $scope.transactions[i];
        var currentTransDate = new Date(currentTransaction.date);

        var currentTransWeek =
          currentTransDate.getYear() + 1900 + "|" + currentTransDate.getWeek();

        // If MonthYear not defined, add first transAction.  else push
        if (convertedData[currentTransWeek] === undefined) {
          var transActionData = {};
          transActionData.date = currentTransDate;
          transActionData.week = currentTransWeek;
          transActionData.transactions = [];
          transActionData.transactions.push(currentTransaction);

          convertedData[currentTransWeek] = transActionData;
        } else {
          convertedData[currentTransWeek].transactions.push(currentTransaction);
        }
      }

      // $scope.convertedData = convertedData;
      console.log("$scope.convertDataWeek: convertedData", convertedData);

      $scope.weeks = Object.keys($scope.convertedData).map(function(key) {
        // Take Date Key 5/2/2018
        // Create Array of Objects with date and exercises
        return $scope.convertedData[key];
      });
      console.log("$scope.weeks: ", $scope.weeks);
    };

    // Private method that creates object with properties from $scope.inputs.  Passes this object to DB
    // {}.name , .price, .sold, .date, .tags
    // Used in addItem/updateItem
    function composeTransaction() {
      var transaction = {};
      transaction.name = $scope.name || "Unnamed";
      transaction.price = $scope.price || 0;
      transaction.sold = $scope.sold || 0;

      // Create itemDate from $scope inputs
      var itemDate;
      if ($scope.date) {
        //Mon Aug 20 2018 00:00:00 GMT-0400 (Eastern Daylight Time) Object
        var itemDate = new Date($scope.date);

        if ($scope.dateTime) {
          console.log("$scope.dateTime ", $scope.dateTime);
          if ($scope.dateTime.indexOf(":") !== -1) {
            var time = $scope.dateTime.split(":");
            var hour = time[0];
            var min = time[1];

            itemDate.setHours(hour);
            itemDate.setMinutes(min);
          } else {
            console.log("composeTransaction: invalid dateTime");
          }
        } else {
          console.log("composeTransaction: no dateTime.  set to 12");
        }
        console.log("composeTransaction: itemDate ", itemDate);
        transaction.date = itemDate;
      } else {
        transaction.date = new Date();
      }

      if ($scope.tags) {
        console.log("$scope.tags ", $scope.tags);

        if (typeof $scope.tags === "string") {
          transaction.tags = $scope.tags.split(",");
        }
      } else {
        console.log("composeTransaction: no tags, adding hype");
        transaction.tags = ["hype"];
      }

      return transaction;
    }

    // Called when Adding an item.  Adds to Database.
    $scope.addItem = function() {
      var itemToAdd = {};
      itemToAdd = composeTransaction();
      itemToAdd.created = new Date();
      console.log("addItem: itemToAdd ", itemToAdd);

      $.ajax({
        url:
          "https://api.mlab.com/api/1/databases/eyecoin/collections/transactions?apiKey=Un-mm4UdPQsFEX65W4eplZvLGtEBjJws",
        data: JSON.stringify(itemToAdd),
        type: "POST",
        contentType: "application/json"
      }).done(function() {
        // after successfully adding item, update localStorage
        // ajax called must be called so id can be saved in localStorage

        $.ajax({
          url:
            "https://api.mlab.com/api/1/databases/eyecoin/collections/transactions?apiKey=Un-mm4UdPQsFEX65W4eplZvLGtEBjJws",
          type: "GET",
          contentType: "application/json"
        }).done(function(data) {
          $scope.$apply(function() {
            $scope.transactions = data;
            $scope.convertData();
          });
          localStorage.setItem(
            "transactionLog",
            JSON.stringify($scope.transactions)
          );
          console.log(
            "addItem: Successfully set localStorage transactionLog",
            $scope.transactions
          );
        });
      });
    };

    // Called after fields have been filled in.
    $scope.updateItem = function() {
      console.log("updateItem: $scope.transactionId", $scope.transactionId);

      var transactionToUpdate = composeTransaction();
      transactionToUpdate.lastUpdated = new Date();

      var transID = $scope.transactionId;

      //PUT /databases/{database}/collections/{collection}/{_id}
      var reqURL =
        "https://api.mlab.com/api/1/databases/eyecoin/collections/transactions/" +
        transID +
        "?apiKey=Un-mm4UdPQsFEX65W4eplZvLGtEBjJws";

      $.ajax({
        url: reqURL,
        data: JSON.stringify({ $set: transactionToUpdate }),
        type: "PUT",
        contentType: "application/json"
      }).done(function() {
        $.ajax({
          url:
            "https://api.mlab.com/api/1/databases/eyecoin/collections/transactions?apiKey=Un-mm4UdPQsFEX65W4eplZvLGtEBjJws",
          type: "GET",
          contentType: "application/json"
        }).done(function(data) {
          $scope.$apply(function() {
            $scope.transactions = data;
            $scope.convertData();
          });
          localStorage.setItem(
            "transactionLog",
            JSON.stringify($scope.transactions)
          );
          console.log(
            "updateItem: Successfully set localStorage transactionLog"
          );
        });
      });
    };

    // Called when transaction name is clicked on
    // Highlights row, and populates data for easy update
    // Deselects and clears inputs if clicked again
    $scope.fillTransactionInfo = function(transaction, $event) {
      // Compare Last Selected w/ Clicked

      // Get Last Selected Row TR/TD.edit-selected
      var $lastSelected = $(".edit-selected").parent();
      var lastSelectedId = $lastSelected.find(".tag").attr("id");

      var $clickedRow = $($event.currentTarget).parent();
      var clickedId = $clickedRow.find(".tag").attr("id");

      //console.log(lastSelectedId, clickedId);

      // Unhighlight last selected
      $(".edit-selected").removeClass("edit-selected");

      // Same Transaction clicked, clearInput, remove highlights
      if (lastSelectedId === clickedId) {
        // console.log(
        //   "fillTransactionInfo: lastSelectedId===clickedId",
        //   clickedId
        // );
        clearTransactionInputs();

        $scope.editMode = false;
      }

      // Diff transaction, populate transaction, highlight
      else {
        $clickedRow.find("td").addClass("edit-selected");

        var date = new Date(transaction.date);
        $scope.date = date;
        $scope.dateTime = date.getHours() + ":" + date.getMinutes();

        $scope.name = transaction.name;
        $scope.price = transaction.price;
        $scope.sold = transaction.sold;

        $scope.tags = transaction.tags;

        //fill hidden input
        $scope.transactionId = transaction._id.$oid;

        $scope.editMode = true;
      }
    };

    // Private helper method for deselecting transaction from edit
    function clearTransactionInputs() {
      $scope.date = null;
      $scope.dateTime = null;
      $scope.name = null;
      $scope.price = null;
      $scope.sold = null;
      $scope.tags = null;

      //clear hidden input
      $scope.transactionId = null;
    }

    // Create Taggle Tags on browser.
    // has onTagAdd, onTagRemove methods
    $scope.populateTags = function(transaction) {
      // {}.date , name, price , tags, _id

      if (transaction) {
        if (!transaction._id) {
          console.log("No Id", transaction, $scope.transactions);
        }
        if (transaction._id === "undefined") {
          // console.log("transaction._id === undefined ", transaction);
          return;
        }
        var transID = transaction._id.$oid;

        // console.log("populateTags: transID: ", transID);
        // console.log("populateTags: $(transID): ", $(transID));

        // Clear Cell so tags can be added
        $("#" + transID).empty();
        // Create Taggle. First Param is id.
        //console.log("populateTags: transaction.tags", transaction.tags);
        new Taggle(transID, {
          tags: transaction.tags,

          onTagAdd: function(event, tag) {
            console.log(
              "populateTags: onTagAdd: event, tag, this",
              event,
              tag,
              this
            );
            transaction.tags.push(tag);
            //console.log(transaction.tags.push(tag));
            console.log(
              "populateTags: onTagAdd: transaction.tags",
              transaction.tags
            );
            console.log("populateTags: onTagAdd: $scope.updateItemTags");
            $scope.updateItemTags(transaction, transaction.tags);
          },

          onTagRemove: function(event, tag) {
            var indexToRemove = transaction.tags.indexOf(tag);
            console.log("popuplateTag: onTagRemove: tag", tag);
            transaction.tags.splice(indexToRemove, 1);
            console.log("populateTag: onTagRemove: $scope.updateItemTags");
            $scope.updateItemTags(transaction, transaction.tags);
          }
        });
      }
    };

    // Called when tag is added or removed
    $scope.updateItemTags = function(transaction, newTags) {
      console.log("updateItemTags: ", transaction, newTags);
      var transID = transaction._id.$oid;

      var reqURL =
        "https://api.mlab.com/api/1/databases/eyecoin/collections/transactions/" +
        transID +
        "?apiKey=Un-mm4UdPQsFEX65W4eplZvLGtEBjJws";

      var currentTime = new Date();

      $.ajax({
        url: reqURL,
        data: JSON.stringify({
          $set: { tags: newTags, lastUpdated: currentTime }
        }),
        type: "PUT",
        contentType: "application/json"
      }).done(function() {
        alert("finished updateItemTags");
        console.log("updateItemTags: finished updateItemTags");
        $scope.getDBTransactions();
      });
    };

    // Asks users whether to delete
    // Remove locally, then remove from DB
    $scope.deleteItem = function(transaction) {
      var deleteItem = confirm("Delete Item?");
      if (deleteItem) {
        console.log("deleteItem: deleting item", transaction);

        // Remove locally
        var indexToRemove = $scope.transactions.indexOf(transaction);
        console.log("deleteItem: indexToRemove:", indexToRemove);
        $scope.transactions.splice(indexToRemove, 1);

        // Remove from DB
        var transID = transaction._id.$oid;
        var reqURL =
          "https://api.mlab.com/api/1/databases/eyecoin/collections/transactions/" +
          transID +
          "?apiKey=Un-mm4UdPQsFEX65W4eplZvLGtEBjJws";

        $.ajax({
          url: reqURL,
          type: "DELETE",
          async: true,
          timeout: 0
        })
          .done(function() {
            $scope.getDBTransactions();
            alert("done delete");
            localStorage.setItem(
              "transactionLog",
              JSON.stringify($scope.transactions)
            );
            console.log(
              "deleteItem: Finished deleting.  getandSetTransaction.  set localStorage",
              $scope.transactions
            );
          })
          .fail(function(data) {
            console.log("deleteItem: failed. data", data);
          });

        // console.log($scope.transactions);
      } else {
        console.log("deleteItem: not deleting");
      }
    };

    // Count flip count and investment.  Add transaction when sold has a value.
    $scope.getOverallFlip = function() {
      var flip = {};
      flip.sum = 0;
      flip.count = 0;
      for (var i = 0; i < $scope.transactions.length; i++) {
        var price = parseFloat($scope.transactions[i].price);
        var validPrice = !isNaN(price);
        var isAFlip = parseFloat($scope.transactions[i].sold) > 0;

        if (validPrice && isAFlip) {
          flip.sum += price;
          flip.count++;
        }
      }
      return flip;
    };

    // Calendar properties
    $scope.calendarView = "month";
    $scope.calendarDay = new Date();
    $scope.tester = "Is the Controller connecting";
    $scope.events = [
      {
        title: "Eddie Bauer Flannel", // The title of the event
        type: "info",
        startsAt: new Date("9/1/2018 11:00"),
        endsAt: new Date("9/1/2018 12:00"),
        editable: false,
        deletable: false,
        incrementsBadgeTotal: true,
        price: 3.89
      },
      {
        title: "Toll", // The title of the event
        type: "info",
        startsAt: new Date("9/1/2018 11:00"),
        endsAt: new Date("9/1/2018 12:00"),
        editable: false,
        deletable: false,
        incrementsBadgeTotal: true,
        price: 2.6
      },
      {
        title: "Ralph Lauren Polo", // The title of the event
        type: "info",
        startsAt: new Date("9/1/2018 11:00"),
        endsAt: new Date("9/1/2018 12:00"),
        editable: false,
        deletable: false,
        incrementsBadgeTotal: true,
        price: 0.91
      },
      {
        title: "Wells Fargo", // The title of the event
        type: "info",
        startsAt: new Date("9/9/2018 11:00"),
        endsAt: new Date("9/9/2018 12:00"),
        editable: false,
        deletable: false,
        incrementsBadgeTotal: true,
        price: 15
      }
    ];
    $scope.cellModifier = function(cell) {
      // console.log(cell);

      if (cell.events.length > 0) {
        // console.log(cell);
        console.log(cell.events);

        var sum = 0;

        for (var i = 0; i < cell.events.length; i++) {
          sum += parseFloat(cell.events[i].price);
        }
        cell.label = "$" + sum + " | " + cell.events.length;
      }
    };

    // Tag Method
    $scope.getKeyByValue = function(object, value) {
      return Object.keys(object).find(key => object[key] === value);
    };
  }
]);
