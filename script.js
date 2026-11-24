const demoDetails = document.querySelector("#demo-details")
const demoButton = document.querySelector(".hero .button")

demoButton.addEventListener("click", () => {
  demoDetails.open = true
})
