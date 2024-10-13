document.getElementById("logout-btn").onclick = () => {
  
  firebase
    .auth()
    .signOut()
    .then(() => {
      sessionStorage.removeItem("uid");
      sessionStorage.removeItem("region");
      alert("Logged out");
      window.location.href = "/login.html";
      return false;
    })
    .catch((error) => {
      alert("An error occured");
    });
};
