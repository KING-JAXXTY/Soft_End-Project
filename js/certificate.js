// Certificate generation for approved scholarships

async function generateCertificate(application, scholarship, student) {
    console.log('Certificate generation started');
    console.log('  Application:', application);
    console.log('  Scholarship:', scholarship);
    console.log('  Student:', student);
    
    try {
        // Get sponsor information
        const sponsor = scholarship.sponsor || {};
        const sponsorName = sponsor.firstName && sponsor.lastName 
            ? `${sponsor.firstName} ${sponsor.lastName}` 
            : scholarship.sponsorName || 'TulongAral+ Sponsor';
        
        console.log('Sponsor name:', sponsorName);

        // Create certificate container
        const certificateContainer = document.createElement('div');
        certificateContainer.className = 'certificate-container';
        certificateContainer.style.cssText = `
            width: 100%;
            max-width: 700px;
            min-height: 450px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            position: relative;
            overflow: hidden;
            margin: 0 auto;
        `;

    // Add decorative elements
    const decoration = `
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; pointer-events: none;">
            <div style="position: absolute; top: -50px; left: -50px; width: 200px; height: 200px; border-radius: 50%; background: white;"></div>
            <div style="position: absolute; bottom: -50px; right: -50px; width: 200px; height: 200px; border-radius: 50%; background: white;"></div>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 300px; height: 300px; border: 2px solid white; border-radius: 50%;"></div>
        </div>
    `;

    // Format dates
    const approvalDate = new Date(application.reviewedAt || application.appliedAt);
    const formattedDate = approvalDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    // Create certificate content with all required information
    const certificateHTML = `
        ${decoration}
        <div style="position: relative; z-index: 1; background: white; width: 100%; min-height: 500px; border-radius: 10px; padding: 30px; box-shadow: inset 0 2px 20px rgba(0,0,0,0.1);">
            <div style="text-align: center; border: 3px double #667eea; padding: 25px; min-height: 450px; display: flex; flex-direction: column; justify-content: space-between;">
                
                <!-- Header -->
                <div>
                    <div style="font-size: 2rem; font-weight: bold; color: #667eea; margin-bottom: 5px;">
                        TulongAral+
                    </div>
                    <div style="font-size: 1.5rem; color: #764ba2; font-weight: 700; margin-bottom: 12px; letter-spacing: 1px;">
                        SCHOLARSHIP CERTIFICATE
                    </div>
                    <div style="height: 3px; width: 180px; background: linear-gradient(90deg, transparent, #667eea, #764ba2, transparent); margin: 0 auto 12px;"></div>
                    <div style="font-size: 1rem; color: #888; font-style: italic;">Certificate of Approval</div>
                </div>

                <!-- Body -->
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 15px 10px;">
                    <div style="font-size: 1.1rem; color: #555; margin-bottom: 12px; line-height: 1.3;">
                        This is to certify that
                    </div>

                    <div style="font-size: 2rem; font-weight: bold; color: #333; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.1;">${student.firstName} ${student.lastName}
                    </div>

                    <div style="font-size: 1rem; color: #666; margin-bottom: 12px; line-height: 1.2;">
                        has been successfully approved for the
                    </div>

                    <div style="font-size: 1.5rem; font-weight: 700; color: #667eea; margin-bottom: 12px; line-height: 1.1; padding: 0 10px;">
                        ${scholarship.title}
                    </div>

                    <div style="background: linear-gradient(135deg, #667eea15, #764ba215); padding: 12px; border-radius: 8px; margin: 12px 0;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.95rem;">
                            <div style="text-align: left;">
                                <div style="font-weight: 600; color: #667eea; margin-bottom: 3px;">Amount</div>
                                <div style="color: #333; font-weight: 700; font-size: 1.1rem;">₱${scholarship.amount.toLocaleString()}</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-weight: 600; color: #764ba2; margin-bottom: 3px;">Type</div>
                                <div style="color: #333; font-weight: 600; font-size: 0.95rem;">${scholarship.scholarshipType || 'Scholarship'}</div>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 12px; font-size: 0.95rem; color: #666; line-height: 1.4;">
                        <div style="margin-bottom: 6px;">
                            <span style="font-weight: 600; color: #667eea;">Institution:</span>
                            <span style="color: #333;">${scholarship.affiliatedInstitution || 'N/A'}</span>
                        </div>
                        <div style="margin-bottom: 6px;">
                            <span style="font-weight: 600; color: #764ba2;">Approved By:</span>
                            <span style="color: #333;">${sponsorName}</span>
                        </div>
                        ${scholarship.region ? `
                        <div style="margin-bottom: 6px;">
                            <span style="font-weight: 600; color: #667eea;">Region:</span>
                            <span style="color: #333;">${scholarship.region}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Footer -->
                <div>
                    <div style="height: 2px; width: 150px; background: linear-gradient(90deg, transparent, #667eea, transparent); margin: 15px auto 12px;"></div>

                    <div style="display: flex; justify-content: space-between; align-items: end; margin-top: 15px; padding: 0 15px; font-size: 0.9rem; color: #666;">
                        <div style="text-align: left;">
                            <div style="font-weight: 700; color: #667eea; margin-bottom: 3px;">Date</div>
                            <div style="color: #333; font-weight: 600; font-size: 0.85rem;">${formattedDate}</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="width: 120px; height: 2px; background: #333; margin-bottom: 4px;"></div>
                            <div style="font-size: 0.8rem; color: #999;">Signature</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: 700; color: #764ba2; margin-bottom: 3px;">Cert ID</div>
                            <div style="font-family: 'Courier New', monospace; color: #667eea; font-weight: 700; font-size: 0.85rem;">${application.certificateId || application._id.toString().slice(-8).toUpperCase()}</div>
                        </div>
                    </div>

                    <div style="margin-top: 12px; padding-top: 12px; border-top: 2px solid #e5e7eb; font-size: 0.8rem; color: #999; font-style: italic;">
                        Official proof of scholarship approval - verify at tulongaral.com
                    </div>
                </div>            </div>
        </div>
    `;

    certificateContainer.innerHTML = certificateHTML;
    console.log('✅ Certificate HTML generated and inserted');
    return certificateContainer;
    
    } catch (error) {
        console.error('❌ Error in generateCertificate:', error);
        throw error;
    }
}

// Show approval modal with certificate
async function showApprovalModal(application) {
    console.log('showApprovalModal called with:', application);
    console.log('Application ID:', application._id);
    console.log('API Base URL:', API_BASE_URL);

    try {
        // Validate application ID exists
        if (!application || !application._id) {
            throw new Error('Invalid application: Missing application ID');
        }

        // Fetch full application details
        const token = localStorage.getItem('authToken');
        console.log('Fetching application details for ID:', application._id);

        const apiUrl = `${API_BASE_URL}/applications/${application._id}/full-details`;
        console.log('Full API URL:', apiUrl);

        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', errorText);
            throw new Error(`Failed to fetch application details: ${response.status}`);
        }

        const data = await response.json();
        console.log('Application data received:', data);
        
        const { application: fullApp, scholarship, student } = data;
        
        if (!fullApp || !scholarship || !student) {
            console.error('Missing data:', { fullApp, scholarship, student });
            throw new Error('Incomplete application data');
        }

        console.log('Student:', student.firstName, student.lastName);
        console.log('Scholarship:', scholarship.title);
        console.log('Amount:', scholarship.amount);

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'approval-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
            overflow-y: auto;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 900px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
        `;

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.className = 'btn-icon';
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 2rem;
            background: none;
            border: none;
            cursor: pointer;
            color: #999;
            z-index: 1;
        `;
        closeBtn.onclick = () => {
            console.log('Closing modal');
            modal.remove();
        };

        // Congratulations message
        const congrats = document.createElement('div');
        congrats.style.cssText = `
            text-align: center;
            margin-bottom: 30px;
        `;
        congrats.innerHTML = `
            <h2 style="color: #667eea; font-size: 2rem; margin-bottom: 10px;">Congratulations!</h2>
            <p style="font-size: 1.2rem; color: #666;">Your scholarship application has been approved!</p>
        `;

        console.log('Generating certificate...');
        
        // Generate certificate
        const certificate = await generateCertificate(fullApp, scholarship, student);
        
        console.log('Certificate generated successfully');

        // Action buttons
        const actions = document.createElement('div');
        actions.style.cssText = `
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 30px;
            flex-wrap: wrap;
        `;
        actions.innerHTML = `
            <button onclick="downloadCertificate('${application._id}')" class="btn-primary">
                Download as PDF
            </button>
            <button onclick="downloadCertificateAsImage('${application._id}')" class="btn-secondary">
                Download as JPG Image
            </button>
        `;

        // Assemble modal
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(congrats);
        modalContent.appendChild(certificate);
        modalContent.appendChild(actions);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        console.log('Modal displayed successfully');

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                console.log('Closing modal (outside click)');
                modal.remove();
            }
        });

    } catch (error) {
        console.error('Error in showApprovalModal:', error);
        console.error('Error stack:', error.stack);
        
        let errorMsg = error.message;
        if (error.message.includes('404')) {
            errorMsg = 'Application not found. It may have been deleted or you don\'t have access to it.';
        } else if (error.message.includes('500')) {
            errorMsg = 'Server error loading application. Please try again later.';
        }
        
        alert('Error loading certificate: ' + errorMsg + '\n\nCongratulations! Your application has been approved!');
    }
}

// Download certificate as JPG Image
async function downloadCertificateAsImage(applicationId) {
    try {
        const certificate = document.querySelector('.certificate-container');
        
        if (!certificate) {
            alert('Certificate not found. Please try again.');
            return;
        }

        // Check if html2canvas is available (comes with html2pdf bundle)
        if (typeof html2canvas === 'undefined') {
            alert('Image generation library not loaded. Please refresh the page and try again.');
            console.error('html2canvas library not found');
            return;
        }

        // Use html2canvas to convert to image
        const canvas = await html2canvas(certificate, {
            scale: 3,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: certificate.offsetWidth,
            height: certificate.offsetHeight
        });

        // Convert to blob and download
        canvas.toBlob(function(blob) {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `scholarship-certificate-${applicationId}.jpg`;
            link.href = url;
            link.click();
            window.URL.revokeObjectURL(url);
        }, 'image/jpeg', 0.95);

    } catch (error) {
        console.error('Download error:', error);
        alert('Error downloading certificate. Please try again.');
    }
}

// Download certificate as PDF (centered, single page)
async function downloadCertificate(applicationId) {
    try {
        const certificate = document.querySelector('.certificate-container');
        
        if (!certificate) {
            alert('Certificate not found. Please try again.');
            return;
        }

        // Create wrapper for centering in PDF
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
            padding: 20px;
        `;
        
        // Clone certificate to avoid modifying original
        const clone = certificate.cloneNode(true);
        clone.style.margin = '0';
        clone.style.display = 'block';
        wrapper.appendChild(clone);
        
        // Temporarily add to document
        document.body.appendChild(wrapper);

        // Use html2pdf.js library for PDF generation
        if (typeof html2pdf !== 'undefined') {
            const opt = {
                margin: 0,
                filename: `scholarship-certificate-${applicationId}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2, 
                    useCORS: true, 
                    letterRendering: true,
                    logging: false,
                    scrollY: 0,
                    scrollX: 0
                },
                jsPDF: { 
                    unit: 'px', 
                    format: [800, 600],
                    orientation: 'landscape',
                    compress: true
                }
            };
            
            await html2pdf().set(opt).from(wrapper).save();
        } else {
            // Fallback: alert user to install library
            alert('PDF generation library not loaded. Please refresh the page and try again.');
            console.error('html2pdf library not found');
        }
        
        // Clean up
        document.body.removeChild(wrapper);
        
    } catch (error) {
        console.error('Download error:', error);
        alert('Error downloading certificate. Please try again or take a screenshot.');
    }
}

// Check for approved applications on page load
async function checkForApprovedApplications() {
    const currentUser = API.getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') return;

    // Check localStorage for shown approvals
    const shownApprovals = JSON.parse(localStorage.getItem('shownApprovals') || '[]');

    try {
         // Fetch recent applications
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/applications/student/my-applications`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });        if (!response.ok) {
            throw new Error('Failed to fetch applications');
        }

        const data = await response.json();
        const applications = data.applications || [];

        const recentlyApproved = applications.find(app => 
            app.status === 'approved' && 
            !shownApprovals.includes(app._id) &&
            // Approved within last 7 days
            app.reviewedAt && (new Date() - new Date(app.reviewedAt) < 7 * 24 * 60 * 60 * 1000)
        );

        if (recentlyApproved) {
            // Show approval modal
            showApprovalModal(recentlyApproved);
            
            // Mark as shown
            shownApprovals.push(recentlyApproved._id);
            localStorage.setItem('shownApprovals', JSON.stringify(shownApprovals));
        }
    } catch (err) {
        console.error('Error checking applications:', err);
    }
}

// Auto-check on student pages
if (window.location.pathname.includes('student-')) {
    document.addEventListener('DOMContentLoaded', checkForApprovedApplications);
}
