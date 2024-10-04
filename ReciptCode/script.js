function addRow() {
    const tableBody = document.querySelector("#particularsTable tbody");
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td><input type="text" name="particulars"></td>
        <td><input type="number" name="qty" class="qty" onchange="calculateTotal()"></td>
        <td><input type="number" name="rate" class="rate" onchange="calculateTotal()"></td>
        <td><input type="number" name="amount" class="amount" readonly></td>
    `;
    tableBody.appendChild(newRow);
}

function calculateTotal() {
    const rows = document.querySelectorAll("#particularsTable tbody tr");
    let total = 0;
    
    rows.forEach(row => {
        const qty = row.querySelector('.qty').value || 0;
        const rate = row.querySelector('.rate').value || 0;
        const amount = row.querySelector('.amount');
        
        const rowTotal = qty * rate;
        amount.value = rowTotal;
        total += rowTotal;
    });

    document.querySelector('input[name="total"]').value = total;
    const advance = document.querySelector('input[name="advance"]').value || 0;
    document.querySelector('input[name="dues"]').value = total - advance;
    document.querySelector('input[name="amountInWords"]').value = numberToWords(total);
}

function numberToWords(num) {
    // Function to convert number to words
    const a = [
        '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
        'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 
        'seventeen', 'eighteen', 'nineteen'
    ];
    const b = [
        '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
    ];
    
    if (num === 0) return 'zero';
    if (num < 20) return a[num];
    if (num < 100) return b[Math.floor(num / 10)] + (num % 10 !== 0 ? '-' + a[num % 10] : '');
    if (num < 1000) return a[Math.floor(num / 100)] + ' hundred' + (num % 100 !== 0 ? ' and ' + numberToWords(num % 100) : '');
    return '';
}

function previewSignature() {
    const file = document.getElementById('signatureUpload').files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const signaturePreview = document.getElementById('signaturePreview');
        signaturePreview.src = e.target.result;
        signaturePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const element = document.getElementById('receipt');
    const signatureImage = document.getElementById('signaturePreview');

    const pdf = new jsPDF('p', 'mm', 'a4');

    // Use html2canvas to capture the entire receipt
    html2canvas(element, { 
        scale: 2,
        useCORS: true, // Allow cross-origin images
        logging: true,  // Enable logging for debugging
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add the receipt image to the PDF
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

        // If the signature image is displayed, add it to the PDF
        if (signatureImage.style.display === 'block') {
            const posX = 150; // Adjust these values as needed
            const posY = 250;
            pdf.addImage(signatureImage.src, 'PNG', posX, posY, 40, 20);
        }

        // Save the PDF
        pdf.save('receipt.pdf');
    }).catch(err => {
        console.error('Error generating PDF', err);
    });
}
