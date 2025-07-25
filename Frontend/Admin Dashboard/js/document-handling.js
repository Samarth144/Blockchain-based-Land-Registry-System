document.addEventListener('DOMContentLoaded', function() {
    // Initialize disputes tables
    loadActiveDisputes();
    loadResolvedDisputes();
    
    // Form submission handlers
    document.getElementById('flagDisputeForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        // Simulate API call
        showAlert('Dispute flagged successfully!', 'success');
        setTimeout(() => {
            document.getElementById('flagDisputeResponse').textContent = 
                'Dispute flagged successfully!\n\n' + 
                JSON.stringify(Object.fromEntries(formData), null, 2);
            
            // Refresh the disputes tables
            loadActiveDisputes();
            this.reset();
        }, 1000);
    });
    
    document.getElementById('unflagDisputeForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        // Simulate API call
        showAlert('Dispute resolved successfully!', 'success');
        setTimeout(() => {
            document.getElementById('unflagDisputeResponse').textContent = 
                'Dispute resolved successfully!\n\n' + 
                JSON.stringify(Object.fromEntries(formData), null, 2);
            
            // Refresh the disputes tables
            loadActiveDisputes();
            loadResolvedDisputes();
            this.reset();
        }, 1000);
    });
    
    // View dispute details button handler
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-dispute-btn')) {
            const disputeId = e.target.getAttribute('data-id');
            viewDisputeDetails(disputeId);
        }
    });
});

function loadActiveDisputes(page = 1, pageSize = 10) {
    // Simulate API response
    const activeDisputes = Array.from({length: pageSize}, (_, i) => ({
        id: `D-${new Date().getFullYear()}-${100 + i + (page-1)*pageSize}`,
        surveyNumber: `L-${Math.floor(Math.random() * 1000) + 1000}`,
        reporter: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
        reportedDate: new Date(Date.now() - Math.floor(Math.random() * 1000*60*60*24*30)).toISOString(),
        status: ['Under Review', 'In Mediation', 'In Court'][Math.floor(Math.random() * 3)],
        caseReference: `CR-${Math.floor(Math.random() * 10000)}`
    }));
    
    // Update UI
    const tableBody = document.getElementById('activeDisputeTableBody');
    if (tableBody) {
        tableBody.innerHTML = activeDisputes.map(dispute => `
            <tr>
                <td>${dispute.id}</td>
                <td>${dispute.surveyNumber}</td>
                <td>${dispute.reporter}</td>
                <td>${formatDate(dispute.reportedDate)}</td>
                <td><span class="badge bg-${dispute.status === 'Under Review' ? 'warning' : dispute.status === 'In Mediation' ? 'info' : 'danger'}">${dispute.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-dispute-btn" data-id="${dispute.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `).join('');
        
        document.getElementById('activeDisputeCount').textContent = 
            `${activeDisputes.length} active disputes`;
        
        // Update pagination
        const paginationElement = document.querySelector('#activeDisputesPagination');
        if (paginationElement) {
            updatePagination(paginationElement, page, 5, (newPage) => {
                loadActiveDisputes(newPage, pageSize);
            });
        }
    }
}

function loadResolvedDisputes(page = 1, pageSize = 10) {
    // Simulate API response
    const resolvedDisputes = Array.from({length: pageSize}, (_, i) => ({
        id: `D-${new Date().getFullYear()-1}-${100 + i + (page-1)*pageSize}`,
        surveyNumber: `L-${Math.floor(Math.random() * 1000) + 1000}`,
        resolution: ['Settled', 'Withdrawn', 'Court Decision'][Math.floor(Math.random() * 3)],
        resolvedDate: new Date(Date.now() - Math.floor(Math.random() * 1000*60*60*24*365)).toISOString(),
        caseReference: `CR-${Math.floor(Math.random() * 10000)}`
    }));
    
    // Update UI
    const tableBody = document.getElementById('resolvedDisputeTableBody');
    if (tableBody) {
        tableBody.innerHTML = resolvedDisputes.map(dispute => `
            <tr>
                <td>${dispute.id}</td>
                <td>${dispute.surveyNumber}</td>
                <td><span class="badge bg-${dispute.resolution === 'Settled' ? 'success' : dispute.resolution === 'Withdrawn' ? 'info' : 'primary'}">${dispute.resolution}</span></td>
                <td>${formatDate(dispute.resolvedDate)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-dispute-btn" data-id="${dispute.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `).join('');
        
        document.getElementById('resolvedDisputeCount').textContent = 
            `${resolvedDisputes.length} resolved disputes`;
        
        // Update pagination
        const paginationElement = document.querySelector('#resolvedDisputesPagination');
        if (paginationElement) {
            updatePagination(paginationElement, page, 5, (newPage) => {
                loadResolvedDisputes(newPage, pageSize);
            });
        }
    }
}

