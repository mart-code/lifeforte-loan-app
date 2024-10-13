const branch = sessionStorage.getItem("region");
const userEmail = sessionStorage.getItem("userEmail");
const capitalRef = firebase.database().ref("capital/" + branch);
const paymentRef = firebase.database().ref("payments");
const fixedCapitalRef = firebase.database().ref("fixedCapital/" + branch);
const expensesRef = firebase.database().ref("expenses");
document.getElementById("adminName").innerHTML = userEmail;

let totalLoanDisbursed = 0;
let totalExpenses = 0;
let totalCapitalDeduct = 0;
// let totalLoanFees = 0;
let totalLoanPayment = 0;
let totalLapseFund = 0;
let totalCardPayment = 0;
let totalMiscPayment = 0;
let totalCapitalAdded = 0;
let expectedInterest = 0;
let totalSavings = 0;
let totalPassbook = 0;
let totalRegistration = 0;
let totalAppFee = 0;
let totalRiskFee = 0;

function convertMillisecondsToDate(milliseconds) {
  const date = new Date(milliseconds);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formattedDate(milliseconds) {
  const date = new Date(milliseconds);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is zero-indexed
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

let today = convertMillisecondsToDate(new Date().getTime);

// Function to update HTML elements with calculated totals
function updateTotals() {
  // Add logic to update HTML elements with calculated totals
  document.getElementById("totalLoanDisbursed").innerText = totalLoanDisbursed;
  document.getElementById("totalExpenses").innerText = totalExpenses;
  document.getElementById("totalCapitalDeduct").innerText = totalCapitalDeduct;
  // document.getElementById("totalLoanFees").innerText = totalLoanFees;
  document.getElementById("totalLoanPayment").innerText = totalLoanPayment;
  document.getElementById("totalLapseFund").innerText = totalLapseFund;
  document.getElementById("totalCardPayment").innerText = totalCardPayment;
  document.getElementById("totalMiscPayment").innerText = totalMiscPayment;
  document.getElementById("totalCapitalAdded").innerText = totalCapitalAdded;
  document.getElementById("totalSavings").innerHTML = totalSavings;
  document.getElementById("totalLoanInterest").innerHTML = expectedInterest;
  document.getElementById("totalPassbook").innerHTML = totalPassbook;
  document.getElementById("totalRegistration").innerHTML = totalRegistration;
  document.getElementById("totalAppFee").innerHTML = totalAppFee;
  document.getElementById("totalRiskFee").innerHTML = totalRiskFee;
  document.getElementById("netprofit").innerHTML =
    totalCapitalAdded +
    totalLoanPayment +
    totalCardPayment +
    totalLapseFund +
    totalMiscPayment -
    (totalLoanDisbursed + totalCapitalDeduct + totalExpenses);
  document.getElementById("netprofit2").innerHTML =
    totalCapitalAdded +
    totalLoanPayment +
    totalCardPayment +
    totalLapseFund +
    totalMiscPayment -
    (totalLoanDisbursed + totalExpenses);
}

// Function to calculate daily totals
function calculateTotals() {
  const selectedDate = document.getElementById("selectedDate").value;
  const today = convertMillisecondsToDate(selectedDate);
  resetTotals();

  paymentRef
    .once("value", (AllRecords) => {
      AllRecords.forEach((snapshot) => {
        if (
          snapshot.val().branch == branch &&
          snapshot.val().paymentDate == today
        ) {
          if (
            snapshot.val().paymentType == "loan-payment" ||
            snapshot.val().paymentType == "Adjust"
          ) {
            totalLoanPayment += parseInt(snapshot.val().amountPaid);
            console.log(totalLoanPayment);
          } else if (snapshot.val().paymentType == "lapse-fund") {
            totalLapseFund += parseInt(snapshot.val().amountPaid);
          } else if (snapshot.val().paymentType == "card-issue") {
            totalCardPayment += parseInt(snapshot.val().amountPaid);
          } else if (snapshot.val().paymentType == "miscellaneous") {
            totalMiscPayment += parseInt(snapshot.val().amountPaid);
          } else if (snapshot.val().paymentType == "savings") {
            totalSavings += parseInt(snapshot.val().amountPaid);
          }
        }
      });
    })
    .then(() => {
      capitalRef.once("value", (AllRecords) => {
        AllRecords.forEach((snapshot) => {
          // Calculate totals for debit
          if (
            snapshot.val().type == "loan disbursed" &&
            snapshot.val().date == today
          ) {
            totalLoanDisbursed += parseInt(snapshot.val().amount);
          }

          if (snapshot.val().type == "Deduct" && snapshot.val().date == today) {
            totalCapitalDeduct += parseInt(snapshot.val().amount);
          }

          if (
            snapshot.val().type == "registration Added" &&
            snapshot.val().date == today
          ) {
            totalRegistration += parseInt(snapshot.val().amount);
          }

          if (
            snapshot.val().type == "passBook Added" &&
            snapshot.val().date == today
          ) {
            totalPassbook += parseInt(snapshot.val().amount);
          }

          if (
            snapshot.val().type == "loanApplication Added" &&
            snapshot.val().date == today
          ) {
            totalAppFee += parseInt(snapshot.val().amount);
          }

          if (
            snapshot.val().type == "riskManagement Added" &&
            snapshot.val().date == today
          ) {
            totalRiskFee += parseInt(snapshot.val().amount);
          }

          // Calculate total capital added

          if (snapshot.val().type == "Add" && snapshot.val().date == today) {
            totalCapitalAdded += parseInt(snapshot.val().amount);
          }
        });

        //INTEREST EXPECTED
        // firebase
        //   .database()
        //   .ref("loans")
        //   .on("value", function (AllRecords) {
        //     AllRecords.forEach(function (CurrentRecord) {
        //       if (
        //         CurrentRecord.val().branch == branch &&
        //         CurrentRecord.val().loanStart == today
        //       ) {
        //         expectedInterest +=
        //           (CurrentRecord.val().loanInterest *
        //             CurrentRecord.val().loanAmount) /
        //           100;
        //       }
        //     });
        //   });
        expectedInterest = (totalLoanDisbursed * 15) / 100;
        s;
      });
    })
    .then(() => {
      expensesRef
        .once("value", (AllRecords) => {
          AllRecords.forEach((snapshot) => {
            if (
              snapshot.val().branch == branch &&
              snapshot.val().paymentDate == today
            ) {
              totalExpenses += parseInt(snapshot.val().paymentAmount);
            }
          });
        })
        .then(() => {
          updateTotals();
        });
    });
}

// Function to calculate monthly totals
function calculateMonthlyTotals(month, year) {
  resetTotals();

  capitalRef
    .once("value", (allRecords) => {
      allRecords.forEach((snapshot) => {
        const recordDate = new Date(snapshot.val().date);
        const recordMonth = recordDate.getMonth() + 1; // Month is zero-indexed
        const recordYear = recordDate.getFullYear();

        if (recordMonth == month && recordYear == year) {
          // Calculate totals for debit based on month and year
          if (snapshot.val().type == "loan disbursed") {
            totalLoanDisbursed += parseInt(snapshot.val().amount);
          } else if (snapshot.val().type == "Deduct") {
            totalCapitalDeduct += parseInt(snapshot.val().amount);
          } else if (snapshot.val().type == "registration Added") {
            totalRegistration += parseInt(snapshot.val().amount);
          } else if (snapshot.val().type == "passBook Added") {
            totalPassbook += parseInt(snapshot.val().amount);
          } else if (snapshot.val().type == "loanApplication Added") {
            totalAppFee += parseInt(snapshot.val().amount);
          } else if (snapshot.val().type == "riskManagement Added") {
            totalRiskFee += parseInt(snapshot.val().amount);
          }

          // Calculate total capital added based on month and year
          else if (snapshot.val().type == "Add") {
            totalCapitalAdded += parseInt(snapshot.val().amount);
          }
        }
      });

      //INTEREST EXPECTED
      // firebase
      //   .database()
      //   .ref("loans")
      //   .once("value", function (AllRecords) {
      //     AllRecords.forEach(function (CurrentRecord) {
      //       const recordDate = new Date(CurrentRecord.val().loanStart);
      //       const recordMonth = recordDate.getMonth() + 1; // Month is zero-indexed
      //       const recordYear = recordDate.getFullYear();
      //       if (
      //         CurrentRecord.val().branch == branch &&
      //         recordMonth == month &&
      //         recordYear == year
      //       ) {
      //         console.log(recordYear, year, recordMonth, month);
      //         expectedInterest +=
      //           (CurrentRecord.val().loanInterest *
      //             CurrentRecord.val().loanAmount) /
      //           100;
      //       }
      //     });
      //   });
    })
    .then(() => {
      // Calculate total expenses based on month and year
      expensesRef
        .once("value", (allRecords) => {
          allRecords.forEach((snapshot) => {
            const paymentDate = new Date(snapshot.val().paymentDate);
            const paymentMonth = paymentDate.getMonth() + 1; // Month is zero-indexed
            const paymentYear = paymentDate.getFullYear();

            if (
              snapshot.val().branch == branch &&
              paymentMonth == month &&
              paymentYear == year
            ) {
              totalExpenses += parseInt(snapshot.val().paymentAmount);
            }
          });

          // // Calculate expected interest for the month
          // calculateExpectedInterest(month, year);
        })
        .then(() => {
          paymentRef
            .once("value", (AllRecords) => {
              AllRecords.forEach((snapshot) => {
                const paymentDate = new Date(snapshot.val().paymentDate);
                const paymentMonth = paymentDate.getMonth() + 1; // Month is zero-indexed
                const paymentYear = paymentDate.getFullYear();

                if (
                  snapshot.val().branch == branch &&
                  paymentMonth == month &&
                  paymentYear == year
                ) {
                  if (
                    snapshot.val().paymentType == "loan-payment" ||
                    snapshot.val().paymentType == "Adjust"
                  ) {
                    totalLoanPayment += parseInt(snapshot.val().amountPaid);
                  } else if (snapshot.val().paymentType == "lapse-fund") {
                    totalLapseFund += parseInt(snapshot.val().amountPaid);
                  } else if (snapshot.val().paymentType == "card-issue") {
                    totalCardPayment += parseInt(snapshot.val().amountPaid);
                  } else if (snapshot.val().paymentType == "miscellaneous") {
                    totalMiscPayment += parseInt(snapshot.val().amountPaid);
                  } else if (snapshot.val().paymentType == "savings") {
                    totalSavings += parseInt(snapshot.val().amountPaid);
                  }
                }
                console.log(totalSavings);
              });
            })
            .then(() => {
              expectedInterest = (totalLoanDisbursed * 15) / 100;
              // Update HTML elements with monthly totals
              updateTotals();
            });
        });
    });
}

// Function to calculate yearly totals
function calculateYearlyTotals(year) {
  resetTotals();
  capitalRef
    .once("value", (allRecords) => {
      allRecords.forEach((snapshot) => {
        const recordYear = new Date(snapshot.val().date).getFullYear();

        if (recordYear == year) {
          // Calculate totals for debit based on year
          if (snapshot.val().type == "loan disbursed") {
            totalLoanDisbursed += parseInt(snapshot.val().amount);
          } else if (snapshot.val().type == "Deduct") {
            totalCapitalDeduct += parseInt(snapshot.val().amount);
          } else if (snapshot.val().type == "registration Added") {
            totalRegistration += parseInt(snapshot.val().amount);
          } else if (snapshot.val().type == "passBook Added") {
            totalPassbook += parseInt(snapshot.val().amount);
          } else if (snapshot.val().type == "loanApplication Added") {
            totalAppFee += parseInt(snapshot.val().amount);
          } else if (snapshot.val().type == "riskManagement Added") {
            totalRiskFee += parseInt(snapshot.val().amount);
          }
          // Calculate total capital added based on year
          else if (snapshot.val().type == "Add") {
            totalCapitalAdded += parseInt(snapshot.val().amount);
          }
        }
      });

      //INTEREST EXPECTED
      // firebase
      //   .database()
      //   .ref("loans")
      //   .on("value", function (AllRecords) {
      //     AllRecords.forEach(function (CurrentRecord) {
      //       const recordDate = new Date(CurrentRecord.val().loanStart);

      //       const recordYear = recordDate.getFullYear();
      //       if (CurrentRecord.val().branch == branch && recordYear == year) {
      //         expectedInterest +=
      //           (CurrentRecord.val().loanInterest *
      //             CurrentRecord.val().loanAmount) /
      //           100;
      //       }
      //     });
      //   });
    })
    .then(() => {
      // Calculate total expenses based on year
      expensesRef.once("value", (allRecords) => {
        allRecords
          .forEach((snapshot) => {
            const paymentYear = new Date(
              snapshot.val().paymentDate
            ).getFullYear();
            if (snapshot.val().branch == branch && paymentYear == year) {
              totalExpenses += parseInt(snapshot.val().paymentAmount);
            }
          })
          .then(() => {
            paymentRef
              .once("value", (AllRecords) => {
                AllRecords.forEach((snapshot) => {
                  const paymentDate = new Date(snapshot.val().paymentDate);
                  const paymentYear = paymentDate.getFullYear();

                  if (snapshot.val().branch == branch && paymentYear == year) {
                    if (
                      snapshot.val().paymentType == "loan-payment" ||
                      snapshot.val().paymentType == "Adjust"
                    ) {
                      totalLoanPayment += parseInt(snapshot.val().amountPaid);
                    } else if (snapshot.val().paymentType == "lapse-fund") {
                      totalLapseFund += parseInt(snapshot.val().amountPaid);
                    } else if (snapshot.val().paymentType == "card-issue") {
                      totalCardPayment += parseInt(snapshot.val().amountPaid);
                    } else if (snapshot.val().paymentType == "miscellaneous") {
                      totalMiscPayment += parseInt(snapshot.val().amountPaid);
                    }
                  }
                });
              })
              .then(() => {
                expectedInterest = (totalLoanDisbursed * 15) / 100;
                // Update HTML elements with yearly totals
                updateTotals();
              });
          });

        // Calculate expected interest for the year
        // for (let month = 1; month <= 12; month++) {
        //   calculateExpectedInterest(month, year);
        // }
      });
    });
}

// Function to calculate expected interest for a specific month and year
// function calculateExpectedInterest(month, year) {
//   firebase
//     .database()
//     .ref("loans")
//     .once("value", (allRecords) => {
//       allRecords.forEach((snapshot) => {
//         const loanStart = new Date(snapshot.val().loanStart);
//         const loanMonth = loanStart.getMonth() + 1; // Month is zero-indexed
//         const loanYear = loanStart.getFullYear();

//         if (
//           snapshot.val().branch == branch &&
//           loanMonth == month &&
//           loanYear == year
//         ) {
//           expectedInterest +=
//             (snapshot.val().loanInterest * snapshot.val().loanAmount) / 100;
//         }
//       });

//       // Update HTML elements with expected interest
//       updateTotals();
//     });
// }

// Function to check report for a selected date
function checkReport() {
  resetTotals();
  var selectedDate = document.getElementById("selectedDate").value;
  today = convertMillisecondsToDate(selectedDate);
  // Reset totals before recalculating

  // Perform necessary calculations and update the table values accordingly for the selected date
  // Example: Displaying an alert for demonstration purposes
  alert("Checking report for date: " + selectedDate);
  // Recalculate totals for the selected date
  calculateTotals();
}

function checkMonthlyReport() {
  resetTotals();

  calculateMonthlyTotals(
    document.getElementById("selectedMonth").value,
    document.getElementById("selectedYear").value
  );
}

function checkYearlyReport() {
  resetTotals();

  calculateYearlyTotals(document.getElementById("selectedYearYearly").value);
}

// Function to reset totals
function resetTotals() {
  totalLoanDisbursed = 0;
  totalExpenses = 0;
  totalCapitalDeduct = 0;
  // totalLoanFees = 0;
  totalLoanPayment = 0;
  totalLapseFund = 0;
  totalCardPayment = 0;
  totalMiscPayment = 0;
  totalCapitalAdded = 0;
  expectedInterest = 0;
  totalSavings = 0;
  totalAppFee = 0;
  totalPassbook = 0;
  totalRegistration = 0;
  totalRiskFee = 0;
}
