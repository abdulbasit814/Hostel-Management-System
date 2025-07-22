// --- 1. Data & State ---
const defaultHostels = [
  {
    id: 1,
    name: "Esafeed Hostel",
    location: "123 Campus Road, University Area",
    description: "Luxurious hostel with modern amenities, close to university campus. Perfect for students who want comfort and convenience.",
    rooms: 5,
    price: 350,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    amenities: ["WiFi", "Laundry", "Study Room", "Cafeteria", "24/7 Security"]
  },
  {
    id: 2,
    name: "SSNIT Hostel",
    location: "456 Park Avenue, Downtown",
    description: "Eco-friendly hostel surrounded by nature. Peaceful environment with spacious rooms and garden area.",
    rooms: 8,
    price: 280,
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    amenities: ["Garden", "WiFi", "Bike Rental", "Kitchen", "24/7 Security"]
  },
  {
    id: 3,
    name: "Senem Hostel",
    location: "789 Central Street, City Center",
    description: "Modern hostel in the heart of the city. Close to public transportation, shopping centers, and entertainment.",
    rooms: 3,
    price: 320,
    image: "https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    amenities: ["WiFi", "TV Lounge", "Cafeteria", "Game Room", "24/7 Security"]
  }
];

const defaultAdmin = {
  name: "Admin",
  email: "admin@hostel.com",
  password: "admin123",
  isAdmin: true
};

// --- Helper Functions for Local Storage ---
function getHostels() {
  return JSON.parse(localStorage.getItem('hostels') || JSON.stringify(defaultHostels));
}

function setHostels(hostels) {
  localStorage.setItem('hostels', JSON.stringify(hostels));
}

function getUsers() {
  let users = JSON.parse(localStorage.getItem('users') || '[]');
  // Ensure default admin exists
  if (!users.find(u => u.email === defaultAdmin.email)) {
    users.push(defaultAdmin);
    localStorage.setItem('users', JSON.stringify(users));
  }
  return users;
}

function setUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function getBookings() {
  return JSON.parse(localStorage.getItem('bookings') || '[]');
}

function setBookings(bookings) {
  localStorage.setItem('bookings', JSON.stringify(bookings));
}

// --- 2. DOM Elements ---
const authModal = document.getElementById('auth-modal');
const appContent = document.getElementById('app-content');
// FIX: Using querySelector as the HTML element uses a class, not an ID.
const closeModal = document.querySelector('.close-modal');
const tabs = document.querySelectorAll('.tab');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notification-message');

// --- 3. State Variables ---
let currentUser = null;
let currentHostel = null;
let currentBooking = null;

// --- 4. Helper/Utility Functions ---
function showNotification(message, type = 'success') {
  notification.className = `notification notification-${type}`;
  notificationMessage.textContent = message;
  notification.classList.add('show');
  notification.style.display = 'block';
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.style.display = 'none';
    }, 300);
  }, 3000);
}

function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
  document.getElementById(viewId).style.display = 'block';
}

/**
 * Clears all login and signup form fields.
 */
function clearAuthForms() {
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('signup-name').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
    document.getElementById('signup-confirm').value = '';
}

// --- 5. Authentication Logic ---
function authenticateUser(email, password) {
  const users = getUsers();
  return users.find(u => u.email === email && u.password === password);
}

function registerUser(name, email, password) {
  const users = getUsers();

  if (users.find(u => u.email === email)) {
    return { success: false, message: 'Email already registered' };
  }

  users.push({ name, email, password, isAdmin: false });
  setUsers(users);
  return { success: true };
}

function saveCurrentUser(user) {
  currentUser = user;
  sessionStorage.setItem('currentUser', JSON.stringify(user));
  updateUIAfterLogin();
}

