window.onload = onLoad;
document.getElementById("adminName").innerHTML =
  sessionStorage.getItem("userEmail");

function onLoad() {
  getLoanStatus();
  getLoanType();
  SelectLoans();
  calculateLoanPayments();
}
const region = sessionStorage.getItem("region");
let name,
  borrowerID,
  loanType,
  loanAmount,
  loanTenure,
  loanInterest,
  loanPurpose,
  amountPaid,
  loanStart,
  loanValues,
  passBook,
  riskManagement,
  loanApplication;
function Ready() {
  borrowerID = document.getElementById("brwid").value;
  loanType = document.getElementById("loan-type").value;
  loanAmount = Number(document.getElementById("loan-amount").value);
  loanTenure = Number(document.getElementById("loan-tenure").value);
  loanInterest = Number(document.getElementById("loan-interest").value);
  loanPurpose = document.getElementById("loan-purpose").value;
  loanApplication = Number(document.getElementById("loan-application").value);
  riskManagement = Number(document.getElementById("risk-management").value);
  passBook = Number(document.getElementById("passBook").value);
}

function getLoanType() {
  let loanList = "";
  firebase
    .database()
    .ref("LoanType")
    .once("value", function (AllRecords) {
      AllRecords.forEach(function (currentRecord) {
        loanList += `<option value="${currentRecord.val().name}">${
          currentRecord.val().name
        }</option>`;
      });

      document.getElementById("loan-type").innerHTML = loanList;
    });
}

document.getElementById("loanSubmit").onclick = function (e) {
  e.preventDefault();
  Ready();
  let loanStart = document.getElementById("loan-start").value;
  let loanEnd = document.getElementById("loan-end").value;
  let loanStartM = new Date(loanStart).getTime();
  let loanEndM = new Date(loanEnd).getTime();
  let payableTimes = (loanEndM - loanStartM) / 1814400000;
  let dateAdded = new Date().getTime();
  firebase
    .database()
    .ref("loans/" + borrowerID)
    .set({
      name: document.getElementById("fname").innerHTML,
      borrowerID,
      loanType,
      loanAmount,
      loanStart,
      loanEnd,
      payableTimes,
      loanTenure,
      loanInterest,
      amountPaid: 0,
      loanPurpose,
      branch: region,
      dateAdded,
      riskManagement,
      loanApplication,
      passBook,
      lapseFund: 0,
      cardIssue: 0,
      miscellaneous: 0,
      totalPayable: loanValues,
    })
    .then(() => {
      addLoanData(
        riskManagement,
        passBook,
        loanApplication,
        Number(document.getElementById("loan-amount").value),
        loanStart,
        borrowerID
      );
      alert("Loan Recorded Added Successfully");
      window.location.href = "/loans.html";
    })
    .catch((error) => {
      alert("Error in Adding Loan, Check Values");
    });
};

// Loan calculation function
function emi(loanAmount, interestRate) {
  const totalPayment =
    Number(loanAmount) +
    parseFloat(Number(loanAmount) * Number(interestRate / 100));

  // Calculate total payment

  return totalPayment;
}

document.getElementById("calculate").onclick = function (e) {
  e.preventDefault();

  Ready();
  firebase
    .database()
    .ref("borrowers/" + borrowerID)
    .on("value", function (snapshot) {
      document.getElementById("fname").innerHTML = snapshot.val().name;
    });
  loanValues = emi(loanAmount, loanInterest);

  document.getElementById(
    "loanValues"
  ).innerHTML = `Total Payable: ${loanValues} <br>`;
};

function SelectLoans() {
  const tableBody = document.getElementById("tbody1");

  // Clear existing table rows
  tableBody.innerHTML = "";

  firebase
    .database()
    .ref("loans")
    .orderByChild("dateAdded")
    .once("value") // Use once instead of on to fetch data once
    .then(function (snapshot) {
      const loans = [];
      snapshot.forEach(function (childSnapshot) {
        const loan = childSnapshot.val();
        loans.push(loan);
      });

      // Reverse the array
      loans.reverse();

      // Add loans to the table
      loans.forEach(function (loan) {
        if (loan.branch == region) {
          const borrowerID = loan.borrowerID;
          const name = loan.name;
          const loanType = loan.loanType;
          const loanInterest = loan.loanInterest;
          const totalPayable = loan.totalPayable;
          const loanTenure = loan.loanTenure;
          const amountPaid = loan.amountPaid;
          const loanStart = loan.loanStart;

          // Add the loan to the table
          AddLoanToTable(
            borrowerID,
            name,
            loanType,
            loanInterest,
            totalPayable,
            loanTenure,
            amountPaid,
            loanStart
          );
        }
      });

      // After adding all loans to the table, filter if needed
      const searchInput = document.getElementById("searchInput");
      searchInput.addEventListener("input", function () {
        filterTable(searchInput.value.trim());
      });
    });
}