function viewDisputeDetails(disputeId) {
    // Simulate API call to get dispute details
    const disputeDetails = {
        id: disputeId,
        surveyNumber: `L-${Math.floor(Math.random() * 1000) + 1000}`,
        reporter: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
        reportedDate: new Date(Date.now() - Math.floor(Math.random() * 1000*60*60*24*30)).toISOString(),
        resolvedDate: new Date(Date.now() - Math.floor(Math.random() * 1000*60*60*24*7)).toISOString(),
        status: disputeId.startsWith('D-'+new Date().getFullYear()) ? 
            ['Under Review', 'In Mediation', 'In Court'][Math.floor(Math.random() * 3)] : 
            ['Settled', 'Withdrawn', 'Court Decision'][Math.floor(Math.random() * 3)],
        caseReference: `CR-${Math.floor(Math.random() * 10000)}`,
        reason: ['Boundary dispute', 'Ownership claim', 'Fraud allegation', 'Inheritance conflict'][Math.floor(Math.random() * 4)],
        documents: [
            { name: 'Complaint Form', date: new Date(Date.now() - Math.floor(Math.random() * 1000*60*60*24*30)).toISOString() },
            { name: 'Supporting Evidence', date: new Date(Date.now() - Math.floor(Math.random() * 1000*60*60*24*28)).toISOString() }
        ],
        resolution: disputeId.startsWith('D-'+new Date().getFullYear()) ? null : 
            ['Mutual agreement', 'Withdrawal of complaint', 'Court ruling in favor of plaintiff', 'Court ruling in favor of defendant'][Math.floor(Math.random() * 4)],
        notes: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.'
    };
    
    // Show modal with dispute details
    const modal = new bootstrap.Modal(document.getElementById('disputeDetailsModal'));
    const modalBody = document.getElementById('disputeDetailsContent');
    
    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h5>Dispute Information</h5>
                <ul class="list-group list-group-flush mb-3">
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Case ID:</span>
                        <strong>${disputeDetails.id}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Survey Number:</span>
                        <strong>${disputeDetails.surveyNumber}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Status:</span>
                        <span class="badge bg-${disputeDetails.status === 'Under Review' ? 'warning' : 
                            disputeDetails.status === 'In Mediation' ? 'info' : 
                            disputeDetails.status === 'In Court' ? 'danger' : 
                            disputeDetails.resolution === 'Settled' ? 'success' : 
                            disputeDetails.resolution === 'Withdrawn' ? 'info' : 'primary'}">
                            ${disputeDetails.status || disputeDetails.resolution}
                        </span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Reported Date:</span>
                        <strong>${formatDateTime(disputeDetails.reportedDate)}</strong>
                    </li>
                    ${disputeDetails.resolvedDate ? `
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Resolved Date:</span>
                        <strong>${formatDateTime(disputeDetails.resolvedDate)}</strong>
                    </li>
                    ` : ''}
                </ul>
            </div>
            <div class="col-md-6">
                <h5>Case Details</h5>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Case Reference:</span>
                        <strong>${disputeDetails.caseReference}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Reporter:</span>
                        <strong>${disputeDetails.reporter}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Dispute Reason:</span>
                        <strong>${disputeDetails.reason}</strong>
                    </li>
                    ${disputeDetails.resolution ? `
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Resolution:</span>
                        <strong>${disputeDetails.resolution}</strong>
                    </li>
                    ` : ''}
                </ul>
            </div>
        </div>
        <div class="mt-3">
            <h5>Case Notes</h5>
            <div class="card card-body bg-light">
                ${disputeDetails.notes}
            </div>
        </div>
        <div class="mt-3">
            <h5>Case Documents</h5>
            <div class="list-group">
                ${disputeDetails.documents.map(doc => `
                    <a href="#" class="list-group-item list-group-item-action">
                        <i class="fas fa-file-alt me-2"></i> ${doc.name} (uploaded ${formatDate(doc.date)})
                    </a>
                `).join('')}
            </div>
        </div>
    `;
    
    modal.show();
}