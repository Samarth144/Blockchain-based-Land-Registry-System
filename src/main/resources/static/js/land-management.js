document.addEventListener('DOMContentLoaded', function() {
    // Initialize the lands table
    loadLands();
    
    // Form submission handlers
    document.getElementById('registerLandForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        // Simulate API call
        showAlert('Land registration submitted successfully!', 'success');
        setTimeout(() => {
            document.getElementById('registerLandResponse').textContent = 
                'Land registered successfully!\n\n' + 
                JSON.stringify(Object.fromEntries(formData), null, 2);
            
            // Refresh the lands table
            loadLands();
            this.reset();
        }, 1000);
    });
    
    document.getElementById('listLandsForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const filters = Object.fromEntries(formData.entries());
        loadLands(1, 10, filters);
    });
    
    document.getElementById('updateDocumentsForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        // Simulate API call
        showAlert('Document uploaded successfully!', 'success');
        setTimeout(() => {
            document.getElementById('updateDocumentsResponse').textContent = 
                'Document uploaded successfully!\n\n' + 
                JSON.stringify(Object.fromEntries(formData), null, 2);
            this.reset();
        }, 1000);
    });
    
    // View land details button handler
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-land-btn')) {
            const surveyNumber = e.target.getAttribute('data-id');
            viewLandDetails(surveyNumber);
        }
    });
});

// Function to load lands data with pagination
function loadLands(page = 1, pageSize = 10, filters = {}) {
    // In a real app, this would be an API call
    console.log(`Loading lands page ${page} with filters:`, filters);
    
    // Simulate API response
    const totalLands = 1245;
    const lands = Array.from({length: pageSize}, (_, i) => ({
        id: `L-2023-${1000 + i + (page-1)*pageSize}`,
        owner: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
        location: ['District 12', 'District 9', 'Central'][Math.floor(Math.random() * 3)],
        area: Math.floor(Math.random() * 5000) + 500,
        status: ['Registered', 'Transfer Pending', 'Disputed'][Math.floor(Math.random() * 3)],
        registeredDate: new Date(Date.now() - Math.floor(Math.random() * 1000*60*60*24*365)).toISOString()
    }));
    
    // Update UI
    const tableBody = document.getElementById('landTableBody');
    if (tableBody) {
        tableBody.innerHTML = lands.map(land => `
            <tr>
                <td>${land.id}</td>
                <td>${land.owner}</td>
                <td>${land.location}</td>
                <td>${land.area.toLocaleString()} m²</td>
                <td><span class="badge bg-${land.status === 'Registered' ? 'success' : land.status === 'Transfer Pending' ? 'warning' : 'danger'}">${land.status}</span></td>
                <td>${formatDate(land.registeredDate)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-land-btn" data-id="${land.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `).join('');
        
        document.getElementById('landCount').textContent = 
            `Showing ${1 + (page-1)*pageSize}-${Math.min(page*pageSize, totalLands)} of ${totalLands} lands`;
        
        // Update pagination
        const paginationElement = document.querySelector('#landManagementTabsContent .pagination');
        if (paginationElement) {
            updatePagination(paginationElement, page, Math.ceil(totalLands / pageSize), (newPage) => {
                loadLands(newPage, pageSize, filters);
            });
        }
    }
}

function viewLandDetails(surveyNumber) {
    // Simulate API call to get land details
    const landDetails = {
        surveyNumber: surveyNumber,
        owner: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
        location: ['District 12', 'District 9', 'Central'][Math.floor(Math.random() * 3)],
        area: Math.floor(Math.random() * 5000) + 500,
        status: ['Registered', 'Transfer Pending', 'Disputed'][Math.floor(Math.random() * 3)],
        registeredDate: new Date(Date.now() - Math.floor(Math.random() * 1000*60*60*24*365)).toISOString(),
        coordinates: `${Math.random().toFixed(6)}, ${Math.random().toFixed(6)}`,
        zoning: ['Residential', 'Commercial', 'Agricultural'][Math.floor(Math.random() * 3)],
        taxPaid: Math.random() > 0.3
    };
    
    // Show modal with land details
    const modal = new bootstrap.Modal(document.getElementById('landDetailsModal'));
    const modalBody = document.getElementById('landDetailsContent');
    
    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h5>Basic Information</h5>
                <ul class="list-group list-group-flush mb-3">
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Survey Number:</span>
                        <strong>${landDetails.surveyNumber}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Current Owner:</span>
                        <strong>${landDetails.owner}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Location:</span>
                        <strong>${landDetails.location}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Area:</span>
                        <strong>${landDetails.area.toLocaleString()} m²</strong>
                    </li>
                </ul>
            </div>
            <div class="col-md-6">
                <h5>Additional Details</h5>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Status:</span>
                        <span class="badge bg-${landDetails.status === 'Registered' ? 'success' : landDetails.status === 'Transfer Pending' ? 'warning' : 'danger'}">
                            ${landDetails.status}
                        </span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Registration Date:</span>
                        <strong>${formatDate(landDetails.registeredDate)}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Coordinates:</span>
                        <strong>${landDetails.coordinates}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Zoning:</span>
                        <strong>${landDetails.zoning}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Tax Status:</span>
                        <strong class="text-${landDetails.taxPaid ? 'success' : 'danger'}">
                            ${landDetails.taxPaid ? 'Paid' : 'Pending'}
                        </strong>
                    </li>
                </ul>
            </div>
        </div>
        <div class="mt-3">
            <h5>Documents</h5>
            <div class="list-group">
                <a href="#" class="list-group-item list-group-item-action">
                    <i class="fas fa-file-contract me-2"></i> Title Deed (uploaded ${formatDate(new Date(Date.now() - Math.floor(Math.random() * 1000*60*60*24*30)).toISOString())})
                </a>
                <a href="#" class="list-group-item list-group-item-action">
                    <i class="fas fa-map me-2"></i> Survey Map (uploaded ${formatDate(new Date(Date.now() - Math.floor(Math.random() * 1000*60*60*24*60)).toISOString())})
                </a>
            </div>
        </div>
    `;
    
    modal.show();
}