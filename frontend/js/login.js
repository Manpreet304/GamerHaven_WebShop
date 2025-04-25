// login.js

$(document).ready(function () {
    $("#loginForm").on("submit", function (e) {
      e.preventDefault();
  
      const form = this;
      form.classList.remove("was-validated");
  
      $("#loginForm input").each(function () {
        $(this).removeClass("is-valid is-invalid")[0].setCustomValidity("");
      });
  
      const data = {
        identifier: $("#identifier").val(),
        password: $("#password").val(),
        remember: $("#rememberMe").is(":checked")
      };
  
      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
      }
  
      $.ajax({
        url: "../../backend/api/ApiGuest.php?login",
        method: "POST",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: res => handleResponse(res, {
          successMessage: "Login successful! Redirecting...",
          onSuccess: () => setTimeout(() => {
            window.location.href = "../website/homepage.html";
          }, 2000)
        }),
        error: xhr => handleResponse(xhr.responseJSON || {}, {
          errorMessage: "Login failed.",
          formSelector: "#loginForm",
          showValidation: true
        })
      });
    });
  
    $('[data-bs-toggle="tooltip"]').each((_, el) => new bootstrap.Tooltip(el));
  });
  