function updateUIAfterLogin() {
  // Hide auth modal and show app content
  authModal.style.display = 'none';
  appContent.style.display = 'block';
  const authBtn = document.getElementById('auth-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const authBtn2 = document.getElementById('auth-btn2'); // <--- Get the second login button

  if (authBtn) {
      authBtn.style.display = 'none';
  }
  if (logoutBtn) {
      logoutBtn.style.display = 'inline-block';
  }
  if (authBtn2) { // <--- Hide the second login button too!
      authBtn2.style.display = 'none';
  }

 

  // Update UI based on user role
  const adminLink = document.getElementById('admin-link');
  if (adminLink) { 
    if (currentUser.isAdmin) {
      adminLink.style.display = 'inline-block';
      showView('admin-view'); 
      renderAdminDashboard(); 
    } else {
      adminLink.style.display = 'none';
      showView('home-view'); 
       
    }
  }

  // Update user greeting 
  const userGreetingElement = document.getElementById('user-greeting');
  if (userGreetingElement) { 
    userGreetingElement.textContent = `Hello, ${currentUser.name}`;
  }

  document.getElementById('auth-btn').style.display = 'none';
  document.getElementById('logout-btn').style.display = 'inline-block';
}

function logout() {
  currentUser = null;
  sessionStorage.removeItem('currentUser');

  // Reset UI
  authModal.style.display = 'flex';
  appContent.style.display = 'none';
  

  const userGreetingElement = document.getElementById('user-greeting');
  if (userGreetingElement) {
    userGreetingElement.textContent = '';
  }
  document.getElementById('auth-btn').style.display = 'inline-block';
  document.getElementById('logout-btn').style.display = 'none';
  const adminLink = document.getElementById('admin-link');
  if (adminLink) {
    adminLink.style.display = 'none';
  }

  clearAuthForms();

  // Switch to login tab
  tabs[0].click();
}

// --- 6. Hostel Listing & Detail Logic ---
function renderHostels() {
  const hostels = getHostels();
  const container = document.getElementById('all-hostels');
  if (!container) return;
  container.innerHTML = '';
  hostels.forEach(hostel => {
    container.innerHTML += `
      <div class="card">
        <div class="card-img">
          <img src="${hostel.image}" alt="${hostel.name}">
        </div>
        <div class="card-content">
          <h3>${hostel.name}</h3>
          <p>${hostel.description.substring(0, 100)}...</p>
          <div class="card-meta">
            <span><i class="fas fa-map-marker-alt"></i> ${hostel.location}</span>
            <span><i class="fas fa-bed"></i> ${hostel.rooms} rooms left</span>
          </div>
          <div class="card-meta">
            <span><i class="fas fa-cedi-sign"></i> ${hostel.price}/month</span>
          </div>
          <div class="card-actions">
            <button class="btn btn-outline view-hostel-btn" data-id="${hostel.id}">
              <i class="fas fa-info-circle"></i> Details
            </button>
            <button class="btn btn-primary book-hostel-btn" data-id="${hostel.id}">
              <i class="fas fa-calendar-check"></i> Book
            </button>
          </div>
        </div>
      </div>
    `;
  });
}

function showHostelDetails(hostelId) {
  const hostel = getHostels().find(h => h.id === hostelId);
  if (!hostel) return;
  currentHostel = hostel;
  document.getElementById('hostel-detail-name').textContent = hostel.name;
  document.getElementById('hostel-detail-location').textContent = hostel.location;
  document.getElementById('hostel-detail-description').textContent = hostel.description;
  document.getElementById('hostel-detail-rooms').textContent = hostel.rooms;
  document.getElementById('hostel-detail-price').textContent = `₵${hostel.price}/month`;
  document.getElementById('hostel-detail-image').src = hostel.image;
  const amenitiesContainer = document.getElementById('hostel-detail-amenities');
  amenitiesContainer.innerHTML = '';
  hostel.amenities.forEach(amenity => {
    amenitiesContainer.innerHTML += `
      <div style="background: #f5f5f5; padding: 10px; border-radius: 8px; text-align: center; flex: 1;">
        <i class="fas fa-check-circle" style="color: #28a745;"></i> ${amenity}
      </div>
    `;
  });
  showView('hostel-detail-view');
}

// --- 7. Booking Logic ---
function submitBooking() {
  const fullName = document.getElementById('full-name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const studentId = document.getElementById('id-number').value.trim();
  const checkIn = document.getElementById('check-in').value;
  const duration = parseInt(document.getElementById('duration').value);
  const requests = document.getElementById('special-requests').value.trim();

  if (!fullName || !email || !phone || !studentId || !checkIn) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }

  const booking = {
    id: `HP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
    hostel: currentHostel.name,
    hostelId: currentHostel.id,
    name: fullName,
    email: email,
    phone: phone,
    studentId: studentId,
    checkIn: checkIn,
    duration: duration,
    price: currentHostel.price * duration,
    ref: `HP-REF-${Math.floor(10000 + Math.random() * 90000)}`,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    status: 'Pending',
    userEmail: currentUser ? currentUser.email : email
  };

  // Save booking
  const bookings = getBookings();
  bookings.unshift(booking); 
  setBookings(bookings);

  // Update hostel rooms
  const hostels = getHostels();
  const hostel = hostels.find(h => h.id === currentHostel.id);
  if (hostel) {
    hostel.rooms = Math.max(0, hostel.rooms - 1);
    setHostels(hostels);
  }

  // Update receipt
  currentBooking = booking;
  document.getElementById('receipt-id').textContent = booking.id;
  document.getElementById('receipt-date').textContent = booking.date;
  document.getElementById('receipt-ref').textContent = booking.ref;
  document.getElementById('receipt-hostel').textContent = booking.hostel;
  document.getElementById('receipt-duration').textContent = `${booking.duration} Months`;
  document.getElementById('receipt-checkin').textContent = new Date(booking.checkIn).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('receipt-name').textContent = booking.name;
  document.getElementById('receipt-email').textContent = booking.email;
  document.getElementById('receipt-phone').textContent = booking.phone;
  document.getElementById('receipt-student-id').textContent = booking.studentId;
  document.getElementById('receipt-amount').textContent = `₵${(booking.price).toLocaleString()}`;

  showView('receipt-view');
  showNotification('New booking created! Admin has been notified.', 'success');
  renderHostels();
  renderMyBookings(); 
}
  
function showBookingForm() {
  if (!currentHostel) {
    showNotification('Could not find hostel to book.', 'error');
    return;
  }
  document.getElementById('booking-hostel').value = currentHostel.name;
  
  if (currentUser) {
      document.getElementById('full-name').value = currentUser.name || '';
      document.getElementById('email').value = currentUser.email || '';
  } else {
      document.getElementById('full-name').value = '';
      document.getElementById('email').value = '';
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('check-in').valueAsDate = tomorrow;
  showView('booking-form-view');
}

function renderMyBookings() {
  const bookings = getBookings();
  const tbody = document.getElementById('my-bookings');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (!currentUser) {
      tbody.innerHTML = `<tr><td colspan="6">Please login to view your bookings.</td></tr>`;
      return;
  }

  const myBookings = bookings.filter(b => b.userEmail === currentUser.email);
  if (myBookings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6">No bookings found.</td></tr>`;
    return;
  }
  myBookings.forEach(b => {
    tbody.innerHTML += `
      <tr>
        <td>${b.id}</td>
        <td>${b.hostel}</td>
        <td>${new Date(b.checkIn).toLocaleDateString()}</td>
        <td>${b.duration} months</td>
        <td>₵${b.price.toLocaleString()}</td>
        <td><span class="status status-${b.status ? b.status.toLowerCase().replace(' ', '-') : 'pending'}">${b.status || 'Pending'}</span></td>
      </tr>
    `;
  });
}

// --- 8. Admin Dashboard Logic 

// Hostel Management for Admin
function addNewHostel() {
    const name = document.getElementById('new-hostel-name').value.trim();
    const location = document.getElementById('new-hostel-location').value.trim();
    const rooms = parseInt(document.getElementById('new-hostel-rooms').value);
    const price = parseInt(document.getElementById('new-hostel-price').value);
    const image = document.getElementById('new-hostel-image').value.trim();
    const amenities = document.getElementById('new-hostel-amenities').value.split(',').map(a => a.trim()).filter(a => a);
    const description = document.getElementById('new-hostel-description').value.trim();

    if (!name || !location || isNaN(rooms) || isNaN(price) || rooms <= 0 || price <= 0 || !image || !description) {
        showNotification('Please fill in all valid hostel details.', 'error');
        return;
    }

    const hostels = getHostels();
    const newId = hostels.length > 0 ? Math.max(...hostels.map(h => h.id)) + 1 : 1;

    const newHostel = {
        id: newId,
        name,
        location,
        description,
        rooms,
        price,
        image,
        amenities
    };

    hostels.push(newHostel);
    setHostels(hostels);
    showNotification(`Hostel "${name}" added successfully!`, 'success');

    // Clear form fields
    document.getElementById('new-hostel-name').value = '';
    document.getElementById('new-hostel-location').value = '';
    document.getElementById('new-hostel-rooms').value = '1';
    document.getElementById('new-hostel-price').value = '100';
    document.getElementById('new-hostel-image').value = '';
    document.getElementById('new-hostel-amenities').value = '';
    document.getElementById('new-hostel-description').value = '';

    // Re-render the admin dashboard to show updates
    renderAdminDashboard();
    renderHostels(); 
}

function removeHostel(id) {
    let hostels = getHostels();
    const originalLength = hostels.length;
    hostels = hostels.filter(h => h.id !== id);

    if (hostels.length < originalLength) {
        setHostels(hostels);
        showNotification('Hostel removed successfully!', 'success');
        renderAdminDashboard(); // Re-render the admin dashboard
        renderHostels(); // Also update the main hostels view
    } else {
        showNotification('Hostel not found.', 'error');
    }
}

function updateHostelRooms(id, newRooms) {
    let hostels = getHostels();
    const hostelIndex = hostels.findIndex(h => h.id === id);

    if (hostelIndex > -1) {
        if (newRooms < 0) {
            showNotification('Rooms cannot be negative.', 'error');
            return;
        }
        hostels[hostelIndex].rooms = newRooms;
        setHostels(hostels);
        showNotification(`Rooms for "${hostels[hostelIndex].name}" updated to ${newRooms}.`, 'success');
        renderAdminDashboard(); // Re-render the admin dashboard
        renderHostels(); // Also update the main hostels view
    } else {
        showNotification('Hostel not found for update.', 'error');
    }
}

// Admin Hostel List Rendering
function renderAdminHostelsList() {
    const hostels = getHostels();
    const adminHostelListDiv = document.getElementById('admin-hostel-list');
    if (!adminHostelListDiv) return; // Safeguard if element not found

    adminHostelListDiv.innerHTML = ''; // Clear previous list

    if (hostels.length === 0) {
        adminHostelListDiv.innerHTML = '<p>No hostels found. Add a new one above!</p>';
        return;
    }

    hostels.forEach(hostel => {
        const hostelCard = document.createElement('div');
        hostelCard.classList.add('form-container'); // Reusing this class for styling
        hostelCard.style.marginBottom = '20px';
        hostelCard.innerHTML = `
            <h3>${hostel.name} <span style="font-size: 0.8em; color: gray;">(ID: ${hostel.id})</span></h3>
            <p>Location: ${hostel.location}</p>
            <p>Price: ₵${hostel.price}/month</p>
            <div class="form-row" style="align-items: center;">
                <div class="form-group" style="margin-bottom: 0; flex: 1;">
                    <label for="rooms-${hostel.id}">Available Rooms:</label>
                    <input type="number" id="rooms-${hostel.id}" class="form-control" value="${hostel.rooms}" min="0">
                </div>
                <div class="form-group" style="margin-bottom: 0; flex: 0 0 auto; margin-left: 10px;">
                    <button class="btn btn-primary update-rooms-btn" data-id="${hostel.id}" data-current-rooms="${hostel.rooms}">Update Rooms</button>
                </div>
            </div>
            <button class="btn btn-danger remove-hostel-btn" data-id="${hostel.id}" style="background-color: #dc3545; margin-top: 10px;">Remove Hostel</button>
        `;
        adminHostelListDiv.appendChild(hostelCard);
    });

    // Attach event listeners for update and remove buttons using event delegation if possible, or directly
    adminHostelListDiv.querySelectorAll('.update-rooms-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            const newRooms = parseInt(document.getElementById(`rooms-${id}`).value);
            updateHostelRooms(id, newRooms);
        });
    });

    adminHostelListDiv.querySelectorAll('.remove-hostel-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            if (confirm('Are you sure you want to remove this hostel? This action cannot be undone.')) {
                removeHostel(id);
            }
        });
    });
}


