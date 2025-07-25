document.addEventListener('DOMContentLoaded', function() {
function showAlert(message, type) {
    const alertPlaceholder = document.getElementById('alertPlaceholder');
    if (alertPlaceholder) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible" role="alert">`,
            `   <div>${message}</div>`,
            `   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`,
            `</div>`
        ].join('');
        alertPlaceholder.append(wrapper);
        setTimeout(() => wrapper.remove(), 5000); // Remove alert after 5 seconds
    }
}

    // Initialize disputes tables
    loadActiveDisputes();
    loadResolvedDisputes();
    
    // Form submission handlers
    document.getElementById('flagDisputeForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        const disputeData = {
            surveyNumber: formData.get('surveyNumber'),
            reporterWallet: formData.get('reporterWallet'),
            caseReferenceNumber: formData.get('caseReferenceNumber'),
            reason: formData.get('reason'),
            supportingDocuments: [] // Assuming no documents are uploaded via this form for now
        };

        fetch('http://localhost:8000/api/disputes/flag', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(disputeData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || 'Failed to flag dispute');
                });
            }
            return response.json();
        })
        .then(data => {
            showAlert('Dispute flagged successfully!', 'success');
            document.getElementById('flagDisputeResponse').textContent =
                'Dispute flagged successfully!\n\n' +
                JSON.stringify(data, null, 2);
            loadActiveDisputes();
            this.reset();
        })
        .catch(error => {
            console.error('Error flagging dispute:', error);
            showAlert('Error flagging dispute: ' + error.message, 'danger');
            document.getElementById('flagDisputeResponse').textContent =
                'Error flagging dispute: ' + error.message;
        });
    });
    
    document.getElementById('unflagDisputeForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        const surveyNumber = formData.get('surveyNumber');

        fetch(`http://localhost:8000/api/disputes/unflag/${surveyNumber}`, {
            method: 'PUT'
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || 'Failed to unflag dispute');
                });
            }
            return response.json();
        })
        .then(data => {
            showAlert('Dispute resolved successfully!', 'success');
            document.getElementById('unflagDisputeResponse').textContent =
                'Dispute resolved successfully!\n\n' +
                JSON.stringify(data, null, 2);
            loadActiveDisputes();
            loadResolvedDisputes();
            this.reset();
        })
        .catch(error => {
            console.error('Error unflagging dispute:', error);
            showAlert('Error unflagging dispute: ' + error.message, 'danger');
            document.getElementById('unflagDisputeResponse').textContent =
                'Error unflagging dispute: ' + error.message;
        });
    });
    
    // View dispute details button handler
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-dispute-btn')) {
            const disputeId = e.target.getAttribute('data-id');
            viewDisputeDetails(disputeId);
        } else if (e.target.classList.contains('resolve-dispute-btn')) {
            const disputeId = e.target.getAttribute('data-id');
            const surveyNumber = e.target.getAttribute('data-survey');
            document.getElementById('resolveCaseId').value = disputeId;
            document.getElementById('resolveSurveyNumber').value = surveyNumber;
        }
    });

    document.getElementById('resolveDisputeForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const caseId = formData.get('caseId');

        const resolutionData = {
            resolution: formData.get('resolutionSummary')
        };

        fetch(`http://localhost:8000/api/disputes/resolve/${caseId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(resolutionData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || 'Failed to resolve dispute');
                });
            }
            return response.json();
        })
        .then(data => {
            showAlert('Dispute resolved successfully!', 'success');
            // Optionally update a response area or log success
            console.log('Dispute resolved:', data);
            loadActiveDisputes();
            loadResolvedDisputes();
            bootstrap.Modal.getInstance(document.getElementById('resolveDisputeModal')).hide();
            this.reset();
        })
        .catch(error => {
            console.error('Error resolving dispute:', error);
            showAlert('Error resolving dispute: ' + error.message, 'danger');
        });
    });
});

function loadActiveDisputes() {
    fetch(`http://localhost:8000/api/disputes/active`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load active disputes');
            }
            return response.json();
        })
        .then(data => {
            const activeDisputes = data; // Backend now returns a direct list

            const tableBody = document.getElementById('activeDisputeTableBody');
            if (tableBody) {
                tableBody.innerHTML = activeDisputes.map(dispute => `
                    <tr>
                        <td>${dispute.id}</td>
                        <td>${dispute.surveyNumber}</td>
                        <td>${dispute.reporterWallet}</td>
                        <td>${formatDate(dispute.raisedAt)}</td>
                        <td><span class="badge bg-${dispute.status === 'OPEN' ? 'warning' : 'info'}">${dispute.status}</span></td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary view-dispute-btn" data-id="${dispute.id}">
                                <i class="fas fa-eye"></i> View
                            </button>
                            <button class="btn btn-sm btn-success resolve-dispute-btn" data-id="${dispute.id}" data-survey="${dispute.surveyNumber}" data-bs-toggle="modal" data-bs-target="#resolveDisputeModal">
                                <i class="fas fa-check"></i> Resolve
                            </button>
                        </td>
                    </tr>
                `).join('');

                document.getElementById('activeDisputeCount').textContent =
                    `${activeDisputes.length} active disputes`;

                // Pagination removed as backend no longer returns totalPages
                const paginationElement = document.querySelector('#activeDisputesPagination');
                if (paginationElement) {
                    paginationElement.innerHTML = ''; // Clear pagination
                }
            }
        })
        .catch(error => {
            console.error('Error loading active disputes:', error);
            showAlert('Error loading active disputes: ' + error.message, 'danger');
        });
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function loadResolvedDisputes() {
    fetch(`http://localhost:8000/api/disputes/resolved`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load resolved disputes');
            }
            return response.json();
        })
        .then(data => {
            const resolvedDisputes = data; // Backend now returns a direct list

            const tableBody = document.getElementById('resolvedDisputeTableBody');
            if (tableBody) {
                tableBody.innerHTML = resolvedDisputes.map(dispute => `
                    <tr>
                        <td>${dispute.id}</td>
                        <td>${dispute.surveyNumber}</td>
                        <td><span class="badge bg-success">${dispute.status}</span></td>
                        <td>${formatDate(dispute.resolvedAt)}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary view-dispute-btn" data-id="${dispute.id}">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </td>
                    </tr>
                `).join('');

                document.getElementById('resolvedDisputeCount').textContent =
                    `${resolvedDisputes.length} resolved disputes`;

                // Pagination removed as backend no longer returns totalPages
                const paginationElement = document.querySelector('#resolvedDisputesPagination');
                if (paginationElement) {
                    paginationElement.innerHTML = ''; // Clear pagination
                }
            }
        })
        .catch(error => {
            console.error('Error loading resolved disputes:', error);
            showAlert('Error loading resolved disputes: ' + error.message, 'danger');
        });
}

