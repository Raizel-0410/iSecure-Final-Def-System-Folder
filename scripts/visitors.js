document.addEventListener("DOMContentLoaded", () => {

  // ----- Buttons & Elements -----
  const nextToVerifyBtn = document.getElementById("nextToVerify");
  const nextToFacialBtn = document.getElementById("nextToFacial");
  const nextToVehicleBtn = document.getElementById("nextToVehicle");
  const nextToIdBtn = document.getElementById("nextToId");
  const skipVehicleBtn = document.getElementById("skipVehicle");
  const rejectBtn = document.getElementById("rejectBtn");
  const markEntryBtn = document.getElementById("markEntryBtn");
  const saveTimeBtn = document.getElementById("saveTimeBtn");
  const logoutLink = document.getElementById("logout-link");
  const idTabImage = document.getElementById("idTabImage");
  const ocrContent = document.getElementById("ocrContent");
  const recognizeFaceBtn = document.getElementById("recognizeFaceBtn");
  const recognizeVehicleBtn = document.getElementById("recognizeVehicleBtn");
  const facialResult = document.getElementById("facialResult");
  const vehicleResult = document.getElementById("vehicleResult");
  const expectedVisitorsTbody = document.querySelector("#expectedVisitorsTable tbody");
  const insideVisitorsTbody = document.querySelector("#insideVisitorsTable tbody");
  const exitedVisitorsTbody = document.querySelector("#exitedVisitorsTable tbody");

  let currentVisitorId = null;
  let currentSelfiePath = null;

  // ----- Helper Functions -----
  function escapeHtml(s) {
    if (!s) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showTab(tabId) {
    const tabTrigger = document.querySelector(`#visitorTab button[data-bs-target="#${tabId}"]`);
    if (tabTrigger) {
      const tab = new bootstrap.Tab(tabTrigger);
      tab.show();
    }
  }

  async function fetchVisitorDetails(visitorId) {
    try {
      const res = await fetch(`fetch_visitor_details.php?id=${encodeURIComponent(visitorId)}`);
      const visitor = await res.json();

      if (!visitor.success) {
        alert(visitor.message || "Visitor data not found");
        return null;
      }

      return visitor.data;
    } catch (err) {
      console.error(err);
      alert("Failed to fetch visitor details.");
      return null;
    }
  }

    function showVisitorDetails(visitor) {
      // Combine first and last name for Name column
      const fullName = [visitor.first_name, visitor.middle_name,  visitor.last_name].filter(Boolean).join(' ');
      document.getElementById("visitorNameCell").textContent = escapeHtml(fullName);
      document.getElementById("visitorAddressCell").textContent = escapeHtml(visitor.address);
      document.getElementById("visitorContactCell").textContent = escapeHtml(visitor.contact_number);
      document.getElementById("visitorEmailCell").textContent = escapeHtml(visitor.email);
      document.getElementById("visitorDateCell").textContent = escapeHtml(visitor.date || '');
      document.getElementById("visitorTimeCell").textContent = escapeHtml(visitor.time_in || '');
      document.getElementById("visitorPersonnelCell").textContent = escapeHtml(visitor.personnel_related || '');
      document.getElementById("visitorOfficeCell").textContent = escapeHtml(visitor.office_to_visit || '');
      document.getElementById("vehicleOwnerCell").textContent = escapeHtml(visitor.vehicle_owner || fullName);
      document.getElementById("vehicleBrandCell").textContent = escapeHtml(visitor.vehicle_brand || '');
      document.getElementById("vehicleModelCell").textContent = escapeHtml(visitor.vehicle_model || '');
      document.getElementById("vehicleColorCell").textContent = escapeHtml(visitor.vehicle_color || '');
      document.getElementById("plateNumberCell").textContent = escapeHtml(visitor.plate_number || '');
      document.getElementById("visitorIDPhoto").src = visitor.id_photo_path;
      document.getElementById("visitorSelfie").src = visitor.selfie_photo_path;
      document.getElementById("facialSelfie").src = visitor.selfie_photo_path;
      document.getElementById("expectedPlate").textContent = visitor.plate_number || '';
      idTabImage.src = visitor.id_photo_path;
      currentVisitorId = visitor.id;
      currentSelfiePath = visitor.selfie_photo_path;

    // Hide vehicle columns if no vehicle
    const vehicleColumns = document.querySelectorAll(".visitor-vehicle-column");
    const vehicleHeaders = ["visitorVehicleOwnerHeader", "visitorVehicleBrandHeader", "visitorVehicleModelHeader", "visitorVehicleColorHeader", "visitorPlateNumberHeader"];
    const hasVehicle = visitor.vehicle_brand && visitor.vehicle_brand.trim() !== "";
    vehicleColumns.forEach(col => {
      col.style.display = hasVehicle ? "table-cell" : "none";
    });
    vehicleHeaders.forEach(headerId => {
      const header = document.getElementById(headerId);
      if (header) header.style.display = hasVehicle ? "table-cell" : "none";
    });

    // Show/Hide tabs based on status
    const verifyTabBtn = document.querySelector('#visitorTab button[data-bs-target="#verify"]');
    const facialTabBtn = document.querySelector('#visitorTab button[data-bs-target="#facial"]');
    const vehicleTabBtn = document.querySelector('#visitorTab button[data-bs-target="#vehicle"]');
    const idTabBtn = document.querySelector('#visitorTab button[data-bs-target="#id"]');
    const detailsTabBtn = document.querySelector('#visitorTab button[data-bs-target="#details"]');

    const isReadOnly = visitor.status.toLowerCase() === "inside" || visitor.status.toLowerCase() === "exited";

    [verifyTabBtn, facialTabBtn, vehicleTabBtn, idTabBtn].forEach(tab => {
      if (tab) tab.style.display = isReadOnly ? 'none' : 'block';
    });

    if (detailsTabBtn) {
      detailsTabBtn.style.display = isReadOnly ? 'none' : 'block';
    }

    [nextToVerifyBtn, nextToFacialBtn, nextToVehicleBtn].forEach(btn => {
      if (btn) btn.style.display = isReadOnly ? 'none' : 'inline-block';
    });

    // Conditionally hide/show the Details tab content and container
    const detailsTabContent = document.getElementById('details');
    const visitorTabContent = document.getElementById('visitorTabContent');
    if (detailsTabContent) {
      detailsTabContent.style.display = isReadOnly ? 'none' : 'block';
    }
    if (visitorTabContent) {
      visitorTabContent.style.display = isReadOnly ? 'none' : 'block';
    }

    const detailsTabTriggerEl = document.querySelector('#details-tab');
    if (detailsTabTriggerEl) {
      const tab = bootstrap.Tab.getInstance(detailsTabTriggerEl) || new bootstrap.Tab(detailsTabTriggerEl);
      tab.show();
    }

    new bootstrap.Modal(document.getElementById("visitorDetailsModal")).show();

    // Ensure visitor details section is shown initially
    const visitorDetailsSection = document.getElementById('visitorDetailsSection');
    if (visitorDetailsSection) visitorDetailsSection.style.display = 'block';
  }

  async function markEntry(visitorId) {
    try {
      const res = await fetch("mark_entry_visitor.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `visitor_id=${encodeURIComponent(visitorId)}`
      });
      const data = await res.json();
      if (data.success) {
        alert("Visitor marked as inside.");
        await loadExpectedVisitors();
        await loadInsideVisitors();
      } else alert(data.message || "Failed to mark entry.");
    } catch (err) {
      console.error(err);
      alert("Error while marking entry.");
    }
  }

  async function markExit(visitorId) {
    try {
      const res = await fetch("mark_exit_visitor.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `visitor_id=${encodeURIComponent(visitorId)}`
      });
      const data = await res.json();
      if (data.success) {
        alert("Visitor marked as exited.");
        await loadInsideVisitors();
        await loadExitedVisitors();
      } else alert(data.message || "Failed to mark exit.");
    } catch (err) {
      console.error(err);
      alert("Error while marking exit.");
    }
  }

  // ----- Load Tables -----
  async function loadTable(url, tbody, columns) {
    try {
      const res = await fetch(url);
      const data = await res.json();

      tbody.innerHTML = "";
      if (!Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${columns}" class="text-center">No records found</td></tr>`;
        return;
      }

      data.forEach(v => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${escapeHtml(v.first_name || "")}</td>
          <td>${escapeHtml(v.middle_name || "")}</td>
          <td>${escapeHtml(v.last_name || "")}</td>
          <td>${escapeHtml(v.contact_number || "")}</td>
          ${v.date !== undefined ? `<td>${escapeHtml(v.date || "")}</td>` : ""}
          ${v.key_card_number !== undefined ? `<td>${escapeHtml(v.key_card_number || "")}</td>` : ""}
          ${v.time_in !== undefined ? `<td>${escapeHtml(v.time_in || "")}</td>` : ""}
          ${v.time_out !== undefined ? `<td>${escapeHtml(v.time_out || "")}</td>` : ""}
          <td>${escapeHtml(v.status)}</td>
          <td>
            <button class="btn btn-info btn-sm view-btn" data-id="${v.id}">View</button>
            ${v.time_out == null && v.time_in != null ? `<button class="btn btn-danger btn-sm exit-btn" data-id="${v.id}">Mark Exit</button>` : ""}
          </td>
        `;
        tbody.appendChild(tr);
      });
    } catch (err) {
      console.error(`Error loading table: ${url}`, err);
      tbody.innerHTML = `<tr><td colspan="${columns}" class="text-center text-danger">Failed to load data</td></tr>`;
    }
  }

  const loadExpectedVisitors = () => loadTable("fetch_expected_visitors.php", expectedVisitorsTbody, 7);
  const loadInsideVisitors = () => loadTable("fetch_inside_visitors.php", insideVisitorsTbody, 9);
  const loadExitedVisitors = () => loadTable("fetch_exited_visitors.php", exitedVisitorsTbody, 9);

  // ----- Event Listeners -----
  [nextToVerifyBtn, nextToFacialBtn, nextToVehicleBtn, nextToIdBtn, skipVehicleBtn].forEach(btn => {
    if (!btn) return;
    btn.addEventListener("click", () => showTab(btn.dataset.targetTab || btn.id.replace("nextTo", "").toLowerCase()));
  });

  // Handle tab changes to show/hide visitor details section
  document.getElementById('visitorTab').addEventListener('shown.bs.tab', function (event) {
    const target = event.target.getAttribute('data-bs-target');
    const visitorDetailsSection = document.getElementById('visitorDetailsSection');
    if (visitorDetailsSection) {
      visitorDetailsSection.style.display = (target === '#details') ? 'block' : 'none';
    }

    // If ID tab is shown, run OCR on the ID image
    if (target === '#id' && idTabImage.src) {
      runOCR(idTabImage.src);
    }
  });

  markEntryBtn?.addEventListener("click", () => {
    if (currentVisitorId) markEntry(currentVisitorId);
  });

  saveTimeBtn?.addEventListener("click", () => {
    if (currentVisitorId) markExit(currentVisitorId);
  });

  // Delegate table buttons
  document.addEventListener("click", async e => {
    const id = e.target.dataset.id;
    if (!id) return;

    if (e.target.classList.contains("view-btn")) {
      const visitor = await fetchVisitorDetails(id);
      if (visitor) showVisitorDetails(visitor);
    } else if (e.target.classList.contains("entry-btn")) {
      markEntry(id);
    } else if (e.target.classList.contains("exit-btn")) {
      markExit(id);
    }
  });

  logoutLink?.addEventListener("click", () => {
    if (confirm("Are you sure you want to log out?")) {
      window.location.href = "logout.php";
    }
  });



  recognizeFaceBtn?.addEventListener("click", async () => {
    if (!currentSelfiePath) {
      facialResult.innerHTML = `<div class="alert alert-danger">No selfie path available.</div>`;
      return;
    }
    facialResult.innerHTML = "Processing...";
    try {
      // Fetch the captured frame
      const frameResponse = await fetch("http://localhost:8000/camera/single_frame");
      if (!frameResponse.ok) throw new Error("Failed to capture frame");
      const frameBlob = await frameResponse.blob();

      // Prepare form data
      const formData = new FormData();
      formData.append("file", frameBlob, "captured_frame.jpg");
      formData.append("selfie_path", currentSelfiePath);

      // Send to API
      const response = await fetch("http://localhost:8000/real_time_compare/faces", {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      if (data.match) {
        facialResult.innerHTML = `<div class="alert alert-success">Faces match! Confidence: ${(data.boxes[0]?.confidence * 100 || 0).toFixed(2)}%</div>`;
      } else {
        facialResult.innerHTML = `<div class="alert alert-warning">Faces do not match.</div>`;
      }
    } catch (error) {
      facialResult.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
  });

  recognizeVehicleBtn?.addEventListener("click", async () => {
    vehicleResult.innerHTML = "Processing...";
    try {
      const response = await fetch("http://localhost:8000/camera/recognize_vehicle");
      const data = await response.json();
      vehicleResult.innerHTML = `<div class="alert alert-info">Plate: ${data.plate_number || 'Not detected'}, Color: ${data.color || 'Not detected'}</div>`;
    } catch (error) {
      vehicleResult.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
  });

  // Function to convert image blob to PNG
  async function convertToPNG(blob) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(resolve, 'image/png');
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  }

  // Function to run OCR on an image URL
  async function runOCR(imageUrl) {
    // Clear previous OCR content
    ocrContent.innerHTML = '<p class="text-muted">Processing image, please wait...</p>';

    try {
      // Fetch the image as blob
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const blob = await response.blob();

      // Convert to PNG
      const pngBlob = await convertToPNG(blob);

      // Prepare form data
      const formData = new FormData();
      formData.append("file", pngBlob, "id_image.png");

      const ocrResponse = await fetch("http://localhost:8000/ocr/id", {
        method: "POST",
        body: formData,
      });

      if (!ocrResponse.ok) {
        throw new Error(`Server error: ${ocrResponse.statusText}`);
      }

      const data = await ocrResponse.json();

      // Display extracted details
      if (data && Object.keys(data).length > 0) {
        let html = "<ul class='list-group'>";
        for (const [key, value] of Object.entries(data)) {
          html += `<li class="list-group-item"><strong>${key}:</strong> ${value || "<em>Not detected</em>"}</li>`;
        }
        html += "</ul>";
        ocrContent.innerHTML = html;
      } else {
        ocrContent.innerHTML = '<p class="text-muted">No details extracted.</p>';
      }
    } catch (error) {
      console.error("Error during OCR request:", error);
      ocrContent.innerHTML = `<p class="text-danger">Error processing image: ${error.message}</p>`;
    }
  }

  // ----- Initial Load -----
  loadExpectedVisitors();
  loadInsideVisitors();
  loadExitedVisitors();
});
