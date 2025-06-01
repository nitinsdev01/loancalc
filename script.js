// DOM Elements
const elements = {
    loanAmount: document.getElementById('loanAmount'),
    loanTerm: document.getElementById('loanTerm'),
    interestRate: document.getElementById('interestRate'),
    tenureYears: document.getElementById('tenureYears'),
    tenureMonths: document.getElementById('tenureMonths'),
    monthlyEMI: document.getElementById('monthlyEMI'),
    totalInterest: document.getElementById('totalInterest'),
    totalPayment: document.getElementById('totalPayment'),
    result: document.getElementById('result'),
    amortizationScheduleCard: document.getElementById('amortizationScheduleCard'),
    amortizationAccordion: document.getElementById('amortizationAccordion')
};

// Update tenure display
function updateTenureYears() {
    const totalMonths = parseInt(elements.loanTerm.value) || 0;
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    elements.tenureYears.textContent = years;
    elements.tenureMonths.textContent = months;
}

// Calculate EMI
function calculateEMI(loanAmount, loanTerm, monthlyRate) {
    return loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm) / (Math.pow(1 + monthlyRate, loanTerm) - 1);
}

// Format currency
function formatCurrency(amount) {
    return '₹' + amount.toFixed(2);
}

// Create monthly row HTML
function createMonthlyRow(monthDetail) {
    return `
        <div class="d-flex align-items-center py-1 border-bottom">
            <div class="month">${monthDetail.monthName}</div>
            <div class="os-loan">${formatCurrency(monthDetail.beginningBalance)}</div>
            <div class="principal">${formatCurrency(monthDetail.principal)}</div>
            <div class="interest">${formatCurrency(monthDetail.interest)}</div>
            <div class="emi">${formatCurrency(monthDetail.emi)}</div>
        </div>
    `;
}

// Create year summary HTML
function createYearSummary(yearData) {
    return `
        <div class="d-flex align-items-center py-1 bg-light fw-bold">
            <div class="month">Total</div>
            <div class="os-loan">${formatCurrency(yearData.beginningBalance)}</div>
            <div class="principal">${formatCurrency(yearData.totalPrincipal)}</div>
            <div class="interest">${formatCurrency(yearData.totalInterest)}</div>
            <div class="emi">${formatCurrency(yearData.totalEMI)}</div>
        </div>
    `;
}

// Calculate and display amortization schedule
function calculateAmortizationSchedule(loanAmount, loanTerm, monthlyRate, emi) {
    let remainingAmount = loanAmount;
    elements.amortizationAccordion.innerHTML = '';
    const fragment = document.createDocumentFragment();
    const startDate = new Date();
    let yearlyData = {};

    // Calculate monthly data
    for (let month = 1; month <= loanTerm; month++) {
        const beginningBalance = remainingAmount;
        const interestAmount = beginningBalance * monthlyRate;
        const principalAmount = emi - interestAmount;
        remainingAmount = Math.max(0, beginningBalance - principalAmount);

        const paymentDate = new Date(startDate);
        paymentDate.setMonth(startDate.getMonth() + month - 1);
        const year = paymentDate.getFullYear();
        const monthName = paymentDate.toLocaleString('en-IN', { month: 'short' });

        if (!yearlyData[year]) {
            yearlyData[year] = {
                months: [],
                totalPrincipal: 0,
                totalInterest: 0,
                totalEMI: 0,
                beginningBalance: beginningBalance
            };
        }

        yearlyData[year].months.push({
            monthName,
            beginningBalance,
            emi,
            principal: principalAmount,
            interest: interestAmount,
            endingBalance: remainingAmount
        });

        yearlyData[year].totalPrincipal += principalAmount;
        yearlyData[year].totalInterest += interestAmount;
        yearlyData[year].totalEMI += emi;
    }

    // Build accordion items
    let accordionIndex = 0;
    for (const year in yearlyData) {
        if (yearlyData.hasOwnProperty(year)) {
            const yearData = yearlyData[year];
            const accordionItem = document.createElement('div');
            accordionItem.className = 'accordion-item';
            accordionItem.innerHTML = `
                <h2 class="accordion-header" id="heading${accordionIndex}">
                    <button class="accordion-button ${accordionIndex === 0 ? '' : 'collapsed'}" type="button" 
                            data-bs-toggle="collapse" data-bs-target="#collapse${accordionIndex}" 
                            aria-expanded="${accordionIndex === 0 ? 'true' : 'false'}" 
                            aria-controls="collapse${accordionIndex}">
                        ${year}
                    </button>
                </h2>
                <div id="collapse${accordionIndex}" class="accordion-collapse collapse ${accordionIndex === 0 ? 'show' : ''}" 
                     aria-labelledby="heading${accordionIndex}" data-bs-parent="#amortizationAccordion">
                    <div class="accordion-body">
                        <div class="accordion-body-scroll">
                            <div class="d-flex align-items-center py-1 bg-light fw-bold">
                                <div class="month">Month</div>
                                <div class="os-loan">OS Loan</div>
                                <div class="principal">Principal</div>
                                <div class="interest">Interest</div>
                                <div class="emi">EMI</div>
                            </div>
                            ${yearData.months.map(createMonthlyRow).join('')}
                            ${createYearSummary(yearData)}
                        </div>
                    </div>
                </div>
            `;
            fragment.appendChild(accordionItem);
            accordionIndex++;
        }
    }

    elements.amortizationAccordion.appendChild(fragment);
}

