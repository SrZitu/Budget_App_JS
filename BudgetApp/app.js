//Budget Controller
var budgetController = (function () {
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

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
    data.allItems[type].forEach(function (curr) {
      sum = sum + curr.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      inc: [],
      exp: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
  };
  var budget = 0;
  var percentage = -1;
  return {
    addItem: function (type, des, val) {
      var newItem, ID;
      //[1,2,3,4,5], nextID=6
      //[2,3,4,6,8], nestID should be=lastid+ 1=9,
      // create new id
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //create new items based on exp or inc type
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      //push into data structure
      data.allItems[type].push(newItem);

      //return
      return newItem;
    },

    deleteItem: function (type, id) {
      var ids, index;

      ids = data.allItems[type].map(function (current) {
        return current.id;
      });
      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    calculateBudget: function () {
      //1.calculate total income and expenses
      calculateTotal("inc");
      calculateTotal("exp");

      //2.calculate the budget: income-expenses
      data.budget = data.totals.inc - data.totals.exp;
      // 3 calculate the percentage of income that we expenses
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalinc: data.totals.inc,
        totalexp: data.totals.exp,
        percentage: data.percentage,
      };
    },

    calculatePercentages: function () {
      data.allItems.exp.forEach(function (current) {
        current.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function () {
      var allpercent = data.allItems.exp.map(function (current) {
        return current.getPercentage();
      });
      return allpercent;
    },

    testing: function () {
      console.log(data);
    },
  };
})();

//UI controller
var UIcontroller = (function () {
  var DomString = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expenseLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensePercentageLabel: ".item__percentage",
    dateLabel: ".budget__title--month",
  };
  var formatNumber = function (num, type) {
    var numSplit, int, dec;
    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");
    int = numSplit[0];

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }
    dec = numSplit[1];

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };

  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function () {
      return {
        type: document.querySelector(DomString.inputType).value, //will be either  inc or exp
        description: document.querySelector(DomString.inputDescription).value,
        value: parseFloat(document.querySelector(DomString.inputValue).value),
      };
    },
    addListItem: function (obj, type) {
      var newHtml, html, element;

      // create html string with placeholder text
      if (type === "inc") {
        element = DomString.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DomString.expenseContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      // replace the placeholder text with some actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      // Insert the html element ot the dom
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: function (selectDeleteId) {
      var item = document.getElementById(selectDeleteId);
      item.parentNode.removeChild(item);
    },
    clearFields: function () {
      var fields, arrfields;
      fields = document.querySelectorAll(
        DomString.inputDescription + "," + DomString.inputValue
      );
      arrfields = Array.prototype.slice.call(fields);
      arrfields.forEach(function (
        current,
        index,
        array //here as parameter we can give any name
      ) {
        current.value = "";
      });
      arrfields[0].focus();
    },

    displayBudget: function (obj) {
      var type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(DomString.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DomString.incomeLabel).textContent = formatNumber(
        obj.totalinc,
        "inc"
      );
      document.querySelector(DomString.expenseLabel).textContent = formatNumber(
        obj.totalexp,
        "exp"
      );

      if (obj.percentage > 0) {
        document.querySelector(DomString.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DomString.percentageLabel).textContent = "---";
      }
    },

    displayPecentage: function (percentages) {
      var fields = document.querySelectorAll(DomString.expensePercentageLabel);

      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },

    displayMonth: function () {
      var now, months, year;
      now = new Date();
      months = [
        "January",
        "Fabruary",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DomString.dateLabel).textContent =
        months[month] + " " + year;
    },

    // changedType: function () {
    //   var fields = document.querySelectorAll(
    //     DomString.inputType +
    //       "," +
    //       DomString.inputDescription +
    //       "," +
    //       DomString.inputValue
    //   );
    //   nodeListForEach(fields, function (cur) {
    //     cur.classList.toggle("red-focus");
    //   });

    //   document.querySelector(DomString.inputBtn).classList.toggle("red");
    // },
    changedType: function () {
      var fields = document.querySelectorAll(
        DomString.inputType +
          "," +
          DomString.inputDescription +
          "," +
          DomString.inputValue
      );

      nodeListForEach(fields, function (cur) {
        cur.classList.toggle("red-focus");
      });

      document.querySelector(DomString.inputBtn).classList.toggle("red");
    },
    getDomString: function () {
      return DomString;
    },
  };
})();

//Global App Controller
var Controller = (function (budgetcntrlr, uicontrlr) {
  //controller Fun
  var setupEventListener = function () {
    var DOM = uicontrlr.getDomString();
    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function (e) {
      if (e.keyCode === 13 || e.which === 13) {
        ctrlAddItem();
      }
    });
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
    document
      .querySelector(DOM.inputType)
      .addEventListener("change", uicontrlr.changedType);
  };

  var updateBudget = function () {
    //1. Calculate the budget
    budgetcntrlr.calculateBudget();

    //2. Return the budget
    var budget = budgetcntrlr.getBudget();

    //3. Display the budget on UI
    uicontrlr.displayBudget(budget);
  };

  var updatePercentages = function () {
    // 1.calculate percentage
    budgetcntrlr.calculatePercentages();

    //2. Read budget from ui
    var percentages = budgetcntrlr.getPercentages();

    //3. update the ui with new percentages
    uicontrlr.displayPecentage(percentages);
  };
  var ctrlAddItem = function () {
    var addItem, input, newItem;
    // 1.get the field input data
    input = uicontrlr.getInput();
    if (input.value !== "" && input.value !== NaN && input.value > 0) {
      //2. Add the item to budget controller
      newItem = budgetcntrlr.addItem(
        input.type,
        input.description,
        input.value
      );
      //3 Add the item to UI
      uicontrlr.addListItem(newItem, input.type);

      //4for clear the field
      uicontrlr.clearFields();

      //5.update Budget
      updateBudget();

      //6 update percentages
      updatePercentages();
    }
  };

  //deleting item method
  var ctrlDeleteItem = function (event) {
    var itemId, splitId, type, id;
    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

    //split -1
    if (itemId) {
      splitId = itemId.split("-");
      type = splitId[0];
      id = parseInt(splitId[1]);

      // 1. delete the item from data structure
      budgetcntrlr.deleteItem(type, id);
      // 2.delete the item from ui
      uicontrlr.deleteListItem(itemId);
      // 3. update and show the new budget
      updateBudget();

      //4. update percentages
      updatePercentages();
    }
  };

  return {
    init: function () {
      console.log("app started");
      uicontrlr.displayMonth();
      uicontrlr.displayBudget({
        budget: 0,
        totalinc: 0,
        totalexp: 0,
        percentage: -1,
      });
      setupEventListener();
    },
  };
})(budgetController, UIcontroller);
Controller.init();
