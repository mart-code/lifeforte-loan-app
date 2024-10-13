document.getElementById("signin").onclick = (e) => {
  e.preventDefault();
  let region = document.getElementById("region").value;
  sessionStorage.setItem("region", region);
  

  const password = document.getElementById("password").value;
  const email = document.getElementById("email").value;

  document.getElementById("signin").setAttribute("aria-disabled", "true");

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredentials) => {
      sessionStorage.setItem("uid", userCredentials.user.uid);
      sessionStorage.setItem("userEmail", userCredentials.user.email);

      firebase
        .firestore()
        .collection("users")
        .doc(email)
        .get()
        .then(function (doc) {
          if (doc.data().branch == region) {
            window.location.href = "./index.html";
          } else {
            alert("Invalid Credentials");
          }
        });
    })
    .catch((error) => {
      alert("Invalid Credentials").then(function () {
        document.getElementById("signin").setAttribute("aria-disabled", "true");
        return false;
      });
    });
};
