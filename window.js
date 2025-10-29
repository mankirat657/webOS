let body = document.querySelector("body");
let draggedFolder = null;
let originalPosition = { x: 0, y: 0 };
function makeDraggable(windowElement) {
  const header = windowElement.querySelector(".window-header");
  let isDragging = false;
  let startX, startY, initialX, initialY;

  header.addEventListener("mousedown", startDrag);
  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", stopDrag);

  function startDrag(e) {
    if (e.target.closest(".control-btn")) return;

    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;

    const style = window.getComputedStyle(windowElement);
    initialX = parseInt(style.left, 10) || 0;
    initialY = parseInt(style.top, 10) || 0;

    bringToFront(windowElement);

    e.preventDefault();
  }

  function drag(e) {
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    let newX = initialX + dx;
    let newY = initialY + dy;

    const maxX = window.innerWidth - windowElement.offsetWidth;
    const maxY = window.innerHeight - windowElement.offsetHeight;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    windowElement.style.left = newX + "px";
    windowElement.style.top = newY + "px";
  }

  function stopDrag() {
    isDragging = false;
  }
}

document.body.addEventListener("dragstart", (e) => {
  if (e.target.classList.contains("folder") || e.target.closest(".folder")) {
    const folder = e.target.classList.contains("folder")
      ? e.target
      : e.target.closest(".folder");
    e.dataTransfer.setData("text/plain", folder.id);
    draggedFolder = folder;
    folder.classList.add("dragging");
    originalPosition.x = folder.offsetLeft;
    originalPosition.y = folder.offsetTop;

    e.dataTransfer.effectAllowed = "move";

    setTimeout(() => {
      folder.style.opacity = "0.7";
    }, 0);
  }
});

document.body.addEventListener("dragend", (e) => {
  if (draggedFolder) {
    draggedFolder.classList.remove("dragging");
    draggedFolder.style.opacity = "1";

    const overFolder = e.target.classList.contains("folder")
      ? e.target
      : e.target.closest(".folder");
    if (overFolder && overFolder !== draggedFolder) {
      draggedFolder.style.left = originalPosition.x + "px";
      draggedFolder.style.top = originalPosition.y + "px";
    }

    draggedFolder = null;
  }
});

document.body.addEventListener("dragover", (e) => {
  e.preventDefault();
  const overFolder = e.target.classList.contains("folder")
    ? e.target
    : e.target.closest(".folder");
  if (overFolder && overFolder !== draggedFolder) {
    e.dataTransfer.dropEffect = "none";
    overFolder.classList.add("drag-over-denied");
  } else {
    e.dataTransfer.dropEffect = "move";
  }
});

document.body.addEventListener("dragleave", (e) => {
  document.querySelectorAll(".folder").forEach((folder) => {
    folder.classList.remove("drag-over-denied");
  });
});

document.body.addEventListener("drop", (e) => {
  e.preventDefault();
  document.querySelectorAll(".folder").forEach((folder) => {
    folder.classList.remove("drag-over-denied");
  });

  if (draggedFolder) {
    const overFolder = e.target.classList.contains("folder")
      ? e.target
      : e.target.closest(".folder");

    if (overFolder && overFolder !== draggedFolder) {
      draggedFolder.style.left = originalPosition.x + "px";
      draggedFolder.style.top = originalPosition.y + "px";
    } else {
      const rect = body.getBoundingClientRect();
      const x = e.clientX - rect.left - draggedFolder.offsetWidth / 2;
      const y = e.clientY - rect.top - draggedFolder.offsetHeight / 2;

      draggedFolder.style.position = "absolute";
      draggedFolder.style.left = x + "px";
      draggedFolder.style.top = y + "px";

      updateFolderPosition(draggedFolder.id, x, y);
    }
  }
});

function updateFolderPosition(folderId, x, y) {
  const folders = JSON.parse(localStorage.getItem("folders")) || [];
  const folderIndex = folders.findIndex((f) => f.id === folderId);

  if (folderIndex !== -1) {
    folders[folderIndex].position = { x, y };
    localStorage.setItem("folders", JSON.stringify(folders));
  }
}

