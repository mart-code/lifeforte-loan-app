window.onload = loading;
document.addEventListener("DOMContentLoaded", loading);

function loading() {
  getPayments();
}

$("#menu-btn").click(function () {
  $("#menu").toggleClass("active");
});
document.querySelector("#modal-btn").addEventListener("click", function () {
  document.querySelector(".modal").style.display = "flex";
  document.getElementById("payment-submit").innerHTML = "Submit";
  document.querySelector(".form-title").innerHTML = "Make Payment";
});

document.querySelector(".close").addEventListener("click", function () {
  document.querySelector(".modal").style.display = "none";
});

//GLOBAL VARIABLES
const region = sessionStorage.getItem("region");
const branch = sessionStorage.getItem("region");
const userEmail = sessionStorage.getItem("userEmail");
const fixedCapitalRef = firebase.database().ref("fixedCapital/" + region);
document.getElementById("adminName").innerHTML =
  sessionStorage.getItem("userEmail");

var name;
let borrowerID,
  paymentType,
  paymentDate,
  amountPaid,
  admin,
  prevAmountValue,
  paymentTime,
  prevPaymentTime;

function Ready() {
  borrowerID = document.getElementById("brwid").value;
  paymentType = document.getElementById("payment-type").value;
  amountPaid = Number(document.getElementById("payment-amount").value);
  paymentDate = convertMillisecondsToDate(new Date().getTime());
}

//MAKE PAYMENT FOR CARD ISSUE, LOAN REPAYMENT, ETC
document.getElementById("payment-submit").onclick = function (e) {
  e.preventDefault();

  Ready();

  if (document.getElementById("payment-submit").innerHTML == "Submit") {
    if (window.confirm("Are you sure?")) {
      firebase
        .database()
        .ref("borrowers/" + borrowerID)
        .get()
        .then((snapshot) => {
          const name = snapshot.val().name; // Get the name

          if (paymentType === "savings") {
            updateSavings(borrowerID, amountPaid).then(() =>
              setPaymentRecord(name)
            );
          } else if (paymentType === "loan-payment") {
            updateAmountPaid(borrowerID, amountPaid).then(() =>
              setPaymentRecord(name)
            );
          } else if (paymentType === "lapse-fund") {
            lapseFundPayment(borrowerID, amountPaid).then(() =>
              setPaymentRecord(name)
            );
          } else if (paymentType === "miscellaneous") {
            miscellaneous(borrowerID, amountPaid).then(() =>
              setPaymentRecord(name)
            );
          } else if (paymentType === "card-issue") {
            cardIssue(borrowerID, amountPaid).then(() =>
              setPaymentRecord(name)
            );
          }
        });
    }
  } else if (document.getElementById("payment-submit").innerHTML == "Update") {
    if (window.confirm("Are you sure?")) {
      firebase
        .database()
        .ref("borrowers/" + borrowerID)
        .get()
        .then((snapshot) => {
          const name = snapshot.val().name; // Get the name

          if (paymentType === "savings") {
            editSavings(borrowerID, amountPaid).then(() => {
              deletePaymentRecord(prevPaymentTime);
              setPaymentRecord(name);
            });
          } else if (paymentType === "loan-payment") {
            editAmountPaid(borrowerID, amountPaid).then(() => {
              deletePaymentRecord(prevPaymentTime);
              setPaymentRecord(name);
            });
          } else if (paymentType === "lapse-fund") {
            editlapseFund(borrowerID, amountPaid).then(() => {
              deletePaymentRecord(prevPaymentTime);
              setPaymentRecord(name);
            });
          } else if (paymentType === "miscellaneous") {
            editMisc(borrowerID, amountPaid).then(() => {
              deletePaymentRecord(prevPaymentTime);
              setPaymentRecord(name);
            });
          } else if (paymentType === "card-issue") {
            editCardIssue(borrowerID, amountPaid).then(() => {
              deletePaymentRecord(prevPaymentTime);
              setPaymentRecord(name);
            });
          }
        });
    }
  }
};

//SET PAYMENT RECORD
function setPaymentRecord(name) {
  paymentTime = new Date().getTime();
  firebase
    .database()
    .ref("payments/" + paymentTime)
    .set({
      name,
      borrowerID,
      amountPaid,
      paymentType,
      paymentDate,
      paymentTime,
      branch: region,
      admin: userEmail,
    })
    .then(() => {
      alert("Payment Successful");
      window.location.href = "./payment.html";
      return false;
    })
    .catch((error) => {
      alert("An Error Occurred, Try Again");
    });
}

