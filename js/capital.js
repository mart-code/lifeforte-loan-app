const branch = sessionStorage.getItem("region");
const today = new Date().toISOString().split("T")[0];

const capitalRef = firebase.database().ref("capital/" + branch);
document.getElementById("adminName").innerHTML =
  sessionStorage.getItem("userEmail");

function displayFixedCapital() {
  const fixedCapitalDisplay = document.getElementById("fixedCapitalValue");

  // Listen for changes in fixed capital value
  fixedCapitalRef.on("value", function (snapshot) {
    const fixedCapitalValue = snapshot.val() || 0;
    fixedCapitalDisplay.innerHTML = `₦${fixedCapitalValue}`; // Update the display
  });
}

// Reference to the daily capital in the database

document.getElementById("deduct").onclick = function capitalDeduct(e) {
  e.preventDefault();
  const amount = document.getElementById("deduct-amt").value;
  const date = document.getElementById("deduct-date").value;
  const remark = document.getElementById("deduct-remark").value;
  if (confirm("Are you sure?")) {
    deductCapital(date, amount, remark);
  }
};

document.getElementById("capital").onclick = function capitalAdd(e) {
  e.preventDefault();
  const amount = document.getElementById("capital-amt").value;
  const date = document.getElementById("capital-date").value;
  const remark = document.getElementById("capital-remark").value;

  if (confirm("Are you sure?")) {
    addCapital(amount, date, remark);
  }
};

// Function to add capital and store the last record for the day
function addCapital(amount, date, remark) {
  // Push the data to the capital records
  capitalRef
    .push({
      type: "Add",
      amount: amount,
      date: date,
      branch,
      remark: remark,
    })
    .then(() => {
      alert("Capital Added");
      window.location = "/capital.html";
    })
    .catch((error) => {
      console.error("Failed to get fixed capital value:", error);
    });

  // firebase
  //   .database()
  //   .ref("dailyCapital/" + branch + "/" + date)
  //   .once("value")
  //   .then((snapshot) => {
  //     const prevCapital = snapshot.val() || 0;

  //     // Add the amount
  //     const newAmount = prevCapital + parseInt(amount);

  //     // Update the value in the database
  //     return firebase
  //       .database()
  //       .ref("dailyCapital/" + branch + "/" + date)
  //       .set(newAmount);
  //   })
}

// Function to deduct from daily capital
function deductCapital(date, amount, remark) {
  // Reference to the fixed capital in the database

  capitalRef
    .push({
      type: "Deduct",
      amount: amount,
      date: date,
      branch,
      remark: remark,
    })
    .then(() => {
      alert("Capital Deduction successful!");
      window.location = "/capital.html";
    })
    .catch((error) => {
      alert("Capital Deduction failed:", error);
    });
  // Get the current value of fixed capital

  // firebase
  //   .database()
  //   .ref("dailyCapital/" + branch + "/" + date)
  //   .once("value")
  //   .then((snapshot) => {
  //     const prevCapital = snapshot.val() || 0;

  //     // Add the amount
  //     const newAmount = prevCapital - parseInt(amount);

  //     // Update the value in the database
  //     return firebase
  //       .database()
  //       .ref("dailyCapital/" + branch + "/" + date)
  //       .set(newAmount);
  //   })
}

// Function to display capital records in the table
function displayCapitalRecords() {
  const tableBody = document.getElementById("tbody1");

  // Clear existing table rows
  tableBody.innerHTML = "";

  // Retrieve and display capital records
  capitalRef.on("value", function (snapshot) {
    snapshot.forEach(function (record) {
      if (
        record.val().branch == branch &&
        (record.val().type == "Add" || record.val().type == "Deduct")
      ) {
        const data = record.val();
        const row = tableBody.insertRow(0);

        row.insertCell(0).textContent = data.type;
        row.insertCell(1).textContent = data.amount;
        row.insertCell(2).textContent = data.date;
        row.insertCell(3).textContent = data.remark;

        // Add delete button to each row
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete-btn");
        row.insertCell(4).appendChild(deleteButton);

        // Add event listener to delete button
        deleteButton.addEventListener("click", function () {
          if (confirm("Are you sure you want to delete this record?")) {
            deleteCapitalRecord(record.key); // Pass the key of the record to delete
          }
        });
      }
    });
  });
}

// Function to delete a capital record from Firebase
function deleteCapitalRecord(recordKey) {
  capitalRef
    .child(recordKey)
    .remove()
    .then(() => {
      alert("Record deleted successfully!");
    })
    .catch((error) => {
      console.error("Error deleting record:", error);
    });
}

// Call the function to display initial records
displayCapitalRecords();

function getToday() {
  return new Date().toISOString().split("T")[0];
}

document.getElementById("capitalBtn").onclick = function (e) {
  e.preventDefault();
  let capitalDate = document.getElementById("capitalDate").value;
  let totalCapitalAdded = 0,
    totalCapitalDeduct = 0;
  capitalRef.get().then((AllRecords) => {
    AllRecords.forEach((snapshot) => {
      if (snapshot.val().type == "Add" && snapshot.val().date == capitalDate) {
        totalCapitalAdded += parseInt(snapshot.val().amount) || 0;
      } else if (
        snapshot.val().type == "Deduct" &&
        snapshot.val().date == capitalDate
      ) {
        totalCapitalDeduct += parseInt(snapshot.val().amount) || 0;
      }
    });

    document.getElementById("fixedCapitalValue").innerHTML = parseInt(
      totalCapitalAdded - totalCapitalDeduct
    );
  });
};
