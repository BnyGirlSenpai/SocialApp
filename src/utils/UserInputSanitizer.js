const sanitizeInput = (input) => {
  const sanitizedInput = input.replace(/[^a-zA-Z0-9\s]/g, ''); 
  return sanitizedInput.trim(); 
};

export default sanitizeInput;
