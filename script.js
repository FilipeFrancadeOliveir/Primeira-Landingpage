const root = document.documentElement;
const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const themeButton = document.querySelector('.theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const savedTheme = localStorage.getItem('techsolutions-theme');
if (savedTheme) root.dataset.theme = savedTheme;

function updateThemeIcon() {
  themeIcon.textContent = root.dataset.theme === 'dark' ? '☼' : '◐';
}
updateThemeIcon();

themeButton.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('techsolutions-theme', root.dataset.theme);
  updateThemeIcon();
});

menuButton.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  });
});

window.addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 24), { passive: true });

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

const sections = [...document.querySelectorAll('main section[id]')];
const menuLinks = [...document.querySelectorAll('.nav-links a')];
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    menuLinks.forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -55%' });
sections.forEach(section => sectionObserver.observe(section));

document.querySelectorAll('.filter').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    document.querySelectorAll('.project-card').forEach(card => {
      card.classList.toggle('hidden', button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter);
    });
  });
});

if (!reduceMotion && matchMedia('(pointer:fine)').matches) {
  const glow = document.querySelector('.cursor-glow');
  window.addEventListener('pointermove', event => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  }, { passive: true });
}

document.querySelector('[data-contact-form]').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = form.querySelector('.form-status');
  const fields = [...form.querySelectorAll('[required]')];
  fields.forEach(field => field.classList.toggle('invalid', !field.checkValidity()));

  if (!form.checkValidity()) {
    status.textContent = 'Confira os campos destacados antes de continuar.';
    fields.find(field => !field.checkValidity())?.focus();
    return;
  }

  const data = new FormData(form);
  const text = [
    'Olá, Filipe! Vi o projeto TechSolutions e gostaria de conversar.',
    '',
    `Nome: ${data.get('name')}`,
    `E-mail: ${data.get('email')}`,
    `Tipo de projeto: ${data.get('project')}`,
    `Contexto: ${data.get('message')}`
  ].join('\n');

  status.textContent = 'Abrindo o WhatsApp com sua mensagem…';
  window.open(`https://wa.me/5561992087470?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
});

document.querySelectorAll('input, select, textarea').forEach(field => {
  field.addEventListener('input', () => field.classList.remove('invalid'));
});

document.querySelector('[data-year]').textContent = new Date().getFullYear();
