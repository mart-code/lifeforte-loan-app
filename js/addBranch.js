window.onload = SelectAllData;
document.getElementById("adminName").innerHTML =
  sessionStorage.getItem("userEmail");
document.getElementById("add-branch").addEventListener("click", function (e) {
  e.preventDefault();

  let branchName = document.getElementById("branchName").value;
  let branchValue = document.getElementById("branchValue").value;


  firebase
    .database()
    .ref("regions/" + branchValue)
    .set({
      branchName,
      branchValue,
    })
    .then(() => {
      alert("Branch Added Successfully");
      window.location.href = "/branches.html";
      return false;
    })
    .catch((error) => {
      alert("An error occurred");
    });
});

function SelectAllData() {
  var db = firebase.database();

  // Reference to a specific collection in Firestore
  var collectionRef = db.ref("regions");

  // Fetch data from the collection
  collectionRef.once("value", function (AllRecords) {
    AllRecords.forEach((snapshot) => {
      AddItemsToTable(snapshot.key, snapshot.val().branchName);
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
    const nameCell = rows[i].querySelector("[data-label='Branch']");
    if (nameCell) {
      const name = nameCell.textContent || nameCell.innerText;
      const display = name.toLowerCase().includes(query.toLowerCase());
      rows[i].style.display = display ? "" : "none";
    }
  }
}

// ADD ITEMS TO TABLE
function AddItemsToTable(branchValue, branchName) {
  var tbody = document.getElementById("tbody1");
  var trow = document.createElement("tr");

  var td1 = document.createElement("td");
  var td2 = document.createElement("td");

  var deleteButton = document.createElement("button");
  deleteButton.innerHTML = "Delete";
  deleteButton.addEventListener("click", function () {
    // Call the delete function when the button is clicked
    deleteBranch(branchValue);
  });

  td1.innerHTML = branchName;
  td2.appendChild(deleteButton);

  td1.setAttribute("data-label", "Branch");
  td2.setAttribute("data-label", "Action");

  trow.appendChild(td1);
  trow.appendChild(td2);

  tbody.appendChild(trow);
}

// DELETE BRANCH
function deleteBranch(branchValue) {
  if (window.confirm("Are you sure you want to delete this branch?")) {
    firebase
      .database()
      .ref("regions/" + branchValue)
      .remove()
      .then(() => {
        alert("Branch deleted successfully");
        // Refresh the page after deletion
        window.location.reload();
      })
      .catch((error) => {
        alert("An error occurred while deleting the branch");
      });
  }
}
