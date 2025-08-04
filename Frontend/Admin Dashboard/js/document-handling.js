document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('uploadDocumentForm');
    const uploadResponse = document.getElementById('uploadDocumentResponse');
    const documentTableBody = document.getElementById('documentTableBody');
    const filterBtn = document.getElementById('filterBtn');

    // Load documents from the server on page load
    if (document.getElementById('manage-tab')) {
        fetchDocuments();
    }

    if (uploadForm) {
        uploadForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form elements
            const documentType = uploadForm.elements.documentType.value;
            const surveyNumber = uploadForm.elements.surveyNumber.value;
            const walletAddress = uploadForm.elements.walletAddress.value;
            const fileInput = uploadForm.elements.file;
            const file = fileInput.files[0];
            
            // Validate inputs
            const validationResult = validateInputs(documentType, surveyNumber, walletAddress, file);
            if (!validationResult.valid) {
                showUploadResponse(validationResult.message, 'error');
                return;
            }
            
            showUploadResponse('Uploading document...', 'info');
            
            try {
                // Create FormData for the entire document
                const formData = new FormData();
                formData.append('documentType', documentType);
                formData.append('surveyNumber', surveyNumber);
                formData.append('walletAddress', walletAddress);
                formData.append('file', file);

                // Single API call to handle both IPFS upload and metadata storage
                const response = await fetch('http://localhost:8000/api/documents/upload', {
                    method: 'POST',
                    body: formData
                });

                const result = await processResponse(response);
                if (result.success) {
                    showUploadResponse(`Document uploaded successfully! CID: ${result.data.cid}`, 'success');
                    uploadForm.reset();
                    
                    // Refresh documents table if we're on manage tab
                    if (document.getElementById('manage-tab')) {
                        fetchDocuments();
                    }
                } else {
                    showUploadResponse(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                showUploadResponse(`Network error: ${error.message}`, 'error');
            }
        });
    }

    if (filterBtn) {
        filterBtn.addEventListener('click', function() {
            fetchDocuments();
        });
    }

    async function fetchDocuments() {
        const filterType = document.getElementById('filterType').value;
        const surveyNumberFilter = document.getElementById('filterSurveyNumberInput').value;
        const uploadDateFilter = document.getElementById('filterUploadDateInput').value;
        const walletAddressFilter = document.getElementById('filterWalletAddressInput').value;

        try {
            const params = new URLSearchParams();
            if (filterType) params.append('documentType', filterType);
            if (surveyNumberFilter) params.append('surveyNumber', surveyNumberFilter);
            if (uploadDateFilter) params.append('uploadDate', uploadDateFilter);
            if (walletAddressFilter) params.append('walletAddress', walletAddressFilter);

            const response = await fetch(`http://localhost:8000/api/documents?${params.toString()}`);
            if (response.ok) {
                let documents = await response.json();
                renderDocuments(documents);
                
                // Update document count
                const documentCount = document.getElementById('documentCount');
                if (documentCount) {
                    documentCount.textContent = `Showing ${documents.length} documents`;
                }
            } else {
                console.error('Failed to fetch documents');
                documentTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Failed to load documents</td></tr>';
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
            documentTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Network error loading documents</td></tr>';
        }
    }

    function renderDocuments(documents) {
        documentTableBody.innerHTML = '';
        if (documents.length === 0) {
            documentTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No documents found.</td></tr>';
            return;
        }

        documents.forEach(doc => {
            // Format file size for display
            const fileSizeKB = Math.round(doc.fileSize / 1024);
            const fileSizeDisplay = fileSizeKB > 1024 ? 
                `${(fileSizeKB / 1024).toFixed(1)} MB` : 
                `${fileSizeKB} KB`;
                
            // Format date for display
            const uploadDate = new Date(doc.uploadDate);
            const formattedDate = uploadDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }) + ' ' + uploadDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const row = `
                <tr>
                    <td>${doc.id.substring(0, 8)}...</td>
                    <td>${doc.documentType}</td>
                    <td>${doc.surveyNumber}</td>
                    <td>${formattedDate}</td>
                    <td>${fileSizeDisplay}</td>
                    <td>
                        <a href="${doc.ipfsUrl}" target="_blank" class="btn btn-sm btn-primary me-1">
                            <i class="fas fa-eye"></i> View
                        </a>
                        <button class="btn btn-sm btn-danger" onclick="deleteDocument('${doc.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            documentTableBody.innerHTML += row;
        });
    }

    window.deleteDocument = async function(docId) {
        if (!confirm('Are you sure you want to delete this document? This will remove the metadata but the IPFS file will remain.')) return;
        
        try {
            const response = await fetch(`http://localhost:8000/api/documents/${encodeURIComponent(docId)}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showUploadResponse('Document deleted successfully', 'success');
                fetchDocuments();
            } else {
                const errorText = await response.text();
                showUploadResponse(`Delete failed: ${errorText}`, 'error');
            }
        } catch (error) {
            showUploadResponse(`Network error: ${error.message}`, 'error');
        }
    }
    
    function showUploadResponse(message, type) {
        uploadResponse.innerHTML = `
            <div class="alert alert-${type === 'error' ? 'danger' : 
                              type === 'info' ? 'info' : 'success'}">
                ${message}
            </div>
        `;
    }
    
    function validateInputs(documentType, surveyNumber, walletAddress, file) {
        // Validate Ethereum address
        if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
            return {
                valid: false,
                message: 'Invalid Ethereum wallet address format'
            };
        }
        
        // Validate required fields
        if (!documentType || !surveyNumber || !walletAddress || !file) {
            return {
                valid: false,
                message: 'All fields are required'
            };
        }
        
        // Validate file size (max 5MB)
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > 5) {
            return {
                valid: false,
                message: `File size (${fileSizeMB.toFixed(2)}MB) exceeds 5MB limit`
            };
        }
        
        // Validate file type
        const validExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!validExtensions.includes(fileExtension)) {
            return {
                valid: false,
                message: `Unsupported file type: ${fileExtension}`
            };
        }
        
        return { valid: true };
    }

    async function processResponse(response) {
        try {
            if (response.status === 204) { // No content
                return { success: false, message: 'Operation succeeded but no content returned' };
            }
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                if (response.ok) {
                    return { success: true, data };
                } else {
                    return { 
                        success: false, 
                        message: data.message || data.error || 'Unknown error occurred' 
                    };
                }
            } else {
                const text = await response.text();
                if (response.ok) {
                    return { success: true, data: { message: text } };
                } else {
                    return { success: false, message: text };
                }
            }
        } catch (e) {
            return { 
                success: false, 
                message: 'Failed to parse response: ' + e.message
            };
        }
    }
});