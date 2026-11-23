const grid = document.querySelector('#review-grid');
const stars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);
const safe = (value) => String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[char]));
function card(review, fresh = false) {
  return `<article class="review-card${fresh ? ' fresh' : ''}"><div class="stars" aria-label="${review.rating} out of 5 stars">${stars(review.rating)}</div><p class="quote">“${safe(review.text)}”</p><div class="reviewer"><strong>${safe(review.name)}</strong><span>${safe(review.product || 'Dapper Scents')} · ${safe(review.date || 'Just shared')}</span></div></article>`;
}
async function loadReviews() {
  try { const response = await fetch('/.netlify/functions/reviews'); const data = await response.json(); grid.innerHTML = data.map(card).join(''); }
  catch { grid.innerHTML = '<p class="loading">The reviews are resting for a moment. Please check back soon.</p>'; }
}
document.querySelector('#review-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget, status = document.querySelector('#review-status'), button = form.querySelector('button');
  const data = Object.fromEntries(new FormData(form)); button.disabled = true; button.textContent = 'SHARING…'; status.textContent = '';
  try {
    const response = await fetch('/.netlify/functions/reviews', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
    const review = await response.json(); if (!response.ok) throw new Error(review.error);
    grid.insertAdjacentHTML('afterbegin', card(review, true)); form.reset(); form.querySelector('[value="5"]').checked = true; status.textContent = 'Your review is live. Thank you for sharing your light.';
  } catch (error) { status.textContent = error.message || 'We could not share that review yet. Please try again.'; }
  button.disabled = false; button.textContent = 'SHARE MY REVIEW';
});
loadReviews();