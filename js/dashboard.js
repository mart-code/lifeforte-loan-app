window.onload = loaded;
document.getElementById("adminName").innerHTML =
  sessionStorage.getItem("userEmail");
const branch = sessionStorage.getItem("region");

function getToday() {
  return new Date().toISOString().split("T")[0];
}


function loaded() {
  calculateBranchStatistics();
  getCurrentDayPayments();

}
const region = sessionStorage.getItem("region");
document.getElementById("currentBranch").innerHTML = region;
function calculateBranchStatistics() {
  // Initialize variables to store statistics
  let borrowersWithLoans = 0;
  let borrowersWithoutLoans = 0;
  let totalPayments = 0; // Updated to store as a number
  let numAdmins = 0; // Added to count administrators
  let totalLoansIssued = 0;

  // Create an array to store all borrower IDs with loans
  const borrowerIDsWithLoans = [];

  // Promises for Firebase queries
  const loansPromise = new Promise((resolve) => {
    firebase
      .database()
      .ref("loans")
      .on("value", function (AllRecords) {
        AllRecords.forEach(function (CurrentRecord) {
          if (CurrentRecord.val().branch == region) {
            borrowerIDsWithLoans.push(CurrentRecord.val().borrowerID);

            // Check if the loan was issued during the current month
            const loanStart = new Date(CurrentRecord.val().loanStart);
            if (isSameMonth(loanStart, new Date())) {
              totalLoansIssued += parseFloat(CurrentRecord.val().loanAmount);
            }
          }
        });
        resolve();
      });
  });

  const borrowersPromise = new Promise((resolve) => {
    firebase
      .database()
      .ref("borrowers")
      .on("value", function (AllRecords) {
        AllRecords.forEach(function (CurrentRecord) {
          if (CurrentRecord.val().branch == region) {
          
            if (borrowerIDsWithLoans.includes(CurrentRecord.val().borrowerID)) {
              borrowersWithLoans++;
            } else {
              borrowersWithoutLoans++;
            }
          }
        });
        resolve();
      });
  });

  const paymentsPromise = new Promise((resolve) => {
    firebase
      .database()
      .ref("payments")
      .on("value", function (AllRecords) {
        AllRecords.forEach(function (CurrentRecord) {
          if (CurrentRecord.val().branch == region) {
            // Check if the payment was made during the current month
            const paymentDate = new Date(CurrentRecord.val().paymentDate);
            if (isSameMonth(paymentDate, new Date())) {
              totalPayments += parseFloat(CurrentRecord.val().amountPaid);
            }
          }
        });
        resolve();
      });
  });

  const adminsPromise = new Promise((resolve) => {
    firebase
      .firestore()
      .collection("users")
      .where("branch", "==", region)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          numAdmins++;
        });
        resolve();
      });
  });

  // Wait for all promises to complete and then display the statistics
  Promise.all([
    loansPromise,
    borrowersPromise,
    paymentsPromise,
    adminsPromise,
  ]).then(() => {
    document.getElementById("brwNum").innerHTML =
      borrowersWithLoans + borrowersWithoutLoans;
    document.getElementById("loanNum").innerHTML = borrowersWithLoans;
    document.getElementById("paymentNum").innerHTML = totalPayments;
    document.getElementById("users").innerHTML = numAdmins;

  });
}

function isSameMonth(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
}

function getCurrentDayPayments() {
  const today = new Date(); // Get the current date
  const currentDate = today.toISOString().split("T")[0]; // Convert to YYYY-MM-DD format

  // Initialize an array to store the payments made today in reverse order
  const currentDayPayments = [];

  firebase
    .database()
    .ref("payments")
    .on("value", function (AllRecords) {
      AllRecords.forEach(function (CurrentRecord) {
        if (
          CurrentRecord.val().branch === region &&
          CurrentRecord.val().paymentDate.startsWith(currentDate)
        ) {
          currentDayPayments.unshift(CurrentRecord.val()); // Add to the beginning of the array
          // Clear the table
          const tbody = document.getElementById("tbody1");
          tbody.innerHTML = "";
        }
      });


      currentDayPayments.forEach(function (payment) {
        AddItemsToTable(
          payment.name,
          payment.borrowerID,
          payment.amountPaid,
          payment.paymentType,
          payment.paymentDate,
          payment.admin
        );
      });
    });
}

//ADD ITEMS TO TABLE
function AddItemsToTable(
  name,
  borrowerID,
  amountPaid,
  paymentType,
  paymentDate,
  admin
) {
  var tbody = document.getElementById("tbody1");
  var trow = document.createElement("tr");
  var td0 = document.createElement("td");
  var td1 = document.createElement("td");
  var td2 = document.createElement("td");
  var td3 = document.createElement("td");
  var td4 = document.createElement("td");
  var td5 = document.createElement("td");

  td0.innerHTML = borrowerID;
  td1.innerHTML = name;
  td2.innerHTML = amountPaid;
  td3.innerHTML = paymentType;
  td4.innerHTML = paymentDate;
  td5.innerHTML = admin;

  td0.setAttribute("data-label", "Borrower ID");
  td1.setAttribute("data-label", "Fullname");
  td2.setAttribute("data-label", "Amount Paid");
  td3.setAttribute("data-label", "Payment Type");
  td4.setAttribute("data-label", "Date Paid");
  td5.setAttribute("data-label", "Admin");

  trow.appendChild(td0);
  trow.appendChild(td1);
  trow.appendChild(td2);
  trow.appendChild(td3);
  trow.appendChild(td4);
  trow.appendChild(td5);

  tbody.appendChild(trow);
}