function renderMenu() {
  body.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    document.querySelectorAll(".menu").forEach((m) => m.remove());

    const menuHTML = `
      <div class="menu-item menu-strong"><i class="ri-layout-grid-line"></i>View <i class="ri-arrow-right-s-line arrow"></i></div>
      <div class="menu-item"><i class="ri-sort-desc"></i>Sort by <i class="ri-arrow-right-s-line arrow"></i></div>
      <div class="menu-item refresh"><i class="ri-refresh-line"></i>Refresh</div>
      <hr class="menu-sep">
      <div class="menu-item" id="newoption" ><i class="ri-add-line"></i>New <i class="ri-arrow-right-s-line arrow"></i><div id='createFolder' class="childoption menu-item">
  <i class="ri-folder-line"></i>
  new Folder
</div>
</div>
      <hr class="menu-sep">
      <div class="menu-item"><i class="ri-computer-line"></i>Display settings</div>
      <div class="menu-item"><i class="ri-brush-line"></i>Personalize</div>
      <hr class="menu-sep">
      <div class="menu-item"><i class="ri-terminal-line"></i>Open in Terminal</div>
    `;
    let menu = document.createElement("div");
    menu.classList.add("menu");
    menu.innerHTML = menuHTML;
    if (e.clientY > 300) {
      menu.style.transform = "translate(0%,-100%)";
      menu.style.top = e.clientY + "px";
      menu.style.left = e.clientX + "px";
    } else {
      menu.style.top = e.clientY + "px";
      menu.style.left = e.clientX + "px";
    }
    console.log(e.clientX, e.clientY);

    body.appendChild(menu);

    let childOption = document.querySelector(".childoption");
    let newoptions = document.querySelector("#newoption");
    newoptions.addEventListener("mouseenter", (e) => {
      childOption.style.display = "block";
      childOption.style.position = "absolute";
      childOption.style.right = "-90%";
    });

    childOption.addEventListener("mouseleave", (e) => {
      if (!newoptions.contains(e.relatedTarget)) {
        childOption.style.display = "none";
      }
    });
    const createFolder = document.querySelector("#createFolder");
    createFolder.addEventListener("click", () => {
      let folderWrapper = document.querySelector(".folderWrapper");
      let newFolder = document.createElement("div");
      const newFolderId = generateUniqueId();
      newFolder.classList.add("folder");
      newFolder.setAttribute("draggable", "true");
      newFolder.id = newFolderId;
      const rect = folderWrapper.getBoundingClientRect();
      const x = rect.width / 2 - 50;
      const y = rect.height / 2 - 50;

      newFolder.style.position = "absolute";
      newFolder.style.left = x + "px";
      newFolder.style.top = y + "px";

      newFolder.innerHTML = `
        <i class="ri-folder-3-fill"></i>
        <input type="text" placeholder="folder1" class="folderinput" />
      `;

      folderWrapper.append(newFolder);
      const newInput = newFolder.querySelector(".folderinput");
      newInput.focus();

      newInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          let folders = JSON.parse(localStorage.getItem("folders")) || [];
          let folderValue = newInput.value || "New Folder";
          folders.push({
            id: newFolderId,
            folderName: folderValue,
            position: { x, y },
          });
          localStorage.setItem("folders", JSON.stringify(folders));
          displayFolders();
        }
      });
    });

    const reshreshbtn = document.querySelector(".refresh");
    reshreshbtn.addEventListener("click", () => {
      window.location.reload();
    });

    body.addEventListener(
      "click",
      () => {
        menu.remove();
      },
      { once: true }
    );

    body.addEventListener(
      "contextmenu",
      () => {
        menu.remove();
      },
      { once: true }
    );
  });
}

renderMenu();

