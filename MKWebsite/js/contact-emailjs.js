(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const statusEl = document.getElementById('contact-form-status');
  const submitBtn = form.querySelector('button[type="submit"]');

  const setStatus = (kind, message) => {
    if (!statusEl) return;

    statusEl.textContent = message;

    statusEl.classList.remove(
      'text-emerald-700',
      'dark:text-emerald-300',
      'text-red-700',
      'dark:text-red-300',
      'text-slate-600',
      'dark:text-slate-300'
    );

    if (kind === 'success') {
      statusEl.classList.add('text-emerald-700', 'dark:text-emerald-300');
      return;
    }

    if (kind === 'error') {
      statusEl.classList.add('text-red-700', 'dark:text-red-300');
      return;
    }

    statusEl.classList.add('text-slate-600', 'dark:text-slate-300');
  };

  const getConfig = () => {
    const publicKey = (form.dataset.emailjsPublicKey || '').trim();
    const serviceId = (form.dataset.emailjsServiceId || '').trim();
    const templateId = (form.dataset.emailjsTemplateId || '').trim();

    return { publicKey, serviceId, templateId };
  };

  const disableSubmit = (isDisabled) => {
    if (!submitBtn) return;

    submitBtn.disabled = isDisabled;
    submitBtn.classList.toggle('opacity-70', isDisabled);
    submitBtn.classList.toggle('cursor-not-allowed', isDisabled);
  };

  let emailjsInitialized = false;

  const ensureEmailJsInit = (publicKey) => {
    if (emailjsInitialized) return;
    if (!window.emailjs) throw new Error('EmailJS library not loaded');

    window.emailjs.init({ publicKey });
    emailjsInitialized = true;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const honeypot = form.querySelector('input[name="website"]');
    if (honeypot && honeypot.value.trim()) {
      setStatus('error', 'Unable to send message.');
      return;
    }

    const { publicKey, serviceId, templateId } = getConfig();

    if (!publicKey || !serviceId || !templateId) {
      setStatus(
        'error',
        'Email sending is not configured yet. Please set your EmailJS Public Key, Service ID, and Template ID on the form.'
      );
      return;
    }

    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';

    try {
      setStatus('info', 'Sending...');
      disableSubmit(true);

      if (submitBtn) {
        submitBtn.innerHTML = '<span class="material-symbols-outlined">hourglass_top</span> Sending...';
      }

      ensureEmailJsInit(publicKey);
      await window.emailjs.sendForm(serviceId, templateId, form);

      form.reset();
      setStatus('success', 'Message sent successfully. We will get back to you soon.');
    } catch (error) {
      console.error('EmailJS send failed:', error);
      setStatus('error', 'Sorry, something went wrong. Please try again or contact us on WhatsApp.');
    } finally {
      disableSubmit(false);
      if (submitBtn) submitBtn.innerHTML = originalBtnHtml;
    }
  });
})();