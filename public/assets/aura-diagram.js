const dialog = document.querySelector("#architecture-dialog");
const openButton = document.querySelector(".architecture-open");
const image = document.querySelector(".architecture-image");
const textOpenButton = document.querySelector(".architecture-text-open");
const closeButton = document.querySelector(".architecture-close");
const zoomArea = document.querySelector(".architecture-zoom-area");
const zoomImage = zoomArea?.querySelector("img");
let lastTrigger;

if (dialog && closeButton) {
  const open = (trigger) => {
    lastTrigger = trigger;
    dialog.showModal();
  };

  openButton?.addEventListener("click", () => open(openButton));
  textOpenButton?.addEventListener("click", () => open(textOpenButton));
  image?.addEventListener("click", () => open(image));
  image?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open(image);
    }
  });
  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => lastTrigger?.focus());
}

if (zoomArea && zoomImage) {
  const magnification = 2.2;
  let originX = 0;
  let originY = 0;
  let currentScale = 1;

  const resetZoom = () => {
    originX = 0;
    originY = 0;
    currentScale = 1;
    zoomImage.style.transform = "";
    zoomImage.style.transformOrigin = "";
    zoomArea.classList.remove("is-zoomed");
  };

  zoomArea.addEventListener("pointermove", (event) => {
    const areaBounds = zoomArea.getBoundingClientRect();
    const styles = getComputedStyle(zoomArea);
    const baseLeft = areaBounds.left + zoomArea.clientLeft + parseFloat(styles.paddingLeft) + (zoomArea.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight) - zoomImage.clientWidth) / 2;
    const baseTop = areaBounds.top + zoomArea.clientTop + parseFloat(styles.paddingTop);
    const transformedX = (event.clientX - baseLeft - originX * (1 - currentScale)) / currentScale;
    const transformedY = (event.clientY - baseTop - originY * (1 - currentScale)) / currentScale;

    if (transformedX < 0 || transformedY < 0 || transformedX > zoomImage.clientWidth || transformedY > zoomImage.clientHeight) {
      resetZoom();
      return;
    }

    originX = transformedX;
    originY = transformedY;
    zoomImage.style.transformOrigin = `${originX}px ${originY}px`;
    zoomImage.style.transform = `scale(${magnification})`;
    currentScale = magnification;
    zoomArea.classList.add("is-zoomed");
  });

  zoomArea.addEventListener("pointerleave", resetZoom);
}
