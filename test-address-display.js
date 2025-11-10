// Test different address formats for order confirmation page
const testOrderData = [
  {
    id: "test1",
    name: "Order with string address",
    order: {
      id: "1",
      deliveryAddress: "123 Main Street, Bangalore, Karnataka 560001, India",
      customerName: "John Doe",
      phone: "9876543210",
      email: "john@example.com",
      total: 1500,
      subtotal: 1400,
      items: [],
      status: "confirmed",
      createdAt: "2025-11-08T10:00:00Z"
    }
  },
  {
    id: "test2", 
    name: "Order with empty address",
    order: {
      id: "2",
      deliveryAddress: "",
      customerName: "Jane Smith",
      phone: "9876543211",
      email: "jane@example.com", 
      total: 2000,
      subtotal: 1900,
      items: [],
      status: "pending",
      createdAt: "2025-11-08T11:00:00Z"
    }
  },
  {
    id: "test3",
    name: "Order with address object fallback",
    order: {
      id: "3",
      deliveryAddress: null,
      address: {
        fullName: "Bob Wilson",
        addressLine1: "456 Garden Road",
        addressLine2: "Apt 2B",
        city: "Mumbai",
        state: "Maharashtra", 
        postalCode: "400001",
        country: "India"
      },
      customerName: "Bob Wilson",
      phone: "9876543212",
      email: "bob@example.com",
      total: 1200,
      subtotal: 1100, 
      items: [],
      status: "processing",
      createdAt: "2025-11-08T12:00:00Z"
    }
  }
];

// Simulate the address display logic
function testAddressDisplay(order) {
  // First check the standard deliveryAddress field
  if (order.deliveryAddress && order.deliveryAddress.trim()) {
    return order.deliveryAddress;
  }

  // Fallback to other potential address fields
  const addr = order?.address || order?.user?.address || order?.userAddress || order?.customerAddress;

  if (!addr) return 'No delivery address specified';

  if (typeof addr === 'string' && addr.trim()) return addr;

  // Try to format address object
  if (typeof addr === 'object') {
    const parts = [];
    if (addr.fullName || addr.name) parts.push(addr.fullName || addr.name);
    if (addr.addressLine1 || addr.line1) parts.push(addr.addressLine1 || addr.line1);
    if (addr.addressLine2 || addr.line2) parts.push(addr.addressLine2 || addr.line2);
    if (addr.landmark) parts.push(addr.landmark);
    if (addr.locality) parts.push(addr.locality);
    if (addr.city) parts.push(addr.city);
    if (addr.state) parts.push(addr.state);
    if (addr.postalCode || addr.pincode) parts.push(addr.postalCode || addr.pincode);
    if (addr.country) parts.push(addr.country);

    if (parts.length > 0) return parts.join(', ');
  }

  return 'No delivery address specified';
}

// Run tests
console.log('Testing address display logic:');
console.log('================================');

testOrderData.forEach(test => {
  console.log(`\n${test.name}:`);
  console.log(`Result: "${testAddressDisplay(test.order)}"`);
});