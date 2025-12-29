// HTML хуудас бүрэн ачаалагдсаны дараа кодыг ажиллуулна
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  const result = document.getElementById("contact-result");
  const clearBtn = document.getElementById("clear-btn");
// Мессеж харуулах функц
  function showResult(message, isError = false) {
    result.className = "contact-result " + (isError ? "error" : "success");
    result.textContent = message;
    setTimeout(() => {
      result.className = "contact-result";
      result.textContent = "";
    }, 4000);
  }
// Имэйл хаяг шалгах функц
  function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const subject = form.subject.value.trim() || "Сайт-аас ирсэн мессеж";
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      showResult("Анхаар! Утга шаардлагатай талбаруудыг бөглөнө үү.", true);
      return;
    }

    if (!validEmail(email)) {
      showResult("Имэйл хаяг буруу байна.", true);
      return;
    }

    // Save copy locally (optional)
    const payload = { name, email, subject, message, time: Date.now() };
    try {
      localStorage.setItem("lastContact", JSON.stringify(payload));
    } catch (err) {
      /* ignore */
    }

    // Try mailto fallback (opens user's mail client)
    const mailto = `mailto:info@example.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(
      `Нэр: ${name}\nИмэйл: ${email}\n\n${message}`
    )}`;
    showResult(
      "Баярлалаа! Мессеж амжилттай илгээгдлээ. (Mail client-н сонголт нээгдэж байна)",
      false
    );

    // Small delay so the message is readable before redirecting to mail client
    setTimeout(() => {
      window.location.href = mailto;
    }, 800);
  });

  clearBtn.addEventListener("click", () => {
    form.reset();
    showResult("Маягт цэвэрлэгдлээ.");
  });
});
