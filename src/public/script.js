const API = "http://localhost:4000/api";
const stripe = Stripe(
  "pk_test_51SwLUlDL9ZUUPRCuQSfbL3Xslxo70jMNC6rqWyFbGDbw8P2yd6418oAf53ZcWS5ycZVvxhcU9anYjr8x2Ly1zYPK00dvgP2FLv",
);

// ================= LOGIN =================

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert("User not registered. Please signup.");
    return;
  }

  localStorage.setItem("token", data.data.token);
  localStorage.setItem("role", data.data.role);
  window.location.href = "products.html";
}

// ================= REGISTER =================

async function register() {
  const body = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    role: document.getElementById("role").value,
  };

  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message);
    return;
  }

  alert("Account Created!");
  window.location.href = "index.html";
}

// ================= LOAD PRODUCTS =================

async function loadProducts() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  // hide add button for USER
  if (role !== "admin") {
    document.getElementById("addBtn").style.display = "none";
  }

  const res = await fetch(`${API}/product`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  const container = document.getElementById("productList");

  container.innerHTML = "";

  data.data.forEach((p) => {
    container.innerHTML += `
      <div class="product-card">
      <img 
          src="${p.imageUrl}" 
          alt="${p.name}"
        />
        <h3>${p.name}</h3>
        <p><b>Price:</b> ₹${p.price}</p>
        ${`<button onclick="buyProduct('${p._id}')">Buy</button>`}
      </div>
    `;
  });
}

// ================= ADD PRODUCT PAGE =================

function goAddProduct() {
  window.location.href = "addProduct.html";
}

// ================= CREATE PRODUCT =================

async function createProduct() {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("name", document.getElementById("name").value);
  formData.append("price", document.getElementById("price").value);
  formData.append("stock", document.getElementById("stock").value);
  formData.append("category", document.getElementById("category").value);
  formData.append("description", document.getElementById("description").value);
  formData.append("image", document.getElementById("image").files[0]);

  const res = await fetch(`${API}/product/addProduct`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    alert("Product not added");

    return;
  }

  alert("Product Created!");
  window.location.href = "products.html";
}

// ================= BUY PRODUCT =================

let elements;
let card;
let clientSecret;
let activePaymentMethodType = null;
let terminal;
let terminalReady = false;

function isPaymentPage() {
  return window.location.pathname.endsWith("/payment.html");
}

function updateSwipeStatus(message) {
  const statusElement = document.getElementById("swipeStatus");

  if (statusElement) {
    statusElement.textContent = message;
  }
}

function getSwipeCardDetails() {
  const cardNumber = document
    .getElementById("cardNumber")
    ?.value.replace(/\s+/g, "");
  const expMonth = document.getElementById("expMonth")?.value.trim();
  const expYear = document.getElementById("expYear")?.value.trim();
  const cvc = document.getElementById("cvc")?.value.trim();

  return {
    cardNumber,
    expMonth,
    expYear,
    cvc,
  };
}

async function showCard() {
  try {
    document.getElementById("cardSection").style.display = "block";
    const swipeSection = document.getElementById("swipeSection");

    if (swipeSection) {
      swipeSection.style.display = "none";
    }

    if (!card) {
      elements = stripe.elements();
      card = elements.create("card");
      card.mount("#card-element");
    }

    if (activePaymentMethodType !== "card") {
      await createIntent("card");
    }
  } catch (error) {
    alert(error.message);
  }
}
function buyProduct(productId) {
  localStorage.setItem("productId", productId);

  window.location.href = "payment.html";
}

async function createIntent(paymentMethodType = "card") {
  const token = localStorage.getItem("token");
  const productId = localStorage.getItem("productId");

  if (!token || !productId) {
    throw new Error("Missing login session or selected product.");
  }

  const res = await fetch(`${API}/payment/create-payment-intent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      productId,
      paymentMethodType,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Unable to create payment intent.");
  }

  clientSecret = data.data.clientSecret;
  activePaymentMethodType = data.data.paymentMethodType;
  return data.data;
}

async function pay() {
  try {
    if (!card) {
      alert("Open the online card payment form first.");
      return;
    }

    if (activePaymentMethodType !== "card" || !clientSecret) {
      await createIntent("card");
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: card,
      },
    });

    if (result.error) {
      alert(result.error.message);
    } else {
      if (result.paymentIntent.status === "succeeded") {
        alert("Payment Successful ✅");

        window.location.href = "products.html";
      }
    }
  } catch (error) {
    alert(error.message);
  }
}

async function fetchConnectionToken() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API}/payment/connection-token`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Unable to fetch connection token.");
  }

  return data.data.secret;
}