function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function displayFolders() {
  const getFolders = JSON.parse(localStorage.getItem("folders"));
  console.log(getFolders);

  let folderWrapper = document.querySelector(".folderWrapper");
  folderWrapper.innerHTML = "";

  Array.isArray(getFolders) &&
    getFolders.map((item, index) => {
      let newFolder = document.createElement("div");
      newFolder.classList.add("folder", "disfol");
      newFolder.setAttribute("draggable", "true");
      newFolder.id = item.id;

      if (item.position) {
        newFolder.style.position = "absolute";
        newFolder.style.left = item.position.x + "px";
        newFolder.style.top = item.position.y + "px";
      }

      newFolder.innerHTML = `
        <i class="ri-folder-3-fill"></i>
        <input readonly type="text" style="outline: none" value="${item.folderName}" placeholder="folder1" class="folderinput" />
      `;
      folderWrapper.append(newFolder);
    });

  const renameFolder = document.querySelectorAll(".disfol");

  body.addEventListener("click", () => {
    document.querySelectorAll(".menu").forEach((menu) => menu.remove());
  });

  renameFolder.forEach((item, index) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      let menuHTML = `
      <div class="menu-item renamebtn" id=${item.id}><i class="ri-sort-desc"></i>Rename <i class="ri-arrow-right-s-line arrow"></i></div>
      <hr class="menu-sep">
      <div class="menu-item delete" id=${item.id}><i class="ri-refresh-line"></i>Delete</div>
      <div class="menu-item"><i class="ri-terminal-line"></i>Open in Terminal</div>
    `;
      document.querySelectorAll(".menu").forEach((menu) => menu.remove());
      let Foldermenu = document.createElement("div");
      Foldermenu.classList.add("menu");
      Foldermenu.innerHTML = menuHTML;
      if (e.clientY > 300) {
        Foldermenu.style.transform = "translate(0%,-100%)";
        Foldermenu.style.top = e.clientY + "px";
        Foldermenu.style.left = e.clientX + "px";
      } else {
        Foldermenu.style.top = e.clientY + "px";
        Foldermenu.style.left = e.clientX + "px";
      }
      console.log(e.clientX, e.clientY);

      body.append(Foldermenu);
      const renamebtn = document.querySelector(".renamebtn");
      console.log(renamebtn);
      console.log(item.id);
      renamebtn.addEventListener("click", (e) => {
        const getFolderDetails = JSON.parse(localStorage.getItem("folders"));
        console.log(getFolderDetails);
        const FolderIndex = getFolderDetails.findIndex(
          (f) => f.id == renamebtn.id
        );
        const folderinput = item.children[1];
        folderinput.readOnly = false;
        folderinput.focus();
        folderinput.select();
        folderinput.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            getFolderDetails[FolderIndex].folderName = folderinput.value;
            localStorage.setItem("folders", JSON.stringify(getFolderDetails));
            displayFolders();
          }
        });
      });
      const deletebtn = document.querySelector(".delete");
      deletebtn.addEventListener("click", (e) => {
        const getFolderDetails = JSON.parse(localStorage.getItem("folders"));
        console.log(getFolderDetails);
        const filteredFolders = getFolderDetails.filter(
          (f) => f.id != deletebtn.id
        );
        localStorage.setItem("folders", JSON.stringify(filteredFolders));
        if (filteredFolders) {
          displayFolders();
        }
      });
      console.log(deletebtn);
    });
  });

  const getAllFolders = document.querySelectorAll(".disfol");
  getAllFolders.forEach((item, index) => {
    item.addEventListener("dblclick", () => {
      document.querySelectorAll(".menu").forEach((menu) => menu.remove());
      const folderName = item.children[1].value;

      const folderStructureWrapper = document.createElement("div");
      folderStructureWrapper.innerHTML = ` 
          <div class="folder-structure-window" id=${item.id}>
      <div class="window-header">
        <div class="window-title">
          <i class="ri-folder-3-fill"></i>
          <span class="folder-name">${folderName}</span>
        </div>
        <div class="window-controls">
          <div class="control-btn minimize">
            <i class="ri-subtract-line"></i>
          </div>
          <div class="control-btn maximize">
            <i class="ri-checkbox-blank-line"></i>
          </div>
          <div class="control-btn cross">
            <i class="ri-close-line" ></i>
          </div>
        </div>
      </div>
      <div class="window-content">
        <div class="content-area">
          <div class="empty-folder">
            <i class="ri-folder-open-line"></i>
            <p>This folder is empty</p>
          </div>
        </div>
      </div>
      <div class="window-status-bar">
        <div class="status-item">1 item</div>
        <div class="status-item">0 bytes</div>
      </div>
    </div>
      `;
      body.append(folderStructureWrapper);
      const windowElement = folderStructureWrapper.querySelector(
        ".folder-structure-window"
      );
      makeDraggable(windowElement);
      const cross = windowElement.querySelector(".cross");
      console.log(cross);
      cross.addEventListener("click", (e) => {
        folderStructureWrapper.remove();
      });
      const maximize = windowElement.querySelector(".maximize");
      maximize.addEventListener("click", () => {
        windowElement.classList.toggle("maximized");
      });
      const getOpenedFolders = document.querySelectorAll(
        ".folder-structure-window"
      );
      getOpenedFolders.forEach((item, index) => {
        item.addEventListener("contextmenu", (e) => {
          e.stopPropagation();
          e.preventDefault();
          let folderCreateHTML = `
      <div class="menu-item renamebtn" id=${item.id}><i class="ri-sort-desc"></i>Rename <i class="ri-arrow-right-s-line arrow"></i></div>
      <hr class="menu-sep">
      <div class="menu-item delete" id=${item.id}><i class="ri-refresh-line"></i>Delete</div>
      <div class="menu-item"><i class="ri-terminal-line"></i>Open in Terminal</div>
    `;
          document.querySelectorAll(".menu").forEach((m) => m.remove());
          let folderCreateMenu = document.createElement("div");
          folderCreateMenu.classList.add("menu");
          folderCreateMenu.innerHTML = folderCreateHTML;
          if (e.clientY > 300) {
            folderCreateMenu.style.transform = "translate(0%,-100%)";
            FolderfolderCreateMenumenu.style.top = e.clientY + "px";
            folderCreateMenu.style.left = e.clientX + "px";
          } else {
            folderCreateMenu.style.top = e.clientY + "px";
            folderCreateMenu.style.left = e.clientX + "px";
          }

          body.append(folderCreateMenu);
        });
      });
    });
  });
}

