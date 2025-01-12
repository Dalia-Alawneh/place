let passwordProgressAlert = $("div[name=\"changePasswordProgressAlert\"]");
let deactivateProgressAlert = $("div[name=\"deactivateAccountProgressAlert\"]");
let enableTOTPAlert = $("div[name=\"enableTOTPAlert\"]");

function setAlert(alert, success = true, text) {
  alert.attr("class", "").addClass(`alert alert-${success ? "success" : "danger"}`).html(`<strong>${success ? "Success!" : "Uh oh!"}</strong> ${text || "An unknown error occurred."}`);
}

$("form#changePasswordForm").submit(function (e) {
  e.preventDefault();
  let oPassword = $(this).find("input[name=\"password\"]").val();
  let nPassword = $(this).find("input[name=\"newPassword\"]").val();
  let nCPassword = $(this).find("input[name=\"newConfPassword\"]").val();
  if (oPassword == "" || nPassword == "" || nCPassword == "") return setAlert(passwordProgressAlert, false, "Please fill out all the fields.");
  if (nPassword !== nCPassword) return setAlert(passwordProgressAlert, false, "The passwords you entered did not match.");

  placeAjax.post("/api/user/change-password", { old: oPassword, new: nPassword }, null).then((response) => {
    window.location.href = "/account?hasNewPassword=true";
  }).catch((err) => setAlert(passwordProgressAlert, false, err ? err.message : null));
});

const passwordField = $("#deactivateAccount").find("input[name=\"password\"]");

$("#deactivateButton").click(function(e) {
  e.preventDefault();
  let password = passwordField.val();
  if (password == "") return setAlert(deactivateProgressAlert, false, "Please enter your password.");
  placeAjax.post("/api/user/deactivate", { password: password }, null).then((response) => {
    window.location.href = "/deactivated";
  }).catch((err) => setAlert(deactivateProgressAlert, false, err ? err.message : null));
});

$("#deleteButton").click(function(e) {
  e.preventDefault();
  let password = passwordField.val();
  if (password == "") return setAlert(deactivateProgressAlert, false, "Please enter your password.");
  placeAjax.delete("/api/user", { password: password }, null).then((response) => {
    window.location.href = "/deleted";
  }).catch((err) => setAlert(deactivateProgressAlert, false, err ? err.message : null));
});

$("#disableTwoFactorAuth").click(function () {
  let elem = $(this).addClass("disabled");
  placeAjax.delete("/api/user/totp-setup", null, "An unknown error occurred while trying to disable two-factor authentication.", () => {
    elem.removeClass("disabled");
  }).then((response) => {
    window.location.reload();
  }).catch(() => { });
});

$("form#enableTOTPForm").submit(function (e) {
  e.preventDefault();
  let submitBtn = $(this).find("button[type=submit]").text("Verifying").addClass("disabled");
  placeAjax.post("/api/user/totp-setup", $(this).serialize(), null, () => {
    submitBtn.text("Verify").removeClass("disabled");
  }).then((response) => {
    window.location.reload();
  }).catch((err) => setAlert(enableTOTPAlert, false, err ? err.message : null));
});

$("#enableTwoFactorAuth").click(function () {
  let elem = $(this).addClass("disabled");
  placeAjax.get("/api/user/totp-setup", null, "An unknown error occurred while trying to load two-factor authentication setup.", () => {
    elem.removeClass("disabled");
  }).then((response) => {
    $("#totpQRCode").attr("src", response.totp.qrData);
    $("#totpSecretCode").text(response.totp.secret);
    $("#totpSecretCodeInput").val(response.totp.secret);
    $("#enableTOTP").modal("show");
  }).catch(() => { });
});

$("#changePassword, #deactivateAccount").on("hidden.bs.modal", function () {
  $(this).find(".alert").attr("class", "").addClass("hidden").text("");
});

$(document).ready(function () {
  $(".timeago").timeago();
});