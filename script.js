// BUDGET CONTROLLER
var budgetController = (function () {

    var Expense = function (id, description, time, value) {
        this.id = id;
        this.description = description;
        this.time = time;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage= function(totalIncome) {
        if (totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome)*100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    


    var Income = function (id, description, time, value) {
        this.id = id;
        this.description = description;
        this.time = time;
        this.value = value;
    };

    var calculateTotal = function(type){
        // sum the total for each type
        var sum = 0;
        data.allData[type].forEach(function(cur) {
            sum += cur.value;
        });
        // store totals in the data structure
        data.totals[type] = sum;
    };
    


    var data = {
        allData: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1
        
    };


    return {
        addItem: function (type, des, t, val) {
            var newItem, ID;


            // Create new ID
            if (data.allData[type].length > 0) {
                ID = data.allData[type][data.allData[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, t, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, t, val);
            }

            // Push it into our data structure
            data.allData[type].push(newItem);

            // Return the new element
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;
            ids = data.allData[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);
            if (index !== -1) {
                data.allData[type].splice(index, 1);
            }
        },

        calculateBudget: function(){
            // calculate totals
            calculateTotal("exp");
            calculateTotal("inc");

            // calculate budget
            data.budget = data.totals.inc - data.totals.exp;

            // calculate percentage
            (data.totals.inc > 0) ? data.percentage = Math.round((data.totals.exp / data.totals.inc)*100) : data.percentage = -1;
        },

        calculatePercentages: function() {
            data.allData.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function(){
            var allPercentage = data.allData.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPercentage;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        

        testing: function () {
            console.log(data);
        }
    };

})();




// UI CONTROLLER
var UIController = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputTime: '.add__time',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
        
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec;
        // + or - before number
        // exactly 2 decimals
        // comma separating thousands


        num = Math.abs(num);

        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3, 3);
        }


        dec = numSplit[1]; 
        return ( type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    // reusable function to iterate over a node list 
    var nodeListForEach = function(list, callback){
        for (var i=0; i<list.length; i++){
            callback(list[i], i);
        }
    };



    return {
        getInput: function () {
            const { format,isToday } =dateFns
            var x = format(new Date(), 'DD.MM.YYYY, HH:mm');
                return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
                time: format(new Date(document.querySelector(DOMstrings.inputTime).value), 'DD.MM.YYYY, HH:mm')
            };
        },


        addListItem: function (obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description% </div> </br><div class="item__time"><span></span> %time%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div> </br><div class="item__time"><span></span> %time%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%time%', obj.time);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus();
        },

        // display the data of totals
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            (obj.percentage > 0) ? document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage+'%': document.querySelector(DOMstrings.percentageLabel).textContent ="---";

        },

        // display percentages
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);


            nodeListForEach(fields, function(current, index){
                if (percentages[index] > 0){
                    current.textContent = percentages[index]+'%';
                }else {
                    current.textContent = '---';
                }
            });
        },


        // display date
        displayMonth: function(){
            var now, month, year;
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year + ' ';
        },
        
        changedType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputTime + ',' +
                DOMstrings.inputValue
            );
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    };

})();




// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };


    var updateBudget = function() {
        var budget;
        // calculate the budget
        budgetCtrl.calculateBudget();

        // return the budget
        budget = budgetCtrl.getBudget();
        
        // display the budget in UI
        UICtrl.displayBudget(budget);
    };



    var updatePercentages = function() {
        // calculate percentages
        budgetCtrl.calculatePercentages();

        // get percentages from budget controller
        var percentages = budgetCtrl.getPercentages();

        // update the percentages on UI
        UICtrl.displayPercentages(percentages);
    };


    var ctrlAddItem = function () {
        var input, newItem;

        // get the field input data
        input = UICtrl.getInput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0){
            // add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.time, input.value);

            // add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // clear the fields
            UICtrl.clearFields();

            // calculate and update budget
            updateBudget();

            // update percentages 
            updatePercentages();
        }
        
    };

    var ctrlDeleteItem = function(event) {
        var itemId;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemId){
            // the parent id of an item ("inc-1"...)
            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);

            // delete item from data structure
            budgetCtrl.deleteItem(type, ID);

            // delete the item from the UI
            UICtrl.deleteListItem(itemId);

            // calculate and update budget
            updateBudget();


            // update percentages 
            updatePercentages();
        }
    };


    


    return {
        init: function () {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);


controller.init();