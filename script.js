const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-button');
const menu = document.querySelector('.menu');
const form = document.querySelector('[data-booking-form]');
const dateInput = form.elements.date;

window.addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 30), { passive: true });

menuButton.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.querySelector('b').textContent = open ? 'Fechar menu' : 'Abrir menu';
});

document.querySelectorAll('.menu a').forEach(link => link.addEventListener('click', () => {
  menu.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) {
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(item => observer.observe(item));

const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  document.querySelectorAll('.menu a').forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
}), { rootMargin: '-35% 0px -58%' });
document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
dateInput.min = tomorrow.toISOString().split('T')[0];

const weekBoard = document.querySelector('[data-week-board]');
const weekDays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const weekSlots = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

function localISO(date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().split('T')[0];
}

for (let dayOffset = 1; dayOffset <= 7 && weekBoard.children.length < 6; dayOffset++) {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  if (date.getDay() === 0) continue;
  const iso = localISO(date);
  const column = document.createElement('div');
  column.className = 'day-column';
  const slots = weekSlots.map((time, index) => {
    const busy = (date.getDate() + index * 2) % 5 === 0 || (date.getDay() === 6 && index > 5);
    return `<button class="time-slot" type="button" data-date="${iso}" data-time="${time}" ${busy ? 'disabled aria-label="Horário ocupado"' : ''}>${time}</button>`;
  }).join('');
  column.innerHTML = `<div class="day-head"><b>${weekDays[date.getDay()]}</b><span>${String(date.getDate()).padStart(2, '0')}</span></div><div class="time-slots">${slots}</div>`;
  weekBoard.appendChild(column);
}

weekBoard.addEventListener('click', event => {
  const slot = event.target.closest('.time-slot:not(:disabled)');
  if (!slot) return;
  weekBoard.querySelectorAll('.time-slot').forEach(item => item.classList.remove('selected'));
  slot.classList.add('selected');
  dateInput.value = slot.dataset.date;
  form.elements.time.value = slot.dataset.time;
  document.querySelector('#agenda').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => form.querySelector('input[name="service"]:checked')?.focus(), 600);
});

function updateSummary() {
  const selected = form.querySelector('input[name="service"]:checked');
  const [name = 'Nenhum', price = '0'] = selected ? selected.value.split('|') : [];
  document.querySelector('[data-summary-service]').textContent = name;
  document.querySelector('[data-summary-price]').textContent = `R$ ${price}`;
}

form.querySelectorAll('input[name="service"]').forEach(input => input.addEventListener('change', updateSummary));

document.querySelectorAll('.select-service').forEach(button => button.addEventListener('click', () => {
  const card = button.closest('.service');
  const wanted = `${card.dataset.service}|${card.dataset.price}|${card.dataset.duration}`;
  const option = [...form.querySelectorAll('input[name="service"]')].find(input => input.value === wanted);
  if (option) {
    option.checked = true;
    updateSummary();
  }
  document.querySelector('#agenda').scrollIntoView({ behavior: 'smooth' });
}));

const phone = form.elements.phone;
phone.addEventListener('input', () => {
  let value = phone.value.replace(/\D/g, '').slice(0, 11);
  if (value.length > 6) value = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
  else if (value.length > 2) value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
  phone.value = value;
});

form.addEventListener('submit', event => {
  event.preventDefault();
  const status = form.querySelector('.form-status');
  [...form.querySelectorAll('[required]')].forEach(field => field.classList.toggle('invalid', !field.checkValidity()));
  if (!form.checkValidity()) {
    status.textContent = 'Preencha todos os campos destacados para continuar.';
    form.querySelector('[required]:invalid')?.focus();
    return;
  }

  const data = new FormData(form);
  const [service, price, duration] = data.get('service').split('|');
  const formattedDate = new Date(`${data.get('date')}T12:00:00`).toLocaleDateString('pt-BR');
  const message = [
    'Olá! Gostaria de solicitar um agendamento na Driving Cut.', '',
    `Cliente: ${data.get('name')}`,
    `Telefone: ${data.get('phone')}`,
    `Serviço: ${service}`,
    `Valor informado: R$ ${price}`,
    `Duração estimada: ${duration} min`,
    `Data: ${formattedDate}`,
    `Horário: ${data.get('time')}`,
    `Endereço: ${data.get('address')}`, '',
    'Aguardo a confirmação do horário.'
  ].join('\n');

  status.textContent = 'Abrindo o WhatsApp para confirmar seu pedido…';
  window.open(`https://wa.me/5561992087470?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
});

form.querySelectorAll('input,select').forEach(field => field.addEventListener('input', () => {
  field.classList.remove('invalid');
  form.querySelector('.form-status').textContent = '';
}));

document.querySelector('[data-year]').textContent = new Date().getFullYear();
