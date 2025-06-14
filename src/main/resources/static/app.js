const records = [
  {
    id: 1,
    owner: "Ravi Kumar",
    location: "Mumbai, MH",
    size: "500 sq.ft",
    status: "Pending"
  },
  {
    id: 2,
    owner: "Sita Sharma",
    location: "Pune, MH",
    size: "800 sq.ft",
    status: "Pending"
  }
];

function loadRecords() {
  const tableBody = document.getElementById("recordTableBody");
  tableBody.innerHTML = "";

  records.forEach((record, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${record.id}</td>
      <td>${record.owner}</td>
      <td>${record.location}</td>
      <td>${record.size}</td>
      <td id="status-${index}">${record.status}</td>
      <td>
        <button class="action-btn approve" onclick="approve(${index})">Approve</button>
        <button class="action-btn reject" onclick="reject(${index})">Reject</button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

function approve(index) {
  records[index].status = "Approved";
  document.getElementById(`status-${index}`).textContent = "Approved";
}

function reject(index) {
  records[index].status = "Rejected";
  document.getElementById(`status-${index}`).textContent = "Rejected";
}

window.onload = loadRecords;