function getTerminal() {
  if (!window.StripeTerminal) {
    throw new Error("Stripe Terminal SDK failed to load.");
  }

  if (!terminal) {
    terminal = StripeTerminal.create({
      onFetchConnectionToken: fetchConnectionToken,
      onUnexpectedReaderDisconnect: () => {
        terminalReady = false;
        updateSwipeStatus(
          "Reader disconnected. Click Swipe Card to reconnect.",
        );
      },
      onConnectionStatusChange: () => {
        const status = terminal.getConnectionStatus();
        updateSwipeStatus(`Reader status: ${status}`);
      },
      onPaymentStatusChange: () => {
        const status = terminal.getPaymentStatus();

        if (status !== "not_ready") {
          updateSwipeStatus(`Payment status: ${status}`);
        }
      },
    });
  }

  return terminal;
}

async function ensureTerminalConnected() {
  const terminalInstance = getTerminal();

  if (terminalReady && terminalInstance.getConnectionStatus() === "connected") {
    return terminalInstance;
  }

  updateSwipeStatus("Searching for Stripe simulated readers...");
  const discoverResult = await terminalInstance.discoverReaders({
    simulated: true,
  });

  if (discoverResult.error) {
    throw new Error(discoverResult.error.message);
  }

  if (!discoverResult.discoveredReaders.length) {
    throw new Error("No simulated Stripe readers were found.");
  }

  const connectResult = await terminalInstance.connectReader(
    discoverResult.discoveredReaders[0],
  );

  if (connectResult.error) {
    throw new Error(connectResult.error.message);
  }

  terminalReady = true;
  updateSwipeStatus(
    `Connected to ${connectResult.reader.label || "simulated reader"}.`,
  );

  return terminalInstance;
}

async function showSwipe() {
  const cardSection = document.getElementById("cardSection");
  const swipeSection = document.getElementById("swipeSection");

  if (cardSection) {
    cardSection.style.display = "none";
  }

  if (swipeSection) {
    swipeSection.style.display = "block";
  }

  try {
    await ensureTerminalConnected();
    updateSwipeStatus(
      "Reader connected. Enter a test card number, then click Swipe & Pay.",
    );
  } catch (error) {
    console.error("Swipe payment error:", error);
    updateSwipeStatus(error.message);
    alert(error.message);
  }
}

async function mockSwipePay() {
  try {
    const { cardNumber, expMonth, expYear, cvc } = getSwipeCardDetails();

    if (!cardNumber || !expMonth || !expYear || !cvc) {
      alert("Enter card number, expiry month, expiry year, and CVC.");
      return;
    }

    if (!/^\d{13,19}$/.test(cardNumber)) {
      alert("Enter a valid Stripe test card number.");
      return;
    }

    const terminalInstance = await ensureTerminalConnected();
    terminalInstance.setSimulatorConfiguration({
      testCardNumber: cardNumber,
    });

    const paymentIntentData = await createIntent("card_present");

    updateSwipeStatus("Waiting for simulated swipe...");
    const collectResult = await terminalInstance.collectPaymentMethod(
      paymentIntentData.clientSecret,
    );

    if (collectResult.error) {
      throw new Error(collectResult.error.message);
    }

    updateSwipeStatus("Card captured. Processing swipe payment...");
    const processResult = await terminalInstance.processPayment(
      collectResult.paymentIntent,
    );

    if (processResult.error) {
      throw new Error(processResult.error.message);
    }

    updateSwipeStatus("Swipe payment successful.");
    alert("Swipe card payment successful ✅");
    window.location.href = "products.html";
  } catch (error) {
    console.error("Swipe payment error:", error);
    updateSwipeStatus(error.message);
    alert(error.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!isPaymentPage()) {
    return;
  }

  if (!localStorage.getItem("token")) {
    window.location.href = "index.html";
    return;
  }

  updateSwipeStatus('Click "Swipe Card" to connect the Stripe test reader.');
});
