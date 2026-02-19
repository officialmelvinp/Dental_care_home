const generateReceiptNumber = () => {
  return `RCPT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const generateReference = () => {
  return `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

module.exports = {
  generateReceiptNumber,
  generateReference,
};