function convertMillisecondsToDate(milliseconds) {
  const date = new Date(milliseconds);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is zero-indexed
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}
//GET PAYMENTS IN A RECORD AND SORT THEM ON ADDITEMSTOTABLE
function getPayments() {
  firebase
    .database()
    .ref(`payments`)
    .orderByChild("paymentTime")
    .get()
    .then(function (AllRecords) {
      let paymentRecords = [];

      AllRecords.forEach(function (CurrentRecord) {
        if (
          CurrentRecord.val().branch == region &&
          (CurrentRecord.val().paymentType == "savings" ||
            CurrentRecord.val().paymentType == "loan-payment" ||
            CurrentRecord.val().paymentType == "card-issue" ||
            CurrentRecord.val().paymentType == "lapse-fund" ||
            CurrentRecord.val().paymentType == "miscellaneous")
        ) {
          name = CurrentRecord.val().name;
          borrowerID = CurrentRecord.val().borrowerID;
          amountPaid = CurrentRecord.val().amountPaid;
          paymentDate = CurrentRecord.val().paymentDate;
          paymentType = CurrentRecord.val().paymentType;

          admin = CurrentRecord.val().admin;
          paymentTime = CurrentRecord.val().paymentTime;

          paymentRecords.push({
            name,
            borrowerID,
            amountPaid,
            paymentType,
            paymentDate,
            admin,
            paymentTime,
          });
        }
      });

      // Reverse the order of paymentRecords array
      paymentRecords.reverse();

      // Clear the table
      const tbody = document.getElementById("tbody1");
      tbody.innerHTML = "";

      // Add the records to the table in the new order
      paymentRecords.forEach((record) => {
        AddItemsToTable(
          record.name,
          record.borrowerID,
          record.amountPaid,
          record.paymentType,
          record.paymentDate,
          record.admin,
          record.paymentTime
        );
      });
    });

  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", function () {
    filterTable(searchInput.value.trim());
  });
}

function filterTable(query) {
  const table = document.getElementById("tbody1");
  const rows = table.getElementsByTagName("tr");

  for (let i = 0; i < rows.length; i++) {
    const nameCell = rows[i].querySelector("[data-label='Fullname']");
    if (nameCell) {
      const name = nameCell.textContent || nameCell.innerText;
      const display = name.toLowerCase().includes(query.toLowerCase());
      rows[i].style.display = display ? "" : "none";
    }
  }
}

//ADD ITEMS TO TABLE
function AddItemsToTable(
  name,
  borrowerID,
  amountPaid,
  paymentType,
  paymentDate,
  admin,
  paymentTime
) {
  var tbody = document.getElementById("tbody1");
  var trow = document.createElement("tr");

  var td0 = document.createElement("td");
  var td1 = document.createElement("td");
  var td2 = document.createElement("td");
  var td3 = document.createElement("td");
  var td4 = document.createElement("td");
  var td5 = document.createElement("td");
  var td6 = document.createElement("td");
  var tdEdit = document.createElement("td");
  let editButton = document.createElement("button");

  editButton.innerHTML = "Edit";
  editButton.addEventListener("click", function () {
    document.querySelector(".modal").style.display = "flex";
    document.getElementById("payment-submit").innerHTML = "Update";
    document.querySelector(".form-title").innerHTML = "Update Payment";
    document.getElementById("payment-type").value = paymentType;
    document.getElementById("brwid").value = borrowerID;
    document.getElementById("payment-amount").value = amountPaid;
    prevAmountValue = amountPaid;
    prevPaymentTime = paymentTime;
  });
  // Create delete button
  var deleteButton = document.createElement("button");
  deleteButton.innerHTML = "Delete";
  deleteButton.addEventListener("click", function () {
    // Call the delete function when the button is clicked
    deletePaymentRecord(paymentTime);
  });

  var td7 = document.createElement("td");
  td7.appendChild(deleteButton);
  td7.setAttribute("data-label", "Action");

  td0.innerHTML = borrowerID;
  td1.innerHTML = name;
  td2.innerHTML = amountPaid;
  td3.innerHTML = paymentType;
  td4.innerHTML = paymentDate;
  td5.innerHTML = admin;
  td6.innerHTML = paymentTime;
  tdEdit.appendChild(editButton);
  // td7.appendChild(deleteButton);

  td0.setAttribute("data-label", "Borrower ID");
  td1.setAttribute("data-label", "Fullname");
  td2.setAttribute("data-label", "Amount Paid");
  td3.setAttribute("data-label", "Payment Type");
  td4.setAttribute("data-label", "Date Paid");
  td5.setAttribute("data-label", "Admin");
  td6.setAttribute("data-label", "Payment Time");
  // td7.setAttribute("data-label", "Action");

  trow.appendChild(td0);
  trow.appendChild(td1);
  trow.appendChild(td2);
  trow.appendChild(td3);
  trow.appendChild(td4);
  trow.appendChild(td5);
  trow.appendChild(td6);
  trow.appendChild(td7);
  trow.appendChild(tdEdit);
  tbody.appendChild(trow);
}

