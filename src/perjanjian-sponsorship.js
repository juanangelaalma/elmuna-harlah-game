const printButton = document.querySelector("#print-agreement");

printButton.addEventListener("click", async () => {
  await document.fonts.ready;
  window.print();
});

printButton.disabled = false;