function renderAdminDashboard() {
  const bookings = getBookings();
  const hostels = getHostels();

  const adminBookings = document.getElementById('admin-bookings');
  if (!adminBookings) return; // Safeguard

  adminBookings.innerHTML = '';

  // --- Update Dashboard Stats ---
  const hostelCountElement = document.getElementById('hostel-count');
  if (hostelCountElement) hostelCountElement.textContent = hostels.length;

  const roomCountElement = document.getElementById('room-count');
  if (roomCountElement) roomCountElement.textContent = hostels.reduce((sum, h) => sum + h.rooms, 0);

  const adminBookingCountElement = document.getElementById('admin-booking-count');
  if (adminBookingCountElement) adminBookingCountElement.textContent = bookings.length;

  // --- Render Hostel Management List ---
  renderAdminHostelsList();

  // --- Render Bookings Table ---
  if (bookings.length === 0) {
      adminBookings.innerHTML = `<tr><td colspan="8">No bookings to display.</td></tr>`;
  } else {
      bookings.forEach(booking => {
        adminBookings.innerHTML += `
          <tr>
            <td>${booking.id}</td>
            <td>${booking.hostel}</td>
            <td>${booking.name}</td>
            <td>${new Date(booking.checkIn).toLocaleDateString()}</td>
            <td>${booking.duration} months</td>
            <td>₵${booking.price.toLocaleString()}</td>
            <td>
              <select class="booking-status" data-id="${booking.id}">
                <option value="Pending" ${booking.status === 'Pending' ? 'selected' : ''}>Pending</option>
                <option value="Approved" ${booking.status === 'Approved' ? 'selected' : ''}>Approved</option>
                <option value="Rejected" ${booking.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                <option value="Paid" ${booking.status === 'Paid' ? 'selected' : ''}>Paid</option>
              </select>
            </td>
            <td>
                <button class="btn btn-sm" onclick="confirmBookingPayment('${booking.id}')" style="background-color:#28a745; color:white; padding: 5px 10px; border-radius: 5px; font-size: 0.8em;">Confirm Payment</button>
            </td>
          </tr>
        `;
      });
  }


  // Add event listeners for status changes
  document.querySelectorAll('.booking-status').forEach(select => {
    select.addEventListener('change', function() {
      const bookingId = this.dataset.id;
      const newStatus = this.value;

      const bookings = getBookings();
      const booking = bookings.find(b => b.id === bookingId);

      if (booking) {
        booking.status = newStatus;
        setBookings(bookings);
        showNotification(`Booking (${bookingId}) status changed to ${newStatus}.`, 'info');

        // Notify user if their booking status changed (if user is logged in and it's their booking)
        if (currentUser && currentUser.email === booking.userEmail) {
          showNotification(`Your booking (${bookingId}) status changed to ${newStatus}`);
        }
      }
    });
  });
}

