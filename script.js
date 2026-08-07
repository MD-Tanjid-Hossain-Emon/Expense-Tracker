const expenseForm = document.getElementById('expense-form');
const dateInput = document.getElementById('date');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const expenseList = document.getElementById('expense-list');
const monthlyTotalElement = document.getElementById('monthly-total');
const selectedDateDisplay = document.getElementById('selected-date-display');

const storageKey = 'bdtExpenseTracker';
const dateKey = 'bdtExpenseDate';
const expenses = loadExpenses();
let selectedDate = loadSelectedDate();

function formatCurrency(value) {
  return value.toLocaleString('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function loadExpenses() {
  const stored = localStorage.getItem(storageKey);
  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.map((item) => ({
          category: item.category,
          amount: Number(item.amount) || 0,
        }))
      : [];
  } catch (error) {
    console.warn('Failed to load saved expenses:', error);
    return [];
  }
}

function loadSelectedDate() {
  const storedDate = localStorage.getItem(dateKey);
  if (storedDate) {
    return storedDate;
  }

  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem(dateKey, today);
  return today;
}

function saveExpenses() {
  localStorage.setItem(storageKey, JSON.stringify(expenses));
}

function saveSelectedDate(date) {
  localStorage.setItem(dateKey, date);
}

function renderSelectedDate() {
  const readableDate = new Date(selectedDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  selectedDateDisplay.textContent = readableDate;
  dateInput.value = selectedDate;
}

function updateSummary() {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  monthlyTotalElement.textContent = formatCurrency(total);
}

function renderExpenses() {
  expenseList.innerHTML = '';

  if (expenses.length === 0) {
    const row = document.createElement('tr');
    const noData = document.createElement('td');
    noData.className = 'no-data';
    noData.colSpan = 5;
    noData.textContent = 'No expenses recorded yet. Add your first expense above.';
    row.appendChild(noData);
    expenseList.appendChild(row);
    return;
  }

  const dateTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const readableDate = new Date(selectedDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  expenses.forEach((expense, index) => {
    const row = document.createElement('tr');

    if (index === 0) {
      const dateCell = document.createElement('td');
      dateCell.textContent = readableDate;
      dateCell.rowSpan = expenses.length;
      row.appendChild(dateCell);
    }

    const categoryCell = document.createElement('td');
    categoryCell.textContent = expense.category;

    const amountCell = document.createElement('td');
    amountCell.textContent = formatCurrency(expense.amount);

    if (index === 0) {
      const totalCell = document.createElement('td');
      totalCell.textContent = formatCurrency(dateTotal);
      totalCell.rowSpan = expenses.length;
      totalCell.className = 'date-total-cell';
      row.appendChild(categoryCell);
      row.appendChild(amountCell);
      row.appendChild(totalCell);
    } else {
      row.appendChild(categoryCell);
      row.appendChild(amountCell);
    }

    const actionCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'action-btn';
    deleteButton.addEventListener('click', () => {
      const index = expenses.indexOf(expense);
      if (index >= 0) {
        expenses.splice(index, 1);
        saveExpenses();
        renderExpenses();
        updateSummary();
      }
    });
    actionCell.appendChild(deleteButton);
    row.appendChild(actionCell);

    expenseList.appendChild(row);
  });
}

dateInput.addEventListener('change', (event) => {
  selectedDate = event.target.value;
  saveSelectedDate(selectedDate);
  renderSelectedDate();
});

expenseForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;

  if (!selectedDate || isNaN(amount) || amount < 0) {
    return;
  }

  expenses.push({ category, amount: Number(amount.toFixed(2)) });
  saveExpenses();
  renderExpenses();
  updateSummary();

  amountInput.value = '';
  amountInput.focus();
});

renderSelectedDate();
updateSummary();
renderExpenses();