function deletePaymentRecord(paymentTime, paymentType) {
  if (window.confirm("Are you sure you want to delete this payment?")) {
    firebase
      .database()
      .ref("payments/" + paymentTime)
      .remove()
      .then(() => {
        alert("Payment deleted successfully.");
        window.location.reload(); // Refresh the page or update the table as needed
      })
      .catch((error) => {
        console.error("Error deleting payment:", error);
        alert(
          "An error occurred while deleting the payment. Please try again."
        );
      });
  }
}

// UPDATE SAVINGS
function updateSavings(borrowerID, amountPaid) {
  return new Promise((resolve, reject) => {
    firebase
      .database()
      .ref("borrowers/" + borrowerID)
      .once("value")
      .then(function (snapshot) {
        const borrower = snapshot.val();
        if (!borrower) {
          console.error(
            "Borrower data not found for borrowerID: " + borrowerID
          );
          reject("Borrower data not found");
          return;
        }

        const prevSavings = borrower.savings || 0; // Ensure a default value if savings doesn't exist
        const updatedSavings = Number(prevSavings) + Number(amountPaid);

        firebase
          .database()
          .ref("borrowers/" + borrowerID)
          .update({ savings: updatedSavings })
          .then(() => {
            resolve();
          })
          .catch((error) => {
            console.error("Error updating savings:", error);
            reject("Error updating savings");
          });
      })
      .catch((error) => {
        console.error("Error fetching borrower data:", error);
        reject("Error fetching borrower data");
      });
  });
}

// UPDATE LOAN REPAYMENT
async function updateAmountPaid(borrowerID, amountPaid) {
  try {
    const loanSnapshot = await firebase
      .database()
      .ref("loans/" + borrowerID)
      .once("value");

    const loan = loanSnapshot.val();

    if (!loan) {
      throw new Error("Loan data not found for borrowerID: " + borrowerID);
    }

    const prevAmountPaid = Number(loan.amountPaid) || 0;
    const updatedAmountPaid = prevAmountPaid + Number(amountPaid);
    const loanAmt = Number(loan.totalPayable) - Number(amountPaid);

    // Update AmountPaid and Remaining TotalPayable
    await firebase
      .database()
      .ref("loans/" + borrowerID)
      .update({ amountPaid: updatedAmountPaid, totalPayable: loanAmt });
  } catch (error) {
    console.error("Error in updateAmountPaid:", error);
    throw error; // Rethrow the error to handle it in the calling code
  }
}

// LAPSEFUND PAYMENT
async function lapseFundPayment(borrowerID, amountPaid) {
  try {
    const loanSnapshot = await firebase
      .database()
      .ref("loans/" + borrowerID)
      .once("value");

    const loan = loanSnapshot.val();

    if (!loan) {
      throw new Error("Loan data not found for borrowerID: " + borrowerID);
    }

    const prevAmountPaid = Number(loan.lapseFund) || 0;
    const updatedAmountPaid = prevAmountPaid + Number(amountPaid);

    // Update LapseFund for Borrower
    await firebase
      .database()
      .ref("loans/" + borrowerID)
      .update({ lapseFund: updatedAmountPaid });
  } catch (error) {
    console.error("Error in lapseFundPayment:", error);
    throw error; // Rethrow the error to handle it in the calling code
  }
}

