const branch = sessionStorage.getItem("region");
const userEmail = sessionStorage.getItem("userEmail");
document.getElementById("adminName").innerHTML =
  sessionStorage.getItem("userEmail");

const fixedCapitalRef = firebase.database().ref("fixedCapital/" + branch);
function convertMillisecondsToDate(milliseconds) {
  const date = new Date(milliseconds);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is zero-indexed
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
function myDate(milliseconds) {
  const date = new Date(milliseconds);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is zero-indexed
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}
window.onload = getSavings;
const brwID = document.getElementById("brwid");
brwID.addEventListener("input", handleBorrower);

let borrowerID, paymentType, paymentDate, amountPaid, paymentTime, remarks;

function Ready() {
  amountPaid = Number(document.getElementById("withdrawAmt").value);
  paymentDate = convertMillisecondsToDate(new Date().getTime());
  paymentTime = new Date().getTime();
  remarks = document.getElementById("remarks").value;
}

function handleBorrower() {
  
  if (brwID.value.length == 12) {
    firebase
      .database()
      .ref("borrowers/" + brwID.value)
      .on("value", async function (snapshot) {
        
        document.getElementById("fname").value = await snapshot.val().name;
        document.getElementById("savings").value = await snapshot.val().savings;
      });

    firebase
      .database()
      .ref("loans/" + brwID.value)
      .on("value", async function (snapshot) {
        document.getElementById("loanAmt").value = await snapshot.val()
          .totalPayable;
      });
  }
}

//withdraw SAVINGS
document.getElementById("withdraw").onclick = function (e) {
  Ready();
  e.preventDefault();
  const checker =
    Number(document.getElementById("savings").value) -
    Number(document.getElementById("withdrawAmt").value);
  if (checker < 0) {
    document.getElementById("savings").style.borderBottom = "red 1px solid";
  } else {
    setPaymentRecord(
      document.getElementById("fname").value,
      "Withdraw",
      Number(document.getElementById("withdrawAmt").value),
      document.getElementById("remarks").value
    );
    updateSavings(brwID.value, document.getElementById("withdrawAmt").value);
  }
};

function updateSavings(borrowerID, amountPaid) {
  firebase
    .database()
    .ref("borrowers/" + borrowerID)
    .once("value")
    .then(function (snapshot) {
      const borrower = snapshot.val();
      const prevSavings = borrower.savings || 0; // Ensure a default value if savings doesn't exist

      const updatedSavings = Number(prevSavings) - Number(amountPaid);

      // Return the updatedSavings directly to the next then block
      return updatedSavings;
    })
    .then((updatedSavings) => {
      // Now you can directly use updatedSavings here
      return firebase
        .database()
        .ref("borrowers/" + borrowerID)
        .update({ savings: updatedSavings });
    })
    .then(() => {
      alert("Savings Updated Successfully");
      window.location.href = "/savings.html";
      return false;
    })
    .catch((error) => {
      console.error("Error in updating savings:", error);
      alert(`Error in Updating Savings`);
    });
}

//update LOANS
document.getElementById("adjust").onclick = function (e) {
  e.preventDefault();
  const checker =
    Number(document.getElementById("loanAmt").value) -
    Number(document.getElementById("withdrawAmt").value);

  if (
    checker < 0 &&
    Number(
      document.getElementById("withdrawAmt") >
        Number(document.getElementById("savings"))
    )
  ) {
    document.getElementById("withdrawAmt").style.borderBottom = "red 1px solid";
  } else {
    setPaymentRecord(
      document.getElementById("fname").value,
      "Adjust",
      Number(document.getElementById("withdrawAmt").value),
      document.getElementById("remarks").value
    );
    updateAmountPaid(
      brwID.value,
      Number(document.getElementById("withdrawAmt").value)
    );
  }
};

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

    await firebase
      .database()
      .ref("borrowers/" + borrowerID)
      .update({
        savings:
          Number(document.getElementById("savings").value) - Number(amountPaid),
      });

    alert("Added to Daily Capital successful!");

    await firebase
      .database()
      .ref("loans/" + borrowerID)
      .update({
        amountPaid: updatedAmountPaid,
        totalPayable: loanAmt,
      });

    alert("Adjust Successful");
    window.location.href = "/savings.html";
    return false;
  } catch (error) {
    console.error("Error in updateAmountPaid:", error);
    alert("An error occurred. Please check the console for details.");
  }
}

function setPaymentRecord(name, paymentType, amountPaid, remarks) {
  const paymentTime = new Date().getTime();
  const paymentDate = convertMillisecondsToDate(new Date());
  firebase
    .database()
    .ref("payments/" + paymentTime)
    .set({
      name,
      borrowerID: brwID.value,
      amountPaid,
      paymentType,
      paymentDate, // Ensure paymentDate is defined and has a valid value
      paymentTime,
      remarks,
      branch,
      admin: userEmail,
    })
    .then(() => {
      alert("Payment Successful");
    })
    .catch((error) => {
      alert("An Error Occurred", error.message);
    });
}

function getSavings() {
  firebase
    .database()
    .ref(`payments`)
    .orderByChild("paymentTime")
    .once("value", function (AllRecords) {
      let paymentRecords = [];

      AllRecords.forEach(function (CurrentRecord) {
        if (
          CurrentRecord.val().branch == branch &&
          (CurrentRecord.val().paymentType == "Withdraw" ||
            CurrentRecord.val().paymentType == "Adjust" ||
            CurrentRecord.val().paymentType == "savings")
        ) {
          name = CurrentRecord.val().name;
          borrowerID = CurrentRecord.val().borrowerID;
          amountPaid = CurrentRecord.val().amountPaid;
          paymentDate = CurrentRecord.val().paymentDate;
          paymentType = CurrentRecord.val().paymentType;
          remarks = CurrentRecord.val().remarks;
          admin = CurrentRecord.val().admin;

          paymentRecords.push({
            name,
            borrowerID,
            amountPaid,
            paymentType,
            paymentDate,
            admin,
            remarks,
          });
        }
        // Proceed with processing the data
        
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
          record.remarks
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
  // var td7 = document.createElement("td");

  // var deleteButton = document.createElement("button");
  // deleteButton.innerHTML = "Delete";
  // deleteButton.addEventListener("click", function () {
  //   // Call the delete function when the button is clicked
  //   deletePaymentRecord(paymentTime);
  // });

  td0.innerHTML = borrowerID;
  td1.innerHTML = name;
  td2.innerHTML = amountPaid;
  td3.innerHTML = paymentType;
  td4.innerHTML = paymentDate;
  td5.innerHTML = admin;
  td6.innerHTML = paymentTime;
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
  // trow.appendChild(td7);

  tbody.appendChild(trow);
}

function convertMillisecondsToDate(milliseconds) {
  const date = new Date(milliseconds);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is zero-indexed
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