function viewDisputeDetails(disputeId) {
    fetch(`http://localhost:8000/api/disputes/${disputeId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load dispute details');
            }
            return response.json();
        })
        .then(disputeDetails => {
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
                                <span>Reporter Wallet:</span>
                                <strong>${disputeDetails.reporterWallet}</strong>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>Case Reference:</span>
                                <strong>${disputeDetails.caseReferenceNumber}</strong>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>Status:</span>
                                <span class="badge bg-${disputeDetails.status === 'OPEN' ? 'warning' : 'success'}">
                                    ${disputeDetails.status}
                                </span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>Reported Date:</span>
                                <strong>${formatDate(disputeDetails.raisedAt)}</strong>
                            </li>
                            ${disputeDetails.status === 'RESOLVED' ? `
                            <li class="list-group-item d-flex justify-content-between">
                                <span>Resolved Date:</span>
                                <strong>${formatDate(disputeDetails.resolvedAt)}</strong>
                            </li>
                            ` : ''}
                        </ul>
                        <h5>Reason for Dispute</h5>
                        <p>${disputeDetails.reason}</p>
                    </div>
                    <div class="col-md-6">
                        <h5>Supporting Documents</h5>
                        <ul class="list-group list-group-flush mb-3">
                            ${disputeDetails.supportingDocuments && disputeDetails.supportingDocuments.length > 0 ?
                                disputeDetails.supportingDocuments.map(doc => `
                                    <li class="list-group-item">${doc}</li>
                                `).join('')
                                : '<li class="list-group-item">No supporting documents provided.</li>'}
                        </ul>
                        ${disputeDetails.status === 'RESOLVED' && disputeDetails.resolution ? `
                        <h5>Resolution</h5>
                        <p>${disputeDetails.resolution}</p>
                        ` : ''}
                    </div>
                </div>
            `;
            modal.show();
        })
        .catch(error => {
            console.error('Error loading dispute details:', error);
            showAlert('Error loading dispute details: ' + error.message, 'danger');
        });
}