// CARD ISSUE PAYMENT
async function cardIssue(borrowerID, amountPaid) {
  try {
    const borrowerSnapshot = await firebase
      .database()
      .ref("loans/" + borrowerID)
      .once("value");

    const loan = borrowerSnapshot.val();

    if (!loan) {
      throw new Error("Borrower data not found for borrowerID: " + borrowerID);
    }

    const prevAmountPaid = Number(loan.cardIssue) || 0;
    const updatedAmountPaid = prevAmountPaid + Number(amountPaid);

    // Add Card Issue Payment to Capital
    const fixedSnapshot = await fixedCapitalRef.once("value");
    const prevFixedCapital = fixedSnapshot.val() || 0;
    const newFixedCapital = prevFixedCapital + Number(amountPaid);
    await fixedCapitalRef.set(newFixedCapital);

    const currentDate = convertMillisecondsToDate(new Date());

    // Retrieve previous capital
    const dailyCapitalSnapshot = await firebase
      .database()
      .ref("dailyCapital/" + branch + "/" + currentDate)
      .once("value");

    const prevCapital = dailyCapitalSnapshot.val() || 0;

    // Add the amount
    const newAmount = prevCapital + Number(amountPaid);

    // Update dailyCapital
    await firebase
      .database()
      .ref("dailyCapital/" + branch + "/" + currentDate)
      .set(newAmount);

    // Update Card Issue for borrower
    await firebase
      .database()
      .ref("loans/" + borrowerID)
      .update({ cardIssue: updatedAmountPaid });
  } catch (error) {
    console.error("Error in cardIssue:", error);
    throw error; // Rethrow the error to handle it in the calling code
  }
}

async function miscellaneous(borrowerID, amountPaid) {
  try {
    const loanSnapshot = await firebase
      .database()
      .ref("loans/" + borrowerID)
      .once("value");
    const loan = loanSnapshot.val();

    if (!loan) {
      throw new Error("Borrower data not found for borrowerID: " + borrowerID);
    }

    const prevAmountPaid = Number(loan.miscellaneous) || 0;
    const updatedAmountPaid = prevAmountPaid + Number(amountPaid);

    // Add Loan Payment to Capital
    const fixedSnapshot = await fixedCapitalRef.once("value");
    const prevFixedCapital = fixedSnapshot.val() || 0;
    const newFixedCapital = prevFixedCapital + Number(amountPaid);
    await fixedCapitalRef.set(newFixedCapital);

    const currentDate = convertMillisecondsToDate(new Date());

    // Retrieve previous capital
    const dailyCapitalSnapshot = await firebase
      .database()
      .ref("dailyCapital/" + branch + "/" + currentDate)
      .once("value");
    const prevCapital = dailyCapitalSnapshot.val() || 0;

    // Add the amount
    const newAmount = prevCapital + Number(amountPaid);

    // Update dailyCapital
    await firebase
      .database()
      .ref("dailyCapital/" + branch + "/" + currentDate)
      .set(newAmount);

    // Update Miscellaneous for Borrower
    await firebase
      .database()
      .ref("loans/" + borrowerID)
      .update({ miscellaneous: updatedAmountPaid });
  } catch (error) {
    console.error("Error in miscellaneous:", error);
    throw error; // Rethrow the error to handle it in the calling code
  }
}
// EDIT SAVINGS
function editSavings(borrowerID, amountPaid) {
  return new Promise((resolve, reject) => {
    firebase
      .database()
      .ref("borrowers/" + borrowerID)
      .once("value")
      .then(function (snapshot) {
        const borrower = snapshot.val();
        if (!borrower) {
          console.error(
            "Borrower data not found for borrowerID: " + borrowerID
          );
          reject("Borrower data not found");
          return;
        }

        const prevSavings = borrower.savings || 0; // Ensure a default value if savings doesn't exist
        const updatedSavings =
          Number(prevSavings) + Number(amountPaid) - Number(prevAmountValue);

        firebase
          .database()
          .ref("borrowers/" + borrowerID)
          .update({ savings: updatedSavings })
          .then(() => {
            resolve();
          })
          .catch((error) => {
            console.error("Error updating savings:", error);
            reject("Error updating savings");
          });
      })
      .catch((error) => {
        console.error("Error fetching borrower data:", error);
        reject("Error fetching borrower data");
      });
  });
}

// UPDATE LOAN REPAYMENT
async function editAmountPaid(borrowerID, amountPaid) {
  try {
    const loanSnapshot = await firebase
      .database()
      .ref("loans/" + borrowerID)
      .once("value");

    const loan = loanSnapshot.val();

    if (!loan) {
      throw new Error("Loan data not found for borrowerID: " + borrowerID);
    }

    const prevAmountPaid = Number(loan.amountPaid) || 0;
    const updatedAmountPaid =
      prevAmountPaid + Number(amountPaid) - Number(prevAmountValue);
    const loanAmt =
      Number(loan.totalPayable) - Number(amountPaid) + Number(prevAmountValue);

    // Update AmountPaid and Remaining TotalPayable
    await firebase
      .database()
      .ref("loans/" + borrowerID)
      .update({ amountPaid: updatedAmountPaid, totalPayable: loanAmt });
  } catch (error) {
    console.error("Error in updateAmountPaid:", error);
    throw error; // Rethrow the error to handle it in the calling code
  }
}

