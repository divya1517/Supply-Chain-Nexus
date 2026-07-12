// Initial Mock State
let inventory = {
    Rice: { stock: 119, threshold: 20 },
    Sugar: { stock: 13, threshold: 20 },
    Oil: { stock: 0, threshold: 15 }
};

let dispatchLogs = [
    { time: "19:53:01", customer: "susi_15", commodity: "Sugar", qty: 1 },
    { time: "19:53:29", customer: "divi_7", commodity: "Rice", qty: 1 },
    { time: "20:12:59", customer: "uma_26", commodity: "Sugar", qty: 1 }
];

// Run UI Lifecycle Update
function updateDashboard() {
    updateTime();
    renderLedger();
    renderLogs();
    runAIEngine();
    calculateKPIs();
}

function updateTime() {
    const now = new Date();
    document.getElementById('system-time').innerText = now.toTimeString().split(' ')[0];
}

function renderLedger() {
    const tbody = document.querySelector('#ledger-table tbody');
    tbody.innerHTML = '';
    
    for (let item in inventory) {
        let stock = inventory[item].stock;
        let thresh = inventory[item].threshold;
        let status = "HEALTHY";
        let statusClass = "status-healthy";

        if (stock === 0) {
            status = "EMPTY";
            statusClass = "status-empty";
        } else if (stock < thresh) {
            status = "LOW";
            statusClass = "status-low";
        }

        tbody.innerHTML += `
            <tr>
                <td><strong>${item}</strong></td>
                <td>${stock}</td>
                <td>${thresh}</td>
                <td><span class="status-tag ${statusClass}">${status}</span></td>
            </tr>
        `;
    }
}

function renderLogs() {
    const tbody = document.querySelector('#log-table tbody');
    tbody.innerHTML = '';
    dispatchLogs.slice().reverse().forEach(log => {
        tbody.innerHTML += `
            <tr>
                <td>${log.time}</td>
                <td>${log.customer}</td>
                <td>${log.commodity}</td>
                <td>+ ${log.qty}</td>
            </tr>
        `;
    });
}

function runAIEngine() {
    const aiBox = document.getElementById('ai-suggestions');
    let html = '';

    // Rice Logic
    if(inventory.Rice.stock >= inventory.Rice.threshold) {
        html += `<p>🟢 <strong>RICE:</strong> Rice stock is healthy (${inventory.Rice.stock}/${inventory.Rice.threshold}).</p>`;
    }
    // Sugar Logic
    if(inventory.Sugar.stock < inventory.Sugar.threshold && inventory.Sugar.stock > 0) {
        html += `<p>🟡 <strong>SUGAR:</strong> Sugar is below its safety threshold (${inventory.Sugar.stock}/${inventory.Sugar.threshold}). Reorder recommended.</p>`;
    }
    // Oil Logic
    if(inventory.Oil.stock === 0) {
        html += `<p>🔴 <strong>OIL:</strong> Oil is out of stock. Immediate procurement required.</p>`;
    }
    aiBox.innerHTML = html;
}

function calculateKPIs() {
    let totalStock = 0;
    let lowLines = 0;
    let outStock = 0;

    for (let item in inventory) {
        totalStock += inventory[item].stock;
        if (inventory[item].stock === 0) outStock++;
        else if (inventory[item].stock < inventory[item].threshold) lowLines++;
    }

    document.getElementById('kpi-total-stock').innerText = totalStock;
    document.getElementById('kpi-processed-orders').innerText = dispatchLogs.length;
    document.getElementById('kpi-low-lines').innerText = lowLines;
    document.getElementById('kpi-out-stock').innerText = outStock;
}

// Event Listeners
document.getElementById('authorize-btn').addEventListener('click', () => {
    const custId = document.getElementById('customer-id').value.trim();
    const commodity = document.getElementById('commodity-select').value;
    const qty = parseInt(document.getElementById('dispatch-qty').value);

    if (!custId || !commodity || isNaN(qty) || qty <= 0) {
        alert("Please fill out all operational dispatch fields correctly.");
        return;
    }

    if (inventory[commodity].stock < qty) {
        alert(`Insufficient stock level to dispatch ${qty} units of ${commodity}.`);
        return;
    }

    // Mutate Data States
    inventory[commodity].stock -= qty;
    const timestamp = new Date().toTimeString().split(' ')[0];
    dispatchLogs.push({ time: timestamp, customer: custId, commodity: commodity, qty: qty });

    // Clear Inputs & Refresh
    document.getElementById('customer-id').value = '';
    updateDashboard();
});

// Init on startup
updateDashboard();
setInterval(updateTime, 1000);
