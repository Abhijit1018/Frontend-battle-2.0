document.querySelectorAll(".brand-kit").forEach(kit => {
    kit.addEventListener("click", () => {
      document.querySelectorAll(".brand-kit").forEach(k => {
        k.classList.remove("selected");
        k.querySelector(".checkbox").classList.remove("checked");
      });
  
      kit.classList.add("selected");
      kit.querySelector(".checkbox").classList.add("checked");
    });
  });
  