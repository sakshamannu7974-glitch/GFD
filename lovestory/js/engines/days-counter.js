/**
 * "DATE COUNTER... display a beautiful counter... animate beautifully."
 * (brief, Part 4)
 *
 * A real, continuously-ticking "time together" clock -- Years / Months /
 * Days / Hours / Minutes / Seconds -- recalculated every second against
 * the real accepted-proposal date (11 April 2025, from story-data.js)
 * and the visitor's actual current time. This is calendar-accurate (not
 * a rough "divide by 365" estimate), so it's correct whether the page is
 * opened today or five years from now -- there is no fixed number
 * anywhere; every value is derived live from `new Date()`.
 */

function breakdown(since, now) {
  const diffMs = Math.max(0, now.getTime() - since.getTime());
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let years = now.getFullYear() - since.getFullYear();
  let months = now.getMonth() - since.getMonth();
  let days = now.getDate() - since.getDate();
  let hours = now.getHours() - since.getHours();
  let minutes = now.getMinutes() - since.getMinutes();
  let seconds = now.getSeconds() - since.getSeconds();

  if (seconds < 0) { seconds += 60; minutes -= 1; }
  if (minutes < 0) { minutes += 60; hours -= 1; }
  if (hours < 0) { hours += 24; days -= 1; }
  if (days < 0) {
    const daysInPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += daysInPrevMonth;
    months -= 1;
  }
  if (months < 0) { months += 12; years -= 1; }

  return { totalDays, years, months, days, hours, minutes, seconds };
}

export function initDaysCounter() {
  const counters = document.querySelectorAll('.days-counter');
  if (!counters.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  counters.forEach((counter) => {
    const sinceStr = counter.dataset.since;
    if (!sinceStr) return;
    const since = new Date(sinceStr);

    const units = {
      totalDays: counter.querySelector('[data-unit="totalDays"]'),
      years: counter.querySelector('[data-unit="years"]'),
      months: counter.querySelector('[data-unit="months"]'),
      days: counter.querySelector('[data-unit="days"]'),
      hours: counter.querySelector('[data-unit="hours"]'),
      minutes: counter.querySelector('[data-unit="minutes"]'),
      seconds: counter.querySelector('[data-unit="seconds"]'),
    };

    function render() {
      const b = breakdown(since, new Date());
      if (units.totalDays) units.totalDays.textContent = String(b.totalDays);
      if (units.years) units.years.textContent = String(b.years);
      if (units.months) units.months.textContent = String(b.months);
      if (units.days) units.days.textContent = String(b.days);
      if (units.hours) units.hours.textContent = String(b.hours).padStart(2, '0');
      if (units.minutes) units.minutes.textContent = String(b.minutes).padStart(2, '0');
      if (units.seconds) units.seconds.textContent = String(b.seconds).padStart(2, '0');
    }

    let intervalId = null;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            render();
            if (!prefersReducedMotion && !intervalId) {
              intervalId = setInterval(render, 1000);
            }
          } else if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(counter);
  });
}
