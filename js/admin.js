window.onload = onLoads;
document.getElementById("adminName").innerHTML =
  sessionStorage.getItem("userEmail");
function getRegion() {
  let location = document.getElementById("branch");
  let locationValue = "";
  firebase
    .database()
    .ref("regions")
    .once("value", function (Cuurrent) {
      Cuurrent.forEach(function (Region) {
        locationValue += `<option value=${Region.val().branchValue}>${
          Region.val().branchName
        }</option>`;
      });
 
      location.innerHTML = locationValue;
      // location.appendChild(locationValue);
    });
}

function onLoads() {
  getRegion();
  SelectAllData();
}

const region = sessionStorage.getItem("region");

//GET ALL DATA
function SelectAllData() {

  var db = firebase.firestore();

  // Reference to a specific collection in Firestore
  var collectionRef = db.collection("users");

  // Fetch data from the collection
  collectionRef.get().then(function (querySnapshot) {
    querySnapshot.forEach(function (doc) {
      // doc.data() contains the document data
      if (doc.data().branch == region) {
        AddItemsToTable(doc.data().email, doc.data().branch);
      }
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
    const nameCell = rows[i].querySelector("[data-label='Admins']");
    if (nameCell) {
      const name = nameCell.textContent || nameCell.innerText;
      const display = name.toLowerCase().includes(query.toLowerCase());
      rows[i].style.display = display ? "" : "none";
    }
  }
}

//ADD ITEMS TO TABLE
// ADD ITEMS TO TABLE
function AddItemsToTable(admins, branch) {
  // Add this line to log the adminId
  var tbody = document.getElementById("tbody1");
  var trow = document.createElement("tr");
  var td0 = document.createElement("td");
  var td1 = document.createElement("td");
  var td2 = document.createElement("td");

  td0.innerHTML = admins;
  td1.innerHTML = branch;

  td0.setAttribute("data-label", "Admins");
  td1.setAttribute("data-label", "Branch");

  // Create a delete button
  var deleteButton = document.createElement("button");
  deleteButton.innerHTML = "Delete";
  deleteButton.addEventListener("click", function () {
    // Call a function to handle deletion, passing the adminId for identification
    deleteAdmin(admins);
  });

  td2.appendChild(deleteButton);
  trow.appendChild(td0);
  trow.appendChild(td1);
  trow.appendChild(td2);

  tbody.appendChild(trow);
}

function deleteAdmin(adminId) {
  var db = firebase.firestore();

  // Reference to the 'users' collection
  var collectionRef = db.collection("users");

  // Use adminId to identify the specific admin document
  var adminDocRef = collectionRef.doc(adminId);

  // Delete the admin document
  adminDocRef
    .delete()
    .then(function () {
      alert("Admin deleted successfully!");
      // Optionally, you can also remove the row from the table for a better user experience
    })
    .catch(function (error) {
      console.error("Error deleting admin: ", error);
    });
}
