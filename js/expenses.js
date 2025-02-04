// Reference to the expenses in the database
window.onload = updateTable;
document.addEventListener("DOMContentLoaded", updateTable);

const expensesRef = firebase.database().ref("expenses");
const branch = sessionStorage.getItem("region");
const fixedCapitalRef = firebase.database().ref("fixedCapital/" + branch);
document.getElementById("adminName").innerHTML =
  sessionStorage.getItem("userEmail");

function convertMillisecondsToDate(milliseconds) {
  const date = new Date(milliseconds);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is zero-indexed
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const date = convertMillisecondsToDate(new Date().getTime());

document.getElementById("expense-submit").onclick = function (e) {
  e.preventDefault();
  if (confirm("Are you sure?")) {
    const paymentType = document.getElementById("paymentType").value;
    const paymentDate = document.getElementById("payment-date").value;
    const paymentAmount = document.getElementById("payment-amount").value;
    const expenseRemarks = document.getElementById("expense-remarks").value;

    // Validate input
    if (!paymentType || !paymentDate || !paymentAmount) {
      alert("Please fill in all fields.");
      return;
    }

    // Add the expense to the database
    expensesRef
      .push({
        paymentType,
        paymentDate,
        paymentAmount,
        expenseRemarks,
        branch,
      })

      .then(() => {
        alert("Expenses removed from Capital");
        window.location = "/expenses.html";
      })
      .catch((error) => {
        console.error("Failed to get fixed capital value:", error);
      });
  }
};

// Function to update the table with expenses
function updateTable() {
  // Clear existing table rows
  const tbody = document.getElementById("tbody1");
  tbody.innerHTML = "";

  // Fetch expenses from the database, ordered by payment date
  expensesRef
    .orderByChild("paymentDate")
    .once("value")
    .then((snapshot) => {
      // Convert snapshot to an array for sorting
      const expenses = [];
      snapshot.forEach((expenseSnapshot) => {
        if (expenseSnapshot.val().branch == branch) {
          expenses.push(expenseSnapshot.val());
        }
      });

      // Sort expenses by payment date in descending order
      expenses.sort((a, b) => b.paymentDate - a.paymentDate);
      expenses.reverse();
      // Render sorted expenses in the table
      expenses.forEach((expense) => {
        const row = document.createElement("tr");

        // Create table cells
        const typeCell = document.createElement("td");
        typeCell.textContent = expense.paymentType;
        typeCell.setAttribute("data-label", "expenses");
        row.appendChild(typeCell);

        const dateCell = document.createElement("td");
        dateCell.textContent = expense.paymentDate;
        dateCell.setAttribute("data-label", "Date Paid");
        row.appendChild(dateCell);

        const amountCell = document.createElement("td");
        amountCell.textContent = expense.paymentAmount;
        row.appendChild(amountCell);

        const remarksCell = document.createElement("td");
        remarksCell.textContent = expense.expenseRemarks;
        row.appendChild(remarksCell);

        // Create delete button
        const deleteButtonCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
          // Remove the expense from the database
          expensesRef
            .child(expense.id) // Assuming each expense has a unique ID
            .remove()
            .then(() => {
              alert("Expense deleted successfully.");
              updateTable(); // Refresh the table after deletion
            })
            .catch((error) => {
              console.error("Error deleting expense:", error);
              alert("Failed to delete expense.");
            });
        });
        deleteButtonCell.appendChild(deleteButton);
        row.appendChild(deleteButtonCell);
        tbody.appendChild(row);
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
    const nameCell = rows[i].querySelector("[data-label='expenses']");
    if (nameCell) {
      const name = nameCell.textContent || nameCell.innerText;
      const display = name.toLowerCase().includes(query.toLowerCase());
      rows[i].style.display = display ? "" : "none";
    }
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

