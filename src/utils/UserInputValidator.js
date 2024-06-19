const validateInput = (input, type) => {
    if (type === 'date') {
      const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
      return isoDatePattern.test(input);
    } else if (type === 'time') {
      const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
      return timePattern.test(input);
    } else if (type === 'email') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailPattern.test(input);
    } else if (type === 'phone') {
      const phonePattern = /^\d{10,15}$/;
      return phonePattern.test(input);
    } else {
      const alphanumericPattern = /^[a-zA-Z0-9\s]*$/;
      return alphanumericPattern.test(input);
    }
};

export default validateInput;
  