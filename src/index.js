import './sass/main.scss';
import canvasDots from './canvas/heroCanvas';
import canvasDotsBg from './canvas/bgCanvas';

const CONTACT_EMAIL = 'Andre.E.Sanabria.G@gmail.com';
const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

function initCanvases() {
  canvasDotsBg();
  canvasDots();
}

function initAboutAnimation() {
  const aboutContent = document.querySelector('.about__content');
  const profile = document.querySelector('.profile');
  const skillItems = document.querySelectorAll('.skills__item');

  if (!aboutContent || !profile || !skillItems.length) return;

  const revealSkills = () => {
    skillItems.forEach((item, index) => {
      window.setTimeout(() => {
        item.classList.add('skills__item-fade-in');
      }, 500 + index * 70);
    });
  };

  if (!('IntersectionObserver' in window) || document.body.scrollWidth <= 1300) {
    profile.classList.add('profile__fade-in');
    revealSkills();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;

      profile.classList.add('profile__fade-in');
      revealSkills();
      observer.disconnect();
    },
    { threshold: 0.5 }
  );

  observer.observe(aboutContent);
}

function initNavigation() {
  const navLinks = Array.from(document.querySelectorAll('.navigation__item'));
  const sections = ['hero', 'about', 'projects', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (!navLinks.length || !sections.length || !('IntersectionObserver' in window)) {
    return;
  }

  const setActiveNav = (sectionId) => {
    navLinks.forEach((link) => {
      link.classList.toggle('navigation__item--active', link.id === `nav-${sectionId}`);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleSection = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

      if (visibleSection?.target?.id) {
        setActiveNav(visibleSection.target.id);
      }
    },
    {
      rootMargin: '-25% 0px -45% 0px',
      threshold: [0.15, 0.35, 0.6],
    }
  );

  sections.forEach((section) => observer.observe(section));
}

function showValidation(input, error, isInvalid) {
  input.classList.toggle('input-error', isInvalid);
  error.style.display = isInvalid ? 'block' : 'none';
}

function initContactForm() {
  const form = document.querySelector('.contact__form');
  const nameInput = document.querySelector('.contact__form-name');
  const emailInput = document.querySelector('.contact__form-email');
  const messageInput = document.querySelector('.contact__form-message');
  const nameError = document.querySelector('.form-error__name');
  const emailError = document.querySelector('.form-error__email');
  const messageError = document.querySelector('.form-error__msg');

  if (
    !form ||
    !nameInput ||
    !emailInput ||
    !messageInput ||
    !nameError ||
    !emailError ||
    !messageError
  ) {
    return;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    const isNameInvalid = !name;
    const isEmailInvalid = !EMAIL_REGEX.test(email);
    const isMessageInvalid = !message;

    showValidation(nameInput, nameError, isNameInvalid);
    showValidation(emailInput, emailError, isEmailInvalid);
    showValidation(messageInput, messageError, isMessageInvalid);

    if (isNameInvalid || isEmailInvalid || isMessageInvalid) return;

    const subject = encodeURIComponent(`Website contact from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    window.setTimeout(() => form.reset(), 500);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initCanvases();
  initAboutAnimation();
  initNavigation();
  initContactForm();
});
