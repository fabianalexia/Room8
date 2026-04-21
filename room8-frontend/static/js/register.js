document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    
    // Get form inputs - moved outside the submit handler so they're available for all functions
    const firstNameInput = document.getElementById('first_name');
    const lastNameInput = document.getElementById('last_name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    
    // Utility functions for error handling
    const showError = (input, message) => {
        const formGroup = input.closest('.form-group');
        formGroup.classList.add('error');
        const errorElement = formGroup.querySelector('.error-message');
        errorElement.textContent = message;
    };

    const clearError = (input) => {
        const formGroup = input.closest('.form-group');
        formGroup.classList.remove('error');
        const errorElement = formGroup.querySelector('.error-message');
        errorElement.textContent = '';
    };

    // Validation functions
    const validateFirstName = (input) => {
        if (!input.value.trim()) {
            showError(input, 'First name is required');
            return false;
        }
        clearError(input);
        return true;
    };

    const validateLastName = (input) => {
        if (!input.value.trim()) {
            showError(input, 'Last name is required');
            return false;
        }
        clearError(input);
        return true;
    };

    const validateEmail = (input) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!input.value.trim()) {
            showError(input, 'Email is required');
            return false;
        }
        if (!emailRegex.test(input.value)) {
            showError(input, 'Please enter a valid email address');
            return false;
        }
        clearError(input);
        return true;
    };

    const validatePassword = (input) => {
        if (!input.value) {
            showError(input, 'Password is required');
            return false;
        }
        if (input.value.length < 8) {
            showError(input, 'Password must be at least 8 characters long');
            return false;
        }
        clearError(input);
        return true;
    };

    const validateConfirmPassword = (passwordInput, confirmInput) => {
        if (!confirmInput.value) {
            showError(confirmInput, 'Please confirm your password');
            return false;
        }
        if (passwordInput.value !== confirmInput.value) {
            showError(confirmInput, 'Passwords do not match');
            return false;
        }
        clearError(confirmInput);
        return true;
    };

    // Form submission handler
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validate all fields
        const isFirstNameValid = validateFirstName(firstNameInput);
        const isLastNameValid = validateLastName(lastNameInput);
        const isEmailValid = validateEmail(emailInput);
        const isPasswordValid = validatePassword(passwordInput);
        const isConfirmPasswordValid = validateConfirmPassword(passwordInput, confirmPasswordInput);

        // Check if all validations pass
        if (isFirstNameValid && isLastNameValid && isEmailValid && 
            isPasswordValid && isConfirmPasswordValid) {
            // If all validations pass, submit the form
            form.submit();
        }
    });

    // Real-time validation on blur
    firstNameInput.addEventListener('blur', () => validateFirstName(firstNameInput));
    lastNameInput.addEventListener('blur', () => validateLastName(lastNameInput));
    emailInput.addEventListener('blur', () => validateEmail(emailInput));
    passwordInput.addEventListener('blur', () => validatePassword(passwordInput));
    confirmPasswordInput.addEventListener('blur', () => validateConfirmPassword(passwordInput, confirmPasswordInput));
});