// LAPSEFUND PAYMENT
async function editlapseFund(borrowerID, amountPaid) {
  try {
    const loanSnapshot = await firebase
      .database()
      .ref("loans/" + borrowerID)
      .once("value");

    const loan = loanSnapshot.val();

    if (!loan) {
      throw new Error("Loan data not found for borrowerID: " + borrowerID);
    }

    const prevAmountPaid = Number(loan.lapseFund) || 0;
    const updatedAmountPaid =
      prevAmountPaid + Number(amountPaid) - Number(prevAmountValue);

    // Update LapseFund for Borrower
    await firebase
      .database()
      .ref("loans/" + borrowerID)
      .update({ lapseFund: updatedAmountPaid });
  } catch (error) {
    console.error("Error in lapseFundPayment:", error);
    throw error; // Rethrow the error to handle it in the calling code
  }
}

// CARD ISSUE PAYMENT
async function editCardIssue(borrowerID, amountPaid) {
  try {
    const borrowerSnapshot = await firebase
      .database()
      .ref("loans/" + borrowerID)
      .once("value");

    const loan = borrowerSnapshot.val();

    if (!loan) {
      throw new Error("Borrower data not found for borrowerID: " + borrowerID);
    }

    const prevAmountPaid = Number(loan.cardIssue) || 0;
    const updatedAmountPaid =
      prevAmountPaid + Number(amountPaid) - Number(prevAmountValue);

    // Add Card Issue Payment to Capital
    const fixedSnapshot = await fixedCapitalRef.once("value");
    const prevFixedCapital = fixedSnapshot.val() || 0;
    const newFixedCapital = prevFixedCapital + Number(amountPaid);
    await fixedCapitalRef.set(newFixedCapital);

    const currentDate = convertMillisecondsToDate(new Date());

    // Retrieve previous capital
    const dailyCapitalSnapshot = await firebase
      .database()
      .ref("dailyCapital/" + branch + "/" + currentDate)
      .once("value");

    const prevCapital = dailyCapitalSnapshot.val() || 0;

    // Add the amount
    const newAmount = prevCapital + Number(amountPaid);

    // Update dailyCapital
    await firebase
      .database()
      .ref("dailyCapital/" + branch + "/" + currentDate)
      .set(newAmount);

    // Update Card Issue for borrower
    await firebase
      .database()
      .ref("loans/" + borrowerID)
      .update({ cardIssue: updatedAmountPaid });
  } catch (error) {
    console.error("Error in cardIssue:", error);
    throw error; // Rethrow the error to handle it in the calling code
  }
}

async function editMisc(borrowerID, amountPaid) {
  try {
    const loanSnapshot = await firebase
      .database()
      .ref("loans/" + borrowerID)
      .once("value");
    const loan = loanSnapshot.val();

    if (!loan) {
      throw new Error("Borrower data not found for borrowerID: " + borrowerID);
    }

    const prevAmountPaid = Number(loan.miscellaneous) || 0;
    const updatedAmountPaid =
      prevAmountPaid + Number(amountPaid) - Number(prevAmountValue);

    // Add Loan Payment to Capital
    const fixedSnapshot = await fixedCapitalRef.once("value");
    const prevFixedCapital = fixedSnapshot.val() || 0;
    const newFixedCapital = prevFixedCapital + Number(amountPaid);
    await fixedCapitalRef.set(newFixedCapital);

    const currentDate = convertMillisecondsToDate(new Date());

    // Retrieve previous capital
    const dailyCapitalSnapshot = await firebase
      .database()
      .ref("dailyCapital/" + branch + "/" + currentDate)
      .once("value");
    const prevCapital = dailyCapitalSnapshot.val() || 0;

    // Add the amount
    const newAmount = prevCapital + Number(amountPaid);

    // Update dailyCapital
    await firebase
      .database()
      .ref("dailyCapital/" + branch + "/" + currentDate)
      .set(newAmount);

    // Update Miscellaneous for Borrower
    await firebase
      .database()
      .ref("loans/" + borrowerID)
      .update({ miscellaneous: updatedAmountPaid });
  } catch (error) {
    console.error("Error in miscellaneous:", error);
    throw error; // Rethrow the error to handle it in the calling code
  }
}

document.getElementById("dateSearch").addEventListener("input", function (e) {
  e.preventDefault();
  const query = document.getElementById("dateSearch").value;
  const table = document.getElementById("tbody1");
  const rows = table.getElementsByTagName("tr");

  for (let i = 0; i < rows.length; i++) {
    const startDateCell = rows[i].querySelector("[data-label='Date Paid']");
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