function filterTable(query) {
  const table = document.getElementById("tbody1");
  const rows = table.getElementsByTagName("tr");

  for (let i = 0; i < rows.length; i++) {
    const nameCell = rows[i].querySelector("[data-label='Name']");
    if (nameCell) {
      const name = nameCell.textContent || nameCell.innerText;
      const display = name.toLowerCase().includes(query.toLowerCase());
      rows[i].style.display = display ? "" : "none";
    }
  }
}

//ADD ITEMS TO TABLE
function AddLoanToTable(
  borrowerID,
  name,
  loanType,
  loanInterest,
  totalPayable,
  loanTenure,
  amountPaid,
  loanStart
) {
  var tbody = document.getElementById("tbody1");
  var trow = document.createElement("tr");
  var td0 = document.createElement("td");
  var td1 = document.createElement("td");
  var td2 = document.createElement("td");
  var td3 = document.createElement("td");
  var td4 = document.createElement("td");
  var td5 = document.createElement("td");

  var td7 = document.createElement("td");
  var td8 = document.createElement("td");
  var tdDelete = document.createElement("td");

  td0.innerHTML = borrowerID;
  td1.innerHTML = name;
  td2.innerHTML = loanType;
  td3.innerHTML = totalPayable;
  td4.innerHTML = loanInterest;
  td5.innerHTML = loanTenure;

  td7.innerHTML = amountPaid;
  td8.innerHTML = loanStart;


    // Create a delete button
    var deleteButton = document.createElement("button");
    deleteButton.innerHTML = "Delete";
    deleteButton.addEventListener("click", function () {
      deleteLoanApplication(borrowerID);
    });
    tdDelete.appendChild(deleteButton);

  td0.setAttribute("data-label", "Borrower ID");
  td1.setAttribute("data-label", "Name");
  td2.setAttribute("data-label", "Loan Type");
  td3.setAttribute("data-label", "Loan Amount");
  td4.setAttribute("data-label", "Loan Interest");
  td5.setAttribute("data-label", "Loan Tenure");

  td7.setAttribute("data-label", "Amount Paid");
  td8.setAttribute("data-label", "Loan Start");

  trow.appendChild(td0);
  trow.appendChild(td1);
  trow.appendChild(td2);
  trow.appendChild(td3);
  trow.appendChild(td4);
  trow.appendChild(td5);

  trow.appendChild(td7);
  trow.appendChild(td8);
  trow.appendChild(tdDelete);
  tbody.appendChild(trow);
}

function TableCompletedPayment(name, borrowerID, loanType) {
  var tbody = document.getElementById("tbody3");

  var trow = document.createElement("tr");
  trow.style.backgroundColor = "green";

  var td0 = document.createElement("td");
  var td1 = document.createElement("td");
  var td2 = document.createElement("td");
  var td3 = document.createElement("td");

  td0.innerHTML = borrowerID;
  td1.innerHTML = name;
  td2.innerHTML = loanType;

  td0.setAttribute("data-label", "Borrower ID");
  td1.setAttribute("data-label", "Name");
  td2.setAttribute("data-label", "Loan Type");

  // Create a delete button
  var deleteButton = document.createElement("button");
  deleteButton.innerHTML = "Delete";
  deleteButton.addEventListener("click", function () {
    // Call a function to handle deletion, passing the loanKey for identification
    deleteLoanApplication(borrowerID);
  });

  td3.appendChild(deleteButton);
  trow.appendChild(td0);
  trow.appendChild(td1);
  trow.appendChild(td2);
  trow.appendChild(td3);

  tbody.appendChild(trow);
}
function deleteLoanApplication(borrowerID) {
  // Get the region from sessionStorage
  const region = sessionStorage.getItem("region");

  // Remove the loan record
  firebase
    .database()
    .ref("loans/" + borrowerID)
    .remove()
    .then(() => {
      // Remove related records from the capital reference
      const capitalRef = firebase.database().ref("capital/" + region);
      capitalRef
        .orderByChild("borrowerID")
        .equalTo(borrowerID)
        .once("value")
        .then(function(snapshot) {
          // Use a batch delete to remove all matching records
          const updates = {};
          snapshot.forEach(function(childSnapshot) {
            updates[childSnapshot.key] = null;
          });
          return capitalRef.update(updates);
        })
        .then(() => {
          // Reload the page to update the loan list
          window.location = "./loans.html";
        })
        .catch((error) => {
          alert("Error in deleting loan-related capital records, please try again.");
          console.error(error);
        });
    })
    .catch((error) => {
      alert("Error in deleting loan, please try again.");
      console.error(error);
    });
}



