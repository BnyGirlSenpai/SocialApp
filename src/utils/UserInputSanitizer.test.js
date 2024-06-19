import sanitizeInput from './UserInputSanitizer';

describe('sanitizeInput', () => {
  it('should remove non-alphanumeric characters except spaces', () => {
    expect(sanitizeInput('Hello@World!')).toBe('HelloWorld');
    expect(sanitizeInput('Hello World!')).toBe('Hello World');
  });

  it('should trim leading and trailing spaces', () => {
    expect(sanitizeInput('  Hello World  ')).toBe('Hello World');
  });

  it('should handle empty strings', () => {
    expect(sanitizeInput('')).toBe('');
  });

  it('should handle strings with only special characters', () => {
    expect(sanitizeInput('@#$%^&*()')).toBe('');
  });

  it('should handle strings with mixed alphanumeric and special characters', () => {
    expect(sanitizeInput('Hello123!@#')).toBe('Hello123');
  });

  it('should handle strings with spaces and special characters', () => {
    expect(sanitizeInput('  Hello 123 !@# ')).toBe('Hello 123');
  });
});
