//LOAD BORROWERS ON DOCUMENT LOAD
window.onload = SelectAllData;
document.addEventListener("DOMContentLoaded", SelectAllData);

const region = sessionStorage.getItem("region");
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

//GET ALL DATA
function SelectAllData() {
  firebase
    .database()
    .ref(`borrowers`)
    .on("value", function (AllRecords) {
      AllRecords.forEach(function (CurrentRecord) {
        if (CurrentRecord.val().branch == region) {
          borrowerID = CurrentRecord.val().borrowerID;
          name = CurrentRecord.val().name;
          phone = CurrentRecord.val().phone;
          address = CurrentRecord.val().address;
          occupation = CurrentRecord.val().occupation;
          gname = CurrentRecord.val().gname;
          savings = CurrentRecord.val().savings;
          gphone = CurrentRecord.val().gphone;
          gaddress = CurrentRecord.val().gaddress;
          goccupation = CurrentRecord.val().goccupation;

          AddItemsToTable(
            borrowerID,
            name,
            phone,
            address,
            occupation,
            savings,
            gname,
            gphone,
            gaddress,
            goccupation
          );
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
  borrowerID,
  name,
  phone,
  address,
  occupation,
  savings,
  gname,
  gphone,
  gaddress,
  goccupation
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
  var td7 = document.createElement("td");
  var td8 = document.createElement("td");
  var td9 = document.createElement("td");

  td0.innerHTML = borrowerID;
  td1.innerHTML = name;
  td2.innerHTML = phone;
  td3.innerHTML = savings;
  td4.innerHTML = address;
  td5.innerHTML = occupation;
  td6.innerHTML = gname;
  td7.innerHTML = gaddress;
  td8.innerHTML = gphone;
  td9.innerHTML = goccupation;

  td0.setAttribute("data-label", "Borrower ID");
  td1.setAttribute("data-label", "Fullname");
  td2.setAttribute("data-label", "Phone No.");
  td3.setAttribute("data-label", "Savings");
  td4.setAttribute("data-label", "Resident Address");
  td5.setAttribute("data-label", "Occupation");
  td6.setAttribute("data-label", "Gurantor's Name");
  td7.setAttribute("data-label", "Gurantor's Address");
  td8.setAttribute("data-label", "Gurantor's Phone No.");
  td9.setAttribute("data-label", "Gurantor's Occupation");

  trow.appendChild(td0);
  trow.appendChild(td1);
  trow.appendChild(td2);
  trow.appendChild(td3);
  trow.appendChild(td4);
  trow.appendChild(td5);
  trow.appendChild(td6);
  trow.appendChild(td7);
  trow.appendChild(td8);
  trow.appendChild(td9);
  tbody.appendChild(trow);
}

// ADD BORROWERS
document.getElementById("add-borrower").onclick = async function (e) {
  e.preventDefault();

  //READY VALUES TO BE UPLOADED
  let borrowerID = region + "-" + getRandomInt(1000000, 9000000);
  let name = document.getElementById("name").value;
  let phone = document.getElementById("phone").value;
  let address = document.getElementById("address").value;
  let occupation = document.getElementById("occupation").value;
  let gname = document.getElementById("gname").value;
  let gphone = document.getElementById("gphone").value;
  let goccupation = document.getElementById("goccupation").value;
  let gaddress = document.getElementById("gaddress").value;

  let branch = region;
  let registration = Number(document.getElementById("registration").value);
  let dateAdded = new Date().getTime();

  //ID GENERATOR
  function getRandomInt(min, max) {
    let num = Math.floor(Math.random() * (max - min + 1)) + min;
    return num;
  }

  ///////////////INSERTING VALUES INTO DATABASE//////////////////////////

  try {
    await firebase
      .database()
      .ref(`borrowers/` + borrowerID)
      .set({
        borrowerID,
        name,
        phone,
        address,
        occupation,
        gname,
        gphone,
        goccupation,
        gaddress,
        savings: 0,
        branch,
        dateAdded,
        registration,
      });

    const capitalRef = firebase.database().ref("capital/" + branch);
    await capitalRef.push({
      type: "registration Added",
      amount: registration,
      date: new Date().toISOString().split("T")[0],
      branch,
    });

    alert("Borrower Added Successfully");
    window.location.href = "/borrowers.html";
    return false;
  } catch (error) {
    alert("An error occurred");
  }
};

// EDIT BORROWERS
document.getElementById("update").onclick = function () {
  ///////////////READY VALUES TO BE UPLOADED////////////////////////////////
  let borrowerID = document.getElementById("brwid").value;
  let name = document.getElementById("name").value;
  let phone = document.getElementById("phone").value;
  let address = document.getElementById("address").value;
  let occupation = document.getElementById("name").value;
  let gname = document.getElementById("gname").value;
  let gphone = document.getElementById("gphone").value;
  let goccupation = document.getElementById("goccupation").value;
  let gaddress = document.getElementById("gaddress").value;
  let savings = document.getElementById("savings").value;

  firebase
    .database()
    .ref(`borrowers/` + borrowerID)
    .update({
      name,
      phone,
      address,
      occupation,
      gname,
      gphone,
      goccupation,
      gaddress,
      savings,
      branch: region,
    })
    .then(() => {
      alert("Update Successful");
      window.location.href = "/borrowers.html";
      return false;
    })
    .catch((error) => {
      alert("An error occurred");
    });
};

document.getElementById("brwid").onchange = function () {
  firebase
    .database()
    .ref("borrowers")
    .on("value", function (AllRecords) {
      AllRecords.forEach(function (CurrentRecord) {
        if (
          CurrentRecord.val().borrowerID ==
          document.getElementById("brwid").value
        ) {
          document
            .getElementById("name")
            .setAttribute("value", CurrentRecord.val().name);
          document
            .getElementById("phone")
            .setAttribute("value", CurrentRecord.val().phone);
          document
            .getElementById("address")
            .setAttribute("value", CurrentRecord.val().address);
          document
            .getElementById("occupation")
            .setAttribute("value", CurrentRecord.val().occupation);
          document
            .getElementById("gname")
            .setAttribute("value", CurrentRecord.val().gname);
          document
            .getElementById("savings")
            .setAttribute("value", CurrentRecord.val().savings);
          document
            .getElementById("gphone")
            .setAttribute("value", CurrentRecord.val().gphone);
          document
            .getElementById("gaddress")
            .setAttribute("value", CurrentRecord.val().gaddress);
          document
            .getElementById("goccupation")
            .setAttribute("value", CurrentRecord.val().goccupation);
        }
      });
    });
};

//Delete Borrower Function
document.getElementById("deleteBrw").onclick = function (e) {
  e.preventDefault();
  let borrower = document.getElementById("deleteId").value;

  firebase
    .database()
    .ref("borrowers/" + borrower)
    .remove()
    .then(() => {
      firebase
        .database()
        .ref("loans/" + borrower)
        .remove();
    })

    .then(() => {
      alert("Deleted Successfully");
      window.location.href = "/borrowers.html";
      return false;
    });
};