function TableLatePayment(name, borrowerID, loanType, currentMonth) {
  var tbody = document.getElementById("tbody2");

  var trow = document.createElement("tr");
  trow.style.backgroundColor = "red";

  var td0 = document.createElement("td");
  var td1 = document.createElement("td");
  var td2 = document.createElement("td");
  var td3 = document.createElement("td");

  td0.innerHTML = borrowerID;
  td1.innerHTML = name;
  td2.innerHTML = loanType;
  td3.innerHTML = currentMonth;

  td0.setAttribute("data-label", "Borrower ID");
  td1.setAttribute("data-label", "Name");
  td2.setAttribute("data-label", "Loan Type");
  td3.setAttribute("data-label", "Current Month");

  trow.appendChild(td0);
  trow.appendChild(td1);
  trow.appendChild(td2);
  trow.appendChild(td3);

  tbody.appendChild(trow);
}

function getLoanStatus() {
  let myDate = new Date();
}

////////////////////////CHATGPT///////////////////////////////////////
function calculateLoanPayments() {
  const currentDate = new Date(); // Get the current date
  const completedLoans = {}; // To keep track of completed loans

  firebase
    .database()
    .ref("loans")
    .on("value", function (AllRecords) {
      AllRecords.forEach(function (CurrentRecord) {
        if (CurrentRecord.val().branch == region) {
          const borrowerID = CurrentRecord.val().borrowerID;
          const name = CurrentRecord.val().name;
          const loanType = CurrentRecord.val().loanType;
          const amountPaid = CurrentRecord.val().amountPaid;
          const totalPayable = CurrentRecord.val().totalPayable;

          // Calculate the expected monthly payment
          const expectedMonthlyPayment = emi(
            CurrentRecord.val().loanAmount,
            CurrentRecord.val().loanInterest
            // Default loan tenure is 1 month (30 days)
          );

          // Check if the payment for the current month is missing
          if (amountPaid < expectedMonthlyPayment) {
            const loanStart = new Date(CurrentRecord.val().loanStart);
            const loanEnd = new Date(CurrentRecord.val().loanEnd);
            const currentDatePlusDay = new Date(loanStart);

            // Only notify on the 21st day
            currentDatePlusDay.setDate(
              loanStart.getDate() + CurrentRecord.val().loanTenure
            );

            // Check if the current date is within the loan tenure
            if (
              currentDate >= loanStart &&
              currentDate <= loanEnd &&
              currentDate >= currentDatePlusDay
            ) {
              TableLatePayment(name, borrowerID, loanType, currentDatePlusDay);
            }
          } else if (totalPayable <= 0) {
            // Check if the loan hasn't been marked as completed already
            TableCompletedPayment(name, borrowerID, loanType);
            completedLoans[borrowerID] = true; // Mark the loan as completed
          }
        }
      });
    });
}

///ADDING LOAN APPLICATION INCOME
function addLoanData(
  passBook,
  riskManagement,
  loanApplication,
  loanDisbursed,
  date,
  borrowerID
) {
  const capitalRef = firebase.database().ref("capital/" + region);
  capitalRef.push({
    borrowerID,
    type: "riskManagement Added",
    amount: riskManagement,
    date,
    branch: region,
    remark: `riskManagement from ${name}`,
  });
  capitalRef.push({
    borrowerID,
    type: "loanApplication Added",
    amount: loanApplication,
    date,
    branch: region,
    remark: `loanApplication from ${name}`,
  });
  capitalRef.push({
    borrowerID,
    type: "passBook Added",
    amount: passBook,
    date,
    branch: region,
    remark: `passBook fee from ${name}`,
  });
  capitalRef.push({
    borrowerID,
    type: "loan disbursed",
    amount: loanDisbursed,
    date,
    branch: region,
    remark: `loan Disbursed to ${name}`,
  });
}

///DEDUCTING LOAN AMOUNT FROM CAPITAL
document.getElementById("dateSearch").addEventListener("input", function (e) {
  e.preventDefault();
  const query = document.getElementById("dateSearch").value;
  const table = document.getElementById("tbody1");
  const rows = table.getElementsByTagName("tr");

  for (let i = 0; i < rows.length; i++) {
    const startDateCell = rows[i].querySelector("[data-label='Loan Start']");
    if (startDateCell) {
      const startDate = new Date(
        startDateCell.textContent || startDateCell.innerText
      );
      const display =
        query === "" || startDate.toISOString().slice(0, 10) === query;
      rows[i].style.display = display ? "" : "none";
    }
  }
});