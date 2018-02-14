(function(angular) {
    
        angular.module('app',[])

            .filter("tag", function(tag){

                return function(input, tg) {
                    input = input || '';
                    if (input.tag.indexOf("hype") !== -1) {
                        console.log(input);
                        console.log(this);
                        
                    }
                }
            })
    
            .controller("dataController", [ '$scope' , function ($scope) {

                //mLab API Key - Un-mm4UdPQsFEX65W4eplZvLGtEBjJws

                //Show all databases for this API Key
                ///https://api.mlab.com/api/1/databases?apiKey=Un-mm4UdPQsFEX65W4eplZvLGtEBjJws

                //Show all collections for database
                //https://api.mlab.com/api/1/databases/eyecoin/collections?apiKey=Un-mm4UdPQsFEX65W4eplZvLGtEBjJws

                //Show all transactions(items) in a collection
                //https://api.mlab.com/api/1/databases/eyecoin/collections/transactions?apiKey=Un-mm4UdPQsFEX65W4eplZvLGtEBjJws


                $scope.transactions = [
                    //Initialize with Some Dummy Data.
                    {
                        name:"Supreme Example",
                        price: 120,
                        date: new Date("10/17/17 19:27"),
                        tags: [
                            "hype",
                            "flip"
                        ],
                    },
                    {
                        name:"Kith Example",
                        price: 100,
                        date: new Date("10/17/17 19:28:01"),
                        tags: [
                            "hype",
                            "flip"
                        ],
                    }
                ]

                //Get previous transactions if available.
                var transactionLog = JSON.parse(localStorage.getItem("transactionLog"));
                
                if (transactionLog && transactionLog.length > 0) {
                    console.log("Using previous transactionLog")
                    console.log(transactionLog)
                    $scope.transactions = transactionLog;
                }

               


                $scope.displayDate = function(date) {
                    var date = new Date(date);

                    return date.toLocaleDateString() + " " + date.toLocaleTimeString();   
                };

                $scope.addItem = function() {

                    var itemToAdd = {};
                    itemToAdd.name = $scope.name;
                    itemToAdd.price = $scope.price;
                    itemToAdd.sold = $scope.sold;
                    
                    itemToAdd.date = $scope.date || new Date();
                    itemToAdd.tags = ["hype"];
                    $scope.transactions.push(itemToAdd);
                    console.log($scope.transactions);


                    $.ajax({ 
                        url: "https://api.mlab.com/api/1/databases/eyecoin/collections/transactions?apiKey=Un-mm4UdPQsFEX65W4eplZvLGtEBjJws",
                        data: JSON.stringify( itemToAdd ),
                        type: "POST",
                        contentType: "application/json" 
                    }).done(function() {
                        $scope.getandSetTransactionsFromDatabase();
                        localStorage.setItem("transactionLog", JSON.stringify($scope.transactions));
                        
                    });

                    
                }

                $scope.updateItem = function(transaction) {
                    console.log("Update Item");


                    var b = "59e92c5abd966f5cb6d97386";

                    var transID = transaction._id.$oid;

                    var reqURL = "https://api.mlab.com/api/1/databases/eyecoin/collections/transactions/" + transID + "?apiKey=Un-mm4UdPQsFEX65W4eplZvLGtEBjJws"
                    
                    $.ajax( { url: reqURL,
                        data: JSON.stringify(  { "$set" : { "tags" : ["succesful","update"] } } ),
                        type: "PUT",
                        contentType: "application/json" } );


                    // $.ajax( { url: reqURL,
                    //           data: JSON.stringify(  { "$set" : { "tags" : ["succesful","update"] } } ),
                    //           type: "PUT",
                    //           contentType: "application/json" } );
                }

                $scope.updateItemTags = function(transaction, tags) {

                    console.log("Updating Item Tags");
                    var transID = transaction._id.$oid;

                    var reqURL = "https://api.mlab.com/api/1/databases/eyecoin/collections/transactions/" + transID + "?apiKey=Un-mm4UdPQsFEX65W4eplZvLGtEBjJws"
                    
                    $.ajax( { url: reqURL,
                        data: JSON.stringify(  { "$set" : { "tags" : tags } } ),
                        type: "PUT",
                        contentType: "application/json" }
                    ).done(function() {
                        alert("finished updateItemTags");
                        console.log("Finished updateItemTags");
                        $scope.getandSetTransactionsFromDatabase();
                    });
                

                }

                $scope.getandSetTransactionsFromDatabase = function () {
                    console.log("Calling getTransactionsFromDatabase")
                    $.ajax({ 
                        url: "https://api.mlab.com/api/1/databases/eyecoin/collections/transactions?apiKey=Un-mm4UdPQsFEX65W4eplZvLGtEBjJws",
                        type: "GET",
                        contentType: "application/json" 
                    }).done(function(data) {
                        //data is already a JSON object.
                        console.log("finished getTransactionsFromDatabase AJAX call");

                        //http://jimhoskins.com/2012/12/17/angularjs-and-apply.html
                        $scope.$apply(function() {
                            $scope.transactions = data;
                        })
                        
                        console.log($scope.transactions);
                    });
                }
                $scope.getandSetTransactionsFromDatabase();

                $scope.deleteItem = function(transaction) {
                    console.log("Delete item");
                    console.log(transaction);

                    var transID = transaction._id.$oid;
                    var indexToRemove = $scope.transactions.indexOf(transaction);
                    console.log(indexToRemove);
                    $scope.transactions.splice(indexToRemove,1);

                    var reqURL = "https://api.mlab.com/api/1/databases/eyecoin/collections/transactions/" + transID + "?apiKey=Un-mm4UdPQsFEX65W4eplZvLGtEBjJws"


                    $.ajax( { url: reqURL,
                        type: "DELETE",
                        async: true,
                        timeout: 0
                    }).done(function() {
                        $scope.getandSetTransactionsFromDatabase();
                        alert("done")
                        localStorage.setItem("transactionLog", JSON.stringify($scope.transactions));
                        
                    });


                    
                    // console.log($scope.transactions);
                }

                $scope.populateTags = function(transaction) {
                    //$("tr[trans_id='59ee1d9ec2ef163e8f753e4f']")
                    console.log("Populate Tags");
                    console.log(transaction);

                    if (transaction) {
                        var query = transaction._id.$oid;

                        if (transaction._id.$oid == undefined) {
                            console.log("undefined");
                            console.log(transaction);
                        }
                        
                        console.log(query);
                        console.log($(query));
                        
                        $("#"+query).empty();

                        console.log(transaction.tags)
                        new Taggle(query, {
                            tags: transaction.tags,
                        
                            onTagAdd: function(event, tag) {
                                console.log(event);
                                console.log(tag);
                                console.log(this);
                                transaction.tags.push(tag);
                                //console.log(transaction.tags.push(tag));
                                console.log(transaction.tags);

                                $scope.updateItemTags(transaction, transaction.tags);
                        
                            },

                            onTagRemove: function(event, tag) {
                                var indexToRemove = transaction.tags.indexOf(tag);
                                console.log("Removing tag");
                                transaction.tags.splice(indexToRemove,1)

                                $scope.updateItemTags(transaction, transaction.tags);
                                
                            },
                        
                            id: query
                        });

                                    
                    }
                }

                $scope.getTotal1 = function(listName) {
                    
                    var sum = 0;
                    for (var i=0; i<$scope.transactions.length; i++) {
                        if (isNaN(parseFloat($scope.transactions[i][listName])) === false)
                        sum += parseFloat($scope.transactions[i][listName]);
                    }
                    return sum;
                }
                
                $scope.getTotal = function() {

                    var sum = 0;
                    for (var i=0; i<$scope.transactions.length; i++) {
                        if (isNaN(parseFloat($scope.transactions[i].price)) === false)
                        sum += parseFloat($scope.transactions[i].price);
                    }
                    return sum;
                }

                $scope.getFlipInvestment = function() {
                    var sum = 0;
                    for (var i=0; i<$scope.transactions.length; i++) {
                        if (isNaN(parseFloat($scope.transactions[i].price)) === false && $scope.transactions[i].sold > 0)
                        sum += parseFloat($scope.transactions[i].price);
                    }
                    return sum;
                }

                $scope.getProfit = function() {

                    return $scope.getTotal1("sold") - $scope.getTotal1("price");
                }
                
            }]);
    })(window.angular);
    