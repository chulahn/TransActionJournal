var app = angular.module("app", []);
app.factory("calcHelper", function() {
  return {
    // Gets sum of a list from transactions.  e.g. "11/2017.transactions, $scope.transactions , 'sold'"
    getTotal: function(transactions, listName) {
      var sum = 0;
      if (!transactions) {
        console.log(listName);
      }
      for (var i = 0; i < transactions.length; i++) {
        var data = parseFloat(transactions[i][listName]);
        var dataIsValidFloat = !isNaN(data);
        if (dataIsValidFloat) sum += data;
      }
      return sum;
    },
    // Gets Net(sold-price)
    getNetPrice: function(transactions) {
      return (
        this.getTotal(transactions, "sold") -
        this.getTotal(transactions, "price")
      );
    },
    // Get # of Sold items for a group of transactions
    getSoldCount: function(transactions) {
      var count = 0;
      for (var i = 0; i < transactions.length; i++) {
        var sold = parseFloat(transactions[i].sold) > 0;
        if (sold) {
          count++;
        }
      }
      return count;
    },

    // Count flip count and investment.  Add transaction when sold has a value.
    getOverallFlip: function(transactions) {
      var flip = {};
      flip.sum = 0;
      flip.count = 0;
      for (var i = 0; i < transactions.length; i++) {
        var price = parseFloat(transactions[i].price);
        var validPrice = !isNaN(price);
        var isAFlip = parseFloat(transactions[i].sold) > 0;

        if (!validPrice) {
          console.log(transactions[i]);
        }

        if (validPrice && isAFlip) {
          flip.sum += price;
          flip.count++;
        }
      }
      return flip;
    }
  };
});