displayFolders();
let openFolder = false;

function displayPartitions() {
  const getDisplayWindow = document.querySelector(".thisPC");
  const getPartitionsData = JSON.parse(localStorage.getItem("disk-partitions"));
  console.log(getPartitionsData);

  getDisplayWindow.addEventListener("click", (e) => {
    let thispcdiv = document.createElement("div");

    thispcdiv.innerHTML = `
    <div class="folderwindow">
  
      <div class="mainpcwrapper">
      <div class="explorer-window">
       <div class='closeButtons'>
      <div class='windbtn'>
      <i class="ri-subtract-fill"></i>
      <i class="ri-close-circle-fill" id="close" ></i>
      </div>
    </div>
        <div class="explorer-header">
          <div class="address-bar">
            <i class="ri-arrow-left-s-line"></i>
            <i class="ri-arrow-right-s-line"></i>
            <i class="ri-arrow-up-s-line"></i>
            <div class="address-text">This PC</div>
          </div>
          <div class="search-bar">
            <i class="ri-search-line"></i>
            <input type="text" placeholder="Search This PC" />
          </div>
        </div>

        <div class="explorer-content">
          <div class="sidebar">
            <div class="sidebar-section">
              <div class="sidebar-title">This PC</div>
              <div class="sidebar-item checked">
                <div class="checkbox checked"></div>
                <i class="ri-folder-5-line"></i>
                <span>Documents</span>
              </div>
              <div class="sidebar-item">
                <div class="checkbox"></div>
                <i class="ri-image-line"></i>
                <span>Pictures</span>
              </div>
              <div class="sidebar-item">
                <div class="checkbox"></div>
                <i class="ri-music-line"></i>
                <span>Music</span>
              </div>
              <div class="sidebar-item">
                <div class="checkbox"></div>
                <i class="ri-download-line"></i>
                <span>Downloads</span>
              </div>
              <div class="sidebar-item">
                <div class="checkbox"></div>
                <i class="ri-movie-line"></i>
                <span>Videos</span>
              </div>
              <div class="sidebar-item">
                <div class="checkbox"></div>
                <i class="ri-delete-bin-line"></i>
                <span>Recycle Bin</span>
              </div>
              <div class="sidebar-item">
                <div class="checkbox"></div>
                <i class="ri-folder-2-line"></i>
                <span>Id proof doc</span>
              </div>
              <div class="sidebar-item">
                <div class="checkbox"></div>
                <i class="ri-folder-code-line"></i>
                <span>javascriptment</span>
              </div>
              <div class="sidebar-item">
                <div class="checkbox"></div>
                <i class="ri-screenshot-line"></i>
                <span>Screenshots</span>
              </div>
            </div>
          </div>

          <div class="main-content">
            <div class="section-title">This PC</div>

            <div class="devices-section">
              <div class="section-title">Devices and drives</div>
              <div class="devices-grid">
              ${getPartitionsData
                .map((item, index) => {
                  return `<div class="device-card">
                  <div class="device-header">
                    <div class="device-icon">
                      <i class="ri-hard-drive-2-line"></i>
                    </div>
                    <div>
                      <div class="device-name">Local Disk (${item.name}:)</div>
                      <div class="device-details">${item.size} free of ${item.size}</div>
                    </div>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                  </div>
                </div>
`;
                })
                .join("")}
                
              
              </div>
            </div>
          </div>

          <div class="details-pane">
            <div class="details-title">Details</div>

            <div class="details-item">
              <div class="details-label">Type</div>
              <div class="details-value">File folder</div>
            </div>

            <div class="details-item">
              <div class="details-label">Location</div>
              <div class="details-value">This PC</div>
            </div>

            <div class="details-item">
              <div class="details-label">Size</div>
              <div class="details-value">2.14 TB</div>
            </div>

            <div class="details-item">
              <div class="details-label">Available space</div>
              <div class="details-value">677 GB</div>
            </div>

            <div class="details-item">
              <div class="details-label">Contains</div>
              <div class="details-value">9,284 Files, 124 Folders</div>
            </div>

            <div class="details-item">
              <div class="details-label">Date modified</div>
              <div class="details-value">Today, 5:23 PM</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;

    body.append(thispcdiv);
    const close = document.querySelector("#close");
    close.addEventListener("click", () => {
      thispcdiv.remove();
    });
  });
}

displayPartitions();
function bringToFront(windowElement) {
  document.querySelectorAll(".folder-structure-window").forEach((win) => {
    win.style.zIndex = "1000";
  });
  windowElement.style.zIndex = "1001";
}