function confirmBookingPayment(bookingId) {
    let bookings = getBookings();
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex > -1) {
        bookings[bookingIndex].status = 'Paid';
        setBookings(bookings);
        showNotification(`Booking ${bookingId} marked as Paid!`, 'success');
        renderAdminDashboard(); // Re-render to show updated status
        renderMyBookings(); // Update personal bookings view if necessary
    } else {
        showNotification('Booking not found.', 'error');
    }
}


// --- 9. Initialization and Event Listeners (DOMContentLoaded) ---
function init() {
  // Ensure default data exists
  setHostels(getHostels());
  getUsers();

  // Check if user is already logged in
  const user = sessionStorage.getItem('currentUser');
  if (user) {
    currentUser = JSON.parse(user);
    updateUIAfterLogin();
  }
}

document.addEventListener('DOMContentLoaded', function() {
  init(); 

  // Navbar toggle for mobile
  const navbarToggle = document.getElementById('navbar-toggle');
  const navbarLinks = document.getElementById('navbar-links');
  if (navbarToggle && navbarLinks) {
    navbarToggle.addEventListener('click', function() {
      navbarLinks.classList.toggle('open');
      navbarToggle.classList.toggle('active');
    });
  }

  // Admin link click handler
  document.getElementById('admin-link')?.addEventListener('click', function(e) {
    e.preventDefault();
    if (currentUser && currentUser.isAdmin) {
        showView('admin-view');
        renderAdminDashboard(); // Ensure dashboard is re-rendered when navigated to
    } else {
        showNotification('Access Denied. Admins only.', 'error');
        // Optionally redirect to home or login
        showView('home-view');
    }
  });

  // Connect the Add Hostel button
  const addHostelBtn = document.getElementById('add-hostel-btn');
  if (addHostelBtn) {
      addHostelBtn.addEventListener('click', addNewHostel);
  }

  // Book Hostel button on detail view
  const bookHostelBtn = document.getElementById('book-hostel-btn');
  if (bookHostelBtn) bookHostelBtn.addEventListener('click', showBookingForm);

  // Confirm Booking button on booking form view
  const submitBookingBtn = document.getElementById('submit-booking-btn');
  if (submitBookingBtn) submitBookingBtn.addEventListener('click', submitBooking);

  // Download Receipt button
  const downloadReceiptBtn = document.getElementById('download-receipt-btn');
  if (downloadReceiptBtn) downloadReceiptBtn.addEventListener('click', function() {
    if (!currentBooking) {
      showNotification('No booking data to generate receipt.', 'error');
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Hostel Manager Booking Receipt', 105, 20, null, null, 'center');
    doc.setFontSize(12);
    doc.text(`Booking ID: ${currentBooking.id}`, 20, 40);
    doc.text(`Date: ${currentBooking.date}`, 20, 48);
    doc.text(`Payment Reference: ${currentBooking.ref}`, 20, 56);
    doc.text(`Status: ${currentBooking.status}`, 20, 64);
    doc.text(`Hostel: ${currentBooking.hostel}`, 20, 80);
    doc.text(`Duration: ${currentBooking.duration} Months`, 20, 88);
    doc.text(`Check-in Date: ${new Date(currentBooking.checkIn).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, 96);
    doc.text(`Guest: ${currentBooking.name}`, 20, 112);
    doc.text(`Email: ${currentBooking.email}`, 20, 120);
    doc.text(`Phone: ${currentBooking.phone}`, 20, 128);
    doc.text(`Student ID: ${currentBooking.studentId}`, 20, 136);
    doc.text(`Total Amount: ₵${currentBooking.price.toLocaleString()}`, 20, 152);
    doc.text('Payment must be made through (053 345 5248) within 48 hours to confirm booking', 20, 160);
    doc.text('Thank you for choosing Hostel Manager!', 105, 180, null, null, 'center');
    doc.text('Contact: abdulbaasit814@gmail.com', 105, 188, null, null, 'center');
    doc.save(`hostelpro-receipt-${currentBooking.id}.pdf`);
  });

  // New Booking button in receipt view
  const newBookingBtn = document.getElementById('new-booking-btn');
  if (newBookingBtn) {
    newBookingBtn.addEventListener('click', function() {
      currentHostel = null;
      currentBooking = null;
      showView('hostels-view');
      renderHostels();
    });
  }

  // New Booking button in bookings view
  const newBookingBtnBookings = document.getElementById('new-booking-btn-bookings');
  if (newBookingBtnBookings) {
    newBookingBtnBookings.addEventListener('click', function() {
      currentHostel = null;
      currentBooking = null;
      showView('hostels-view');
      renderHostels();
    });
  }

  // Event delegation for Book and Details buttons on hostel cards
  const allHostelsContainer = document.getElementById('all-hostels');
  if (allHostelsContainer) {
    allHostelsContainer.addEventListener('click', function(e) {
      const viewBtn = e.target.closest('.view-hostel-btn');
      const bookBtn = e.target.closest('.book-hostel-btn');
      if (viewBtn) {
        const hostelId = parseInt(viewBtn.dataset.id);
        showHostelDetails(hostelId);
      } else if (bookBtn) {
        if (!currentUser) {
          showNotification('Please log in to book a hostel.', 'error');
          authModal.style.display = 'flex';
          clearAuthForms(); // Clear forms when modal pops up for login prompt
          tabs[0].click(); // Ensure login tab is active
          return;
        }
        const hostelId = parseInt(bookBtn.dataset.id);
        const hostel = getHostels().find(h => h.id === hostelId);
        if (hostel) {
          currentHostel = hostel;
          showBookingForm();
        }
      }
    });
  }

  // Show auth modal on load 
  if (!currentUser) {
    authModal.style.display = 'flex';
    clearAuthForms(); 
    tabs[0].click(); 
  }


  // Tab switching (Login/Signup)
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      if (tab.dataset.tab === 'login') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
      } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
      }
    });
  });

  // Login
  document.getElementById('login-btn').addEventListener('click', function() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      showNotification('Please enter both email and password', 'error');
      return;
    }

    const user = authenticateUser(email, password);
    if (!user) {
      showNotification('Invalid email or password', 'error');
      return;
    }

    saveCurrentUser(user);
    showNotification(`Welcome, ${user.name}!`, 'success');
  });

  // Signup
  document.querySelectorAll('.signup-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const name = document.getElementById('signup-name').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      const confirm = document.getElementById('signup-confirm').value;

      if (!name || !email || !password || !confirm) {
        showNotification('Please fill all fields', 'error');
        return;
      }

      if (password !== confirm) {
        showNotification('Passwords do not match', 'error');
        return;
      }

      const result = registerUser(name, email, password);
      if (!result.success) {
        showNotification(result.message, 'error');
        return;
      }

      showNotification('Registration successful! Please login', 'success');
      tabs[0].click(); // Switch to login tab
      document.getElementById('login-email').value = email; // Keep email after successful signup
      document.getElementById('login-password').value = '';
      document.getElementById('signup-name').value = '';
      document.getElementById('signup-email').value = '';
      document.getElementById('signup-password').value = '';
      document.getElementById('signup-confirm').value = '';
    });
  });
  // Add this new block inside your DOMContentLoaded listener
document.addEventListener('keydown', function(event) {
    // Check if the authentication modal is currently displayed
    if (authModal.style.display === 'flex' && event.key === 'Enter') {
        event.preventDefault(); // Prevent default browser behavior (e.g., submitting a hidden form)

        // Determine which tab is active
        const loginTab = document.querySelector('.tab[data-tab="login"]');
        const signupTab = document.querySelector('.tab[data-tab="signup"]');

        if (loginTab && loginTab.classList.contains('active')) {
            // If login tab is active, click the login button
            document.getElementById('login-btn').click();
        } else if (signupTab && signupTab.classList.contains('active')) {
            // If signup tab is active, click the signup button
            document.querySelector('.signup-btn').click(); // .signup-btn is a class, so querySelector will get the first one
        }
    }
});


  // Navigation: Home, Hostels, My Bookings, Admin links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const target = link.dataset.target;
      if (target === 'hostels') {
        showView('hostels-view');
        renderHostels(); // Ensure hostels are re-rendered
      } else if (target === 'home') {
        showView('home-view');
      } else if (target === 'bookings') {
        if (!currentUser) {
            showNotification('Please login to view your bookings.', 'error');
            authModal.style.display = 'flex';
            clearAuthForms(); // Clear forms when modal pops up for login prompt
            tabs[0].click(); // Ensure login tab is active
            return;
        }
        showView('bookings-view');
        renderMyBookings();
      } else if (target === 'admin') {
        // This is handled by the specific admin-link click handler above for permission checks
        // If we reach here, it implies the link was already shown to an admin.
        if (currentUser && currentUser.isAdmin) {
          showView('admin-view');
          renderAdminDashboard();
        } else {
            showNotification('Access Denied. Admins only.', 'error');
        }
      }

      // Hide mobile nav links after click if open
      if (navbarLinks.classList.contains('open')) {
          navbarLinks.classList.remove('open');
          navbarToggle.classList.remove('active');
      }
    });
  });

  // Explicitly show modal and clear fields when 'Login / Signup' button is clicked
  const authButton = document.getElementById('auth-btn');
  if (authButton) {
      authButton.addEventListener('click', function() {
          clearAuthForms(); // Clear forms before showing the modal
          authModal.style.display = 'flex';
          tabs[0].click(); // Ensure login tab is active
      });
  }

  // Logout
  document.getElementById('logout-btn').addEventListener('click', logout);
});