// Main calculation function
function calculateLoan() {
    // Get input values
    const loanAmount = parseFloat(elements.loanAmount.value);
    const loanTerm = parseInt(elements.loanTerm.value);
    const interestRate = parseFloat(elements.interestRate.value);

    // Calculate monthly interest rate
    const monthlyRate = interestRate / 12 / 100;

    // Calculate EMI
    const emi = calculateEMI(loanAmount, loanTerm, monthlyRate);

    // Calculate total payment and interest
    const totalPayment = emi * loanTerm;
    const totalInterest = totalPayment - loanAmount;

    // Update result fields
    elements.monthlyEMI.textContent = formatCurrency(emi);
    elements.totalInterest.textContent = formatCurrency(totalInterest);
    elements.totalPayment.textContent = formatCurrency(totalPayment);

    // Calculate and display amortization schedule
    calculateAmortizationSchedule(loanAmount, loanTerm, monthlyRate, emi);

    // Show results and amortization schedule card
    elements.result.style.display = 'block';
    elements.amortizationScheduleCard.style.display = 'block';
}

// Print amortization schedule
function printAmortizationSchedule() {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Get all accordion items
    const accordionItems = document.querySelectorAll('.accordion-item');
    
    // Create print content
    let printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Amortization Chart</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                @page {
                    margin: 0;
                    size: auto;
                }
                body { 
                    font-family: 'Inter', sans-serif;
                    margin: 0;
                    padding: 0;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .print-container { 
                    padding: 20px;
                }
                .loan-details {
                    border: 1px solid #dee2e6;
                    border-radius: 0.5rem;
                    padding: 15px;
                    margin-bottom: 20px;
                    background-color: #f8f9fa;
                }
                .loan-details .row {
                    margin: 0;
                }
                .loan-details .col {
                    padding: 0 15px;
                    border-right: 1px solid #dee2e6;
                }
                .loan-details .col:last-child {
                    border-right: none;
                }
                .loan-details p {
                    margin: 0;
                    font-size: 0.9rem;
                }
                .loan-details strong {
                    color: #495057;
                }
                .year-header {
                    background-color: #e7f1ff;
                    padding: 8px 15px;
                    margin: 0;
                    font-size: 1rem;
                    font-weight: 600;
                    color: #0d6efd;
                    border: 1px solid #dee2e6;
                    border-bottom: none;
                }
                .accordion-item { 
                    margin-bottom: 10px;
                }
                .accordion-button { 
                    padding: 10px;
                }
                .accordion-button:not(.collapsed) { 
                    background-color: #e7f1ff;
                }
                .month { width: 80px; min-width: 80px; padding: 0 0.75rem; }
                .os-loan { width: 120px; min-width: 120px; padding: 0 0.75rem; }
                .principal, .interest, .emi { width: 110px; min-width: 110px; padding: 0 0.75rem; }
                .d-flex { min-width: 560px; }
                .bg-light {
                    background-color: #f8f9fa !important;
                }
                .bg-primary {
                    background-color: #e7f1ff !important;
                }
                .text-primary {
                    color: #0d6efd !important;
                }
                .fw-bold {
                    font-weight: 600 !important;
                }
                .border-bottom {
                    border-bottom: 1px solid #dee2e6 !important;
                }
                @media print {
                    .no-print { display: none; }
                    .accordion-collapse { display: block !important; }
                    .accordion-button { display: none; }
                    @page { margin: 0; }
                    body { margin: 0; }
                    html, body {
                        height: 100%;
                        width: 100%;
                    }
                    .print-container {
                        width: 100%;
                        height: 100%;
                    }
                }
            </style>
        </head>
        <body>
            <div class="print-container">
                <h1>Amortization Chart</h1>
                <div class="loan-details">
                    <div class="row">
                        <div class="col">
                            <p><strong>Loan Amount:</strong> ${formatCurrency(parseFloat(elements.loanAmount.value))}</p>
                        </div>
                        <div class="col">
                            <p><strong>Loan Term:</strong> ${elements.loanTerm.value} months</p>
                        </div>
                        <div class="col">
                            <p><strong>Interest Rate:</strong> ${elements.interestRate.value}%</p>
                        </div>
                    </div>
                </div>
                <div class="loan-details">
                    <div class="row">
                        <div class="col">
                            <p><strong>Monthly EMI:</strong> ${elements.monthlyEMI.textContent}</p>
                        </div>
                        <div class="col">
                            <p><strong>Total Interest:</strong> ${elements.totalInterest.textContent}</p>
                        </div>
                        <div class="col">
                            <p><strong>Total Payment:</strong> ${elements.totalPayment.textContent}</p>
                        </div>
                    </div>
                </div>
                <div class="accordion">
    `;

    // Add each accordion item's content
    accordionItems.forEach(item => {
        const year = item.querySelector('.accordion-button').textContent.trim();
        const content = item.querySelector('.accordion-body').innerHTML;
        
        printContent += `
            <div class="accordion-item">
                <h2 class="year-header">${year}</h2>
                <div class="accordion-collapse show">
                    <div class="accordion-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;
    });

    printContent += `
                </div>
            </div>
            <script>
                // Function to handle printing
                function handlePrint() {
                    // Add a small delay to ensure content is fully loaded
                    setTimeout(() => {
                        try {
                            window.print();
                        } catch (error) {
                            console.error('Print failed:', error);
                            // Fallback for mobile devices
                            const printFrame = document.createElement('iframe');
                            printFrame.style.display = 'none';
                            document.body.appendChild(printFrame);
                            printFrame.contentWindow.document.write(document.documentElement.outerHTML);
                            printFrame.contentWindow.document.close();
                            printFrame.contentWindow.focus();
                            printFrame.contentWindow.print();
                        }
                    }, 500);
                }

                // Function to handle window closing
                function handleClose() {
                    // Add a delay before closing to ensure print dialog has time to open
                    setTimeout(() => {
                        window.close();
                    }, 1000);
                }

                // Listen for print dialog close
                window.addEventListener('afterprint', handleClose);

                // Start the print process when the page loads
                window.addEventListener('load', handlePrint);
            </script>
        </body>
        </html>
    `;

    // Write content to new window and print
    printWindow.document.write(printContent);
    printWindow.document.close();
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    updateTenureYears();
    elements.loanTerm.addEventListener('input', updateTenureYears);
}); 