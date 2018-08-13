(function(angular) {
  angular
    .module("app", [])

    .filter("tag", function(tag) {
      return function(input, tg) {
        input = input || "";
        if (input.tag.indexOf("hype") !== -1) {
          console.log(input);
          console.log(this);
        }
      };
    })

    .controller("dataController", [
      "$scope",
      function($scope) {
        //mLab API Key - Un-mm4UdPQsFEX65W4eplZvLGtEBjJws

        //Show all databases for this API Key
        ///https://api.mlab.com/api/1/databases?apiKey=Un-mm4UdPQsFEX65W4eplZvLGtEBjJws

        //Show all collections for database
        //https://api.mlab.com/api/1/databases/eyecoin/collections?apiKey=Un-mm4UdPQsFEX65W4eplZvLGtEBjJws

        //Show all transactions(items) in a collection
        //https://api.mlab.com/api/1/databases/eyecoin/collections/transactions?apiKey=Un-mm4UdPQsFEX65W4eplZvLGtEBjJws

        //Initialize with Some Dummy Data.
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

        //Get previous transactions if available.
        var transactionLog = JSON.parse(localStorage.getItem("transactionLog"));

        if (transactionLog && transactionLog.length > 0) {
          console.log("Using localStorage transactionLog ", transactionLog);
          $scope.transactions = transactionLog;
        }

        $scope.convertData = function(data) {
          // data
          // 0:{_id: {…}, name: "Crota", price: "9.99", sold: "49.99", date: "2017-11-01T16:46:44.895Z", …}

          // { 112017 : date:

          // Data
          // convertedData
          // {5/2/2018 : {date: Wed May 02 2018 13:46:19 GMT-0400 (Eastern Daylight Time), exercises: Array(2), $$hashKey: "object:3", collapsed: true}}
          // mapped
          // [{date: Wed May 02 2018 13:46:19 GMT-0400 (Eastern Daylight Time), exercises: Array(2), $$hashKey: "object:3", collapsed: true}]

          var convertedData = {};

          // For each exercise
          // Get the date and set as Key
          // If it doesnt exist, create new exercises array
          // else push exercise
          for (var i = 0; i < $scope.transactions.length; i++) {
            var currentTransaction = $scope.transactions[i];
            var currentTransDate = new Date(currentTransaction.date);
            var currentTransMonthYear =
              currentTransDate.getMonth() +
              1 +
              "/" +
              (currentTransDate.getYear() + 1900);

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
            // console.log(key)
            // console.log($scope.convertedData[key])
            return $scope.convertedData[key];
          });
          console.log("$scope.days: ", $scope.days);
        };

        $scope.displayDate = function(date) {
          var date = new Date(date);

          return date.toLocaleDateString() + " " + date.toLocaleTimeString();
        };

        $scope.addItem = function() {
          var itemToAdd = {};
          itemToAdd.name = $scope.name;
          itemToAdd.price = $scope.price;
          itemToAdd.sold = $scope.sold;

          itemToAdd.date = new Date($scope.date) || new Date();
          itemToAdd.tags = ["hype"];
          // $scope.transactions.push(itemToAdd);
          console.log("addItem: ", itemToAdd, $scope.transactions);

          $.ajax({
            url:
              "https://api.mlab.com/api/1/databases/eyecoin/collections/transactions?apiKey=Un-mm4UdPQsFEX65W4eplZvLGtEBjJws",
            data: JSON.stringify(itemToAdd),
            type: "POST",
            contentType: "application/json"
          }).done(function() {
            // after successfully adding item, update localStorage

            $.ajax({
              url:
                "https://api.mlab.com/api/1/databases/eyecoin/collections/transactions?apiKey=Un-mm4UdPQsFEX65W4eplZvLGtEBjJws",
              type: "GET",
              contentType: "application/json"
            }).done(function(data) {
              //data is already a JSON object.

              //http://jimhoskins.com/2012/12/17/angularjs-and-apply.html
              $scope.$apply(function() {
                $scope.transactions = data;
                $scope.convertData();
              });

              localStorage.setItem(
                "transactionLog",
                JSON.stringify($scope.transactions)
              );
              console.log(
                "addItem: Successfully set localStorage transactionLog"
              );
            });
          });
        }; //.addItem

        $scope.updateItem = function(transaction) {
          console.log("updateItem: ", transaction);

          var b = "59e92c5abd966f5cb6d97386";

          var transID = transaction._id.$oid;

          var reqURL =
            "https://api.mlab.com/api/1/databases/eyecoin/collections/transactions/" +
            transID +
            "?apiKey=Un-mm4UdPQsFEX65W4eplZvLGtEBjJws";

          $.ajax({
            url: reqURL,
            data: JSON.stringify({ $set: { tags: ["succesful", "update"] } }),
            type: "PUT",
            contentType: "application/json"
          });

          // $.ajax( { url: reqURL,
          //           data: JSON.stringify(  { "$set" : { "tags" : ["succesful","update"] } } ),
          //           type: "PUT",
          //           contentType: "application/json" } );
        };

        $scope.updateItemTags = function(transaction, tags) {
          console.log("updateItemTags: ", transaction);
          var transID = transaction._id.$oid;

          var reqURL =
            "https://api.mlab.com/api/1/databases/eyecoin/collections/transactions/" +
            transID +
            "?apiKey=Un-mm4UdPQsFEX65W4eplZvLGtEBjJws";

          $.ajax({
            url: reqURL,
            data: JSON.stringify({ $set: { tags: tags } }),
            type: "PUT",
            contentType: "application/json"
          }).done(function() {
            alert("finished updateItemTags");
            console.log("updateItemTags: finished updateItemTags");
            $scope.getandSetTransactionsFromDatabase();
          });
        };

        // get transactions from database, and set as $scope data.
        $scope.getandSetTransactionsFromDatabase = function() {
          console.log("getandSetTransactionsFromDatabase:");
          $.ajax({
            url:
              "https://api.mlab.com/api/1/databases/eyecoin/collections/transactions?apiKey=Un-mm4UdPQsFEX65W4eplZvLGtEBjJws",
            type: "GET",
            contentType: "application/json"
          }).done(function(data) {
            //data is already a JSON object.

            //http://jimhoskins.com/2012/12/17/angularjs-and-apply.html
            $scope.$apply(function() {
              $scope.transactions = data;
              $scope.convertData();
            });
            console.log(
              "getandSetTransactionsFromDatabase: finished getTransactionsFromDatabase AJAX call. $scope.transactions",
              $scope.transactions
            );
            console.log($scope.days);
          });
        };
        $scope.getandSetTransactionsFromDatabase();

        $scope.deleteItem = function(transaction) {
          console.log("deleteItem: ", transaction);

          var transID = transaction._id.$oid;
          var indexToRemove = $scope.transactions.indexOf(transaction);
          console.log("deleteItem: indexToRemove:", indexToRemove);
          $scope.transactions.splice(indexToRemove, 1);

          var reqURL =
            "https://api.mlab.com/api/1/databases/eyecoin/collections/transactions/" +
            transID +
            "?apiKey=Un-mm4UdPQsFEX65W4eplZvLGtEBjJws";

          $.ajax({
            url: reqURL,
            type: "DELETE",
            async: true,
            timeout: 0
          }).done(function() {
            $scope.getandSetTransactionsFromDatabase();
            alert("done delete");
            localStorage.setItem(
              "transactionLog",
              JSON.stringify($scope.transactions)
            );
            console.log(
              "deleteItem: Finished deleting.  getandSetTransaction.  set localStorage"
            );
          });

          // console.log($scope.transactions);
        };

        $scope.populateTags = function(transaction) {
          // {}.date , name, price , tags, _id
          //$("tr[trans_id='59ee1d9ec2ef163e8f753e4f']")

          if (transaction) {
            if (transaction._id) {
            } else {
              console.log("No Id", transaction, $scope.transactions);
            }
            var transID = transaction._id.$oid;

            if (!transaction._id || transaction._id.$oid == undefined) {
              console.log("populateTags: undefined", transaction);
            }

            //console.log("populateTags: transID: ", transID);
            //console.log("populateTags: $(transID): ", $(transID));

            $("#" + transID).empty();

            //console.log("populateTags: transaction.tags", transaction.tags);
            new Taggle(transID, {
              tags: transaction.tags,

              onTagAdd: function(event, tag) {
                console.log("popuplateTags: onTagAdd: event, tag, this");
                console.log(event);
                console.log(tag);
                console.log(this);
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
              },

              id: transID
            });
          }
        };

        $scope.getTotalForList = function(transactions) {
          var sum = 0;
          for (var i = 0; i < transactions.length; i++) {
            if (!isNaN(parseFloat(transactions[i].price)))
              sum += parseFloat(transactions[i].price);
          }
          return sum;
        };

        $scope.getTotal1 = function(listName) {
          var sum = 0;
          for (var i = 0; i < $scope.transactions.length; i++) {
            if (isNaN(parseFloat($scope.transactions[i][listName])) === false)
              sum += parseFloat($scope.transactions[i][listName]);
          }
          return sum;
        };

        $scope.getTotal = function() {
          var sum = 0;
          for (var i = 0; i < $scope.transactions.length; i++) {
            if (isNaN(parseFloat($scope.transactions[i].price)) === false)
              sum += parseFloat($scope.transactions[i].price);
          }
          return sum;
        };

        $scope.getFlipInvestment = function() {
          var sum = 0;
          for (var i = 0; i < $scope.transactions.length; i++) {
            if (
              isNaN(parseFloat($scope.transactions[i].price)) === false &&
              $scope.transactions[i].sold > 0
            )
              sum += parseFloat($scope.transactions[i].price);
          }
          return sum;
        };

        $scope.getProfit = function() {
          return $scope.getTotal1("sold") - $scope.getTotal1("price");
        };
      }
    ]);
})(window.angular);
