// budget controller
var budgetController = (function () {

    //function constructors for expense and income
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    // calculate percentage
    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    // return percentage
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };


    // store expenses and incomes into global data object
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    // return public method from budgetController IIFE
    return {
        addItem: function (type, desc, val) {
            var newItem, ID;

            // create new id. want ID = last ID + 1
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }


            // create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, desc, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, desc, val);
            }

            // push it into our data structure
            data.allItems[type].push(newItem);

            // return new element
            return newItem;
        },


        deleteItem: function (type, id) {
            var ids, index;

            // need to get index of id we want to delete from inc or exp array
            // map () has access to current and returns a brand new array
            ids = data.allItems[type].map(function (current) {
                return current.id; // would give an array of ids
            });

            index = ids.indexOf(id);

            // only delete if id is found ie. if index is not -1
            if (index !== -1) {
                data.allItems[type].splice(index, 1); // first arg is where to start deleting, second arg is how many to delete
            }


        },

        calculateBudget: function () {

            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income-expenses
            data.budget = data.totals.inc - data.totals.exp;


            // calculate the percentage of income that we spent
            // conditional for when income is 0 - cant divide by 0
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }


        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },


        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage(); //return value of current element to allPerc var
            });
            return allPerc; // all perc contains all percentages
        },


        getBudget: function () {
            // use object as returning 4 things at a time
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        //testing method
        testing: function () {
            console.log(data);
        }

    };

})();


// UI controller 
var UIController = (function () {

    // store DOM strings as an object. If html strings changed, can easily be changed here
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
    }



    // returns public method which we can access
    return {
        // return object
        getinput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };

        },

        addListItem: function (obj, type) {

            // 1. create HTML string with placeholder text

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // 2. replace the placeholder text with some actual data
            // .replace searches for string and replaces with the data we pass in
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // 3. insert the HTML into the DOM using insert adjacent method
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);


        },

        // can only remove a child element
        deleteListItem: function (selectorID) {

            var el = document.getElementById(selectorID)
            el.parentNode.removeChild(el) //get parent node of element and then remove its child

        },

        // function to clear all fields after entering a new item
        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            // slice() is stored in array prototype
            // trick slice method into thinking that we are giving it an array, so it will return an array
            // can then loop through inputs and clear all
            fieldsArr = Array.prototype.slice.call(fields);

            // forEach has access to these arguments - current, index, array
            // loop through each input box and clear it
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        // function to disaply budget on UI
        displayBudget: function (obj) {

            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expenseLabel).textContent = obj.totalExp;

            // only show percentage if it is greater than 0
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },

        // percentages is an array of all percentages
        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            var nodeListForEach = function (list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i); // pass current and index into callback
                }
            };

            // this is the callback function
            nodeListForEach(fields, function (current, index) {

                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = percentages[index] + '---'
                }

            });
        },

        // public method
        getDOMstrings: function () {
            return DOMstrings;
        }
    };


})();

// Controller 
var controller = (function (budgetCtrl, UICtrl) {

    // function for all event listeners
    var setupEventListeners = function () {

        // get access to dom strings
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        // key press event for when user hits return key
        document.addEventListener('keypress', function (event) {

            // code for enter button is 13
            if (event.keyCode === 13) {
                ctrlAddItem();
            }

        });

        // add event listener for everytime someone clicks on container which holds all inc and exp - event delegation
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };

    var updateBudget = function () {

        // 1. calculate the budget
        budgetController.calculateBudget();

        // 2. return the budget
        var budget = budgetController.getBudget();

        // 3. display the budget
        UIController.displayBudget(budget);

    }

    var updatePercentages = function () {

        // 1. calculate percentages
        budgetController.calculatePercentages();

        // 2. read percetages from budget controller
        var percentages = budgetController.getPercentages();

        // 3. update user interface with new percentages
        UIController.displayPercentages(percentages);
    };

    // this is controller of app - tells other functions what to do and receives data back which we store in vars
    var ctrlAddItem = function () {
        var input, newItem;

        // 1. get the field input data
        input = UICtrl.getinput();


        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. add item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. add the item to the UI
            UICtrl.addListItem(newItem, input.type)

            //4. Clear the fields
            UICtrl.clearFields();

            // 5. calculate and update budget
            updateBudget();

            // 6. calculate and update percentages
            updatePercentages();
        }

    };

    // callback function for event has access to event
    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        // DOM traversal from delete button up to it's parent div
        // not the best practise as the DOM is hard-coded in
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            // inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]); // this is now a string

            // 1. delete item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. delete the item from the UI
            UIController.deleteListItem(itemID);

            // 3. update and show the new budget 
            updateBudget();

            // 4. calculate and update percentages
            updatePercentages();
        }
    };

    // public method to set up event listeners
    return {
        init: function () {
            console.log('app has started');
            // to set budget values to 0 when app starts
            UIController.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListeners();
        }
    }


})(budgetController, UIController);

// call the init function to set things up at start of app
controller.init();