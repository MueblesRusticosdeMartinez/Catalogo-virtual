document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const password = document.getElementById('password').value;
        if (password === 'mueblesrusticos2017') {
            document.getElementById('login-screen').style.display = 'none';
            document.querySelector('header').style.display = 'flex';
            document.querySelector('.container').style.display = 'flex';
        } else {
            alert('Contraseña incorrecta.');
        }
    });

    loadSalesData();
    loadInventoryData();
});

document.getElementById('sales-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const product = document.getElementById('product').value;
    const amount = parseFloat(document.getElementById('amount').value);
    
    if (product === '' || isNaN(amount) || amount <= 0) {
        alert('Por favor ingresa un producto y un monto válido.');
        return;
    }

    const salesList = document.getElementById('sales-list');
    const totalDisplay = document.getElementById('total');

    const listItem = document.createElement('li');
    listItem.innerHTML = `Producto: ${product}, Monto: $${amount.toFixed(2)} <button onclick="removeSale(this, ${amount})">Eliminar</button>`;
    salesList.appendChild(listItem);

    const currentTotal = parseFloat(totalDisplay.textContent);
    const newTotal = currentTotal + amount;
    totalDisplay.textContent = newTotal.toFixed(2);

    // Save sale to localStorage
    saveSale({ product, amount, date: new Date() });

    document.getElementById('sales-form').reset();
    
    // Update weekly sales data
    const dayOfWeek = new Date().getDay(); // Sunday - Saturday : 0 - 6
    weeklySales[dayOfWeek] += amount;
    updateChart();
});

const weeklySales = [0, 0, 0, 0, 0, 0, 0]; // Sales data for the week
let inventory = [];

// Navigation
document.getElementById('home-link').addEventListener('click', () => {
    showSection('home-section');
});
document.getElementById('chart-link').addEventListener('click', () => {
    showSection('chart-section');
});
document.getElementById('sales-log-link').addEventListener('click', () => {
    showSection('sales-log-section');
    displaySalesLog();
});
document.getElementById('inventory-link').addEventListener('click', () => {
    showSection('inventory-section');
    displayInventory();
});

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

function displaySalesLog() {
    const salesLog = document.getElementById('sales-log');
    salesLog.innerHTML = '';
    const sales = JSON.parse(localStorage.getItem('sales')) || [];
    sales.forEach(sale => {
        const listItem = document.createElement('li');
        listItem.textContent = `Producto: ${sale.product}, Monto: $${sale.amount.toFixed(2)}`;
        salesLog.appendChild(listItem);
    });
}

document.getElementById('inventory-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const product = document.getElementById('inventory-product').value;
    const price = parseFloat(document.getElementById('inventory-price').value);
    const quantity = parseInt(document.getElementById('inventory-quantity').value);
    
    if (product === '' || isNaN(price) || price <= 0 || isNaN(quantity) || quantity <= 0) {
        alert('Por favor ingresa un producto, precio y cantidad válidos.');
        return;
    }

    const existingItem = inventory.find(item => item.product.toLowerCase() === product.toLowerCase());
    if (existingItem) {
        existingItem.price = price;
        existingItem.quantity += quantity;
    } else {
        inventory.push({ product, price, quantity });
    }

    saveInventory();
    displayInventory();
    document.getElementById('inventory-form').reset();
});

document.getElementById('search-box').addEventListener('input', function(event) {
    const query = event.target.value.toLowerCase();
    const filteredInventory = inventory.filter(item => item.product.toLowerCase().includes(query));
    displayInventory(filteredInventory);
});

function displayInventory(filteredInventory = inventory) {
    const inventoryList = document.getElementById('inventory-list');
    inventoryList.innerHTML = '';
    filteredInventory.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            Producto: ${item.product}, Precio: $${item.price.toFixed(2)}, Cantidad: ${item.quantity}
            <button onclick="removeFromInventory(${index})">Eliminar</button>
        `;
        inventoryList.appendChild(listItem);
    });
}

function removeFromInventory(index) {
    inventory.splice(index, 1);
    saveInventory();
    displayInventory();
}

function removeSale(button, amount) {
    button.parentElement.remove();
    const totalDisplay = document.getElementById('total');
    const currentTotal = parseFloat(totalDisplay.textContent);
    const newTotal = currentTotal - amount;
    totalDisplay.textContent = newTotal.toFixed(2);

    // Update localStorage sales data
    const sales = JSON.parse(localStorage.getItem('sales')) || [];
    const saleIndex = sales.findIndex(sale => sale.amount === amount);
    if (saleIndex !== -1) {
        sales.splice(saleIndex, 1);
        localStorage.setItem('sales', JSON.stringify(sales));
        updateWeeklySales(sales);
    }
}

// Chart.js setup
const ctx = document.getElementById('weekly-chart').getContext('2d');
const weeklyChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        datasets: [{
            label: 'Ventas Semanales ($)',
            data: weeklySales,
            backgroundColor: 'rgba(0, 123, 255, 0.5)',
            borderColor: 'rgba(0, 123, 255, 1)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

function updateChart() {
    weeklyChart.data.datasets[0].data = weeklySales;
    weeklyChart.update();
}

// Functions to save and load sales data
function saveSale(sale) {
    const sales = JSON.parse(localStorage.getItem('sales')) || [];
    sales.push(sale);
    localStorage.setItem('sales', JSON.stringify(sales));
    updateWeeklySales(sales);
}

function loadSalesData() {
    const sales = JSON.parse(localStorage.getItem('sales')) || [];
    const salesList = document.getElementById('sales-list');
    const totalDisplay = document.getElementById('total');
    let total = 0;

    sales.forEach(sale => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `Producto: ${sale.product}, Monto: $${sale.amount.toFixed(2)} <button onclick="removeSale(this, ${sale.amount})">Eliminar</button>`;
        salesList.appendChild(listItem);
        total += sale.amount;
    });

    totalDisplay.textContent = total.toFixed(2);
    updateWeeklySales(sales);
}

function updateWeeklySales(sales) {
    weeklySales.fill(0);
    sales.forEach(sale => {
        const saleDate = new Date(sale.date);
        const dayOfWeek = saleDate.getDay();
        weeklySales[dayOfWeek] += sale.amount;
    });
    updateChart();
}

// Functions to save and load inventory data
function saveInventory() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
}

function loadInventoryData() {
    const savedInventory = JSON.parse(localStorage.getItem('inventory')) || [];
    savedInventory.forEach(item => inventory.push(item));
    displayInventory();
}

// Initial display setup
showSection('home-section');
