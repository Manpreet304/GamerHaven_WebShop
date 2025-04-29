function bindAccountUIEvents() {
    $("#edit-account-btn").click(openAccountEditForm);
    $("#add-payment-method-btn").click(openAddPaymentMethodForm);
  
    $(document).on("submit", "#edit-account-form", function (e) {
      e.preventDefault();
      if (!this.checkValidity()) {
        this.classList.add("was-validated");
        return;
      }
      updateAccountInfo();
    });
  
    $(document).on("submit", "#add-payment-method-form", function (e) {
      e.preventDefault();
      if (!this.checkValidity()) {
        this.classList.add("was-validated");
        return;
      }
      addPaymentMethod();
    });
  
    $(document).on("change", "#new-payment-method", renderPaymentFields);
  
    $(document).on("submit", "#change-password-form", function (e) {
      e.preventDefault();
      if (!this.checkValidity()) {
        this.classList.add("was-validated");
        return;
      }
      changePassword();
    });
  }
  