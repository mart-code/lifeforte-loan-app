const registerBtn = (document.getElementById("signup").onclick = (e) => {
  e.preventDefault();
  
  const branch = document.getElementById("branch").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (
    !/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      email
    )
  ) {
    document.getElementById("email").style.borderBottom = "solid red 2px";
    document.getElementById("error").innerHTML = "Email is not valid";

    return false;
  }

  if (password.length < 6) {
    document.getElementById("password").style.borderBottom = "solid red 2px";
    document.getElementById("error").innerHTML =
      "Password must be at least 6 characters";

    return false;
  }

  firebase
    .firestore()
    .collection(`users`)
    .where("email", "==", email)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        if (doc.data().email === email) {
          document.getElementById("email").style.borderBottom = "solid red 2px";
          document.getElementById("error").innerHTML =
            "Email already exists, please choose a different one";

          return false;
        }
      });
    })
    .catch((error) => {
      console.log("Unable to fetch document", error);
    });

  {
    document.getElementById("signup").setAttribute("aria-disabled", "true");

    const today = new Date();

    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((userCredentials) => {
        firebase
          .firestore()
          .collection(`users`)
          .doc(email)
          .set({
            branch,
            email,
            userId: userCredentials.user.uid,
            created_at:
              today.getFullYear() +
              " " +
              (today.getMonth() + 1) +
              " " +
              today.getDate(),
          })
          .then(() => {
            alert("User created successfully");
            window.location.href = "./login.html";
          });
      })
      .catch((error) => {
        document.getElementById("email").style.borderBottom = "solid red 2px";
        document.getElementById("error").innerHTML = error.message;
        document.getElementById("signup").setAttribute("aria-disabled", "true");
        return false;
      });
  }
});
