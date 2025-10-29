const LOCAL_STORAGE_QUOTA = 5 * 1024 * 1024; // 5 MB approx quota

const formSection = document.querySelector(".form-section");
document.addEventListener("DOMContentLoaded", () => {
  const formSection = document.querySelector(".form-section");
  const getPartitionData = JSON.parse(localStorage.getItem("disk-partitions"));
  if (getPartitionData && getPartitionData.length > 0) {
    formSection.style.display = "none";
  } else {
    formSection.style.display = "block";
  }
  const folders = JSON.parse(localStorage.getItem("folders"));
  if (folders) {
    window.location.pathname = "window.html";
  }
});

// Calculate approximate localStorage used space in bytes
function getUsedLocalStorageSize() {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    total += key.length * 2 + value.length * 2; // UTF-16: 2 bytes per char
  }
  return total;
}

function partitionsGenerator() {
  let noOfPartitions = document.querySelector("#noOfPartitions");
  let submitbtn = document.querySelector("#SubmitBtn");
  let partitionsName = ["C", "D", "E", "F", "G", "H"];
  let partitionsArray = [];
  submitbtn.addEventListener("click", (e) => {
    e.preventDefault();
    let valuePartitions = noOfPartitions.value;
    if (valuePartitions > 5) {
      alert("only 5 partitions are supported");
      return;
    }
    let newPartitionss = partitionsName.filter(
      (i, index) => index < valuePartitions
    );
    partitionsArray = [];
    newPartitionss.forEach((i) => partitionsArray.push({ name: i, size: 0 }));

    localStorage.setItem("disk-partitions", JSON.stringify(partitionsArray));
    document.querySelector(".displayDetails").innerHTML = "";
    renderPartitionCard();
    formSection.style.display = "none";
  });
}
partitionsGenerator();

function renderPartitionCard() {
  let diskinfo = JSON.parse(localStorage.getItem("disk-partitions"));
  if (diskinfo) {
    let displayWrapper = document.querySelector(".displayDetails");
    displayWrapper.innerHTML = ""; // Clear before re-rendering
    diskinfo.forEach((item, index) => {
      const Drives = document.createElement("div");
      Drives.classList.add("Drives");
      Drives.innerHTML = `
        <div class="Drives">
           <h1 id=${index + 1}>${item.name}: drive</h1>
           <form>
             <div class="justify-between">
               <label>Allocate Space (KB):</label>
               <p>Initial Size : ${item.size}</p>
             </div>
             <input
               class="input"
               type="text"
               id=${index + 1}
               placeholder="Enter the space you want to allocate (KB)"
             />
             <button id=${
               index + 1
             } class="sizeSubmit" type="submit">Submit</button>
           </form>
         </div>
      `;
      displayWrapper.append(Drives);
    });

    const continueBtn = document.querySelector(".continueBtn");
    continueBtn.innerHTML = `
      <button><a style="text-decoration:none; color:white" href="window.html">Click to Continue</a></button>
      <button id="clear">Clear Partitions</button>
      <button id="Reset">Reset Partitions size</button>
    `;

    const clearBtn = document.querySelector("#clear");
    const resetBtn = document.querySelector("#Reset");
    const sizebtn = document.querySelectorAll(".sizeSubmit");

    clearBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("disk-partitions");
      document.querySelector(".displayDetails").innerHTML = "";
      document.querySelector(".continueBtn").innerHTML = "";
      formSection.style.display = "block";
    });

    resetBtn.addEventListener("click", (e) => {
      e.preventDefault();
      let item = JSON.parse(localStorage.getItem("disk-partitions"));
      item.forEach((i, k) => (item[k].size = 0));
      localStorage.setItem("disk-partitions", JSON.stringify(item));
      alert("Partition sizes have been reset!");
      renderPartitionCard();
    });

    sizebtn.forEach((btn, index) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const input = btn.previousElementSibling;
        const inputValue = input.value.trim();

        if (!inputValue || isNaN(inputValue) || Number(inputValue) < 0) {
          alert("Please enter a valid size");
          return;
        }

        const sizeInBytes = Number(inputValue) * 1024;

        const partitions = JSON.parse(localStorage.getItem("disk-partitions"));

        let otherPartitionsSize = partitions.reduce((acc, p, idx) => {
          if (idx !== index) return acc + p.size * 1024;
          return acc;
        }, 0);

        const usedSize = getUsedLocalStorageSize();

        let oldPartitionSize = partitions[index].size * 1024;

        const availableSpace =
          LOCAL_STORAGE_QUOTA -
          usedSize +
          oldPartitionSize -
          otherPartitionsSize;

        if (sizeInBytes > availableSpace) {
          alert(
            `Not enough space. You can allocate up to about ${Math.floor(
              availableSpace / 1024
            )} KB.`
          );
          return;
        }

        // Update partition size in KB
        partitions[index].size = Number(inputValue);
        localStorage.setItem("disk-partitions", JSON.stringify(partitions));
        alert(`${partitions[index].name} size updated to ${inputValue} KB`);
        renderPartitionCard();
      });
    });
  }
}
renderPartitionCard();
