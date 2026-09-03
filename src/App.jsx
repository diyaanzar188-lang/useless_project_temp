import React, { useEffect, useMemo, useState } from 'react'

const rupees = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

function getRegretScore({ price, savings, category, reason, onSale, emi }) {
  const ratio = savings > 0 ? price / savings : 1
  let score = Math.min(55, Math.round(ratio * 100))
  if (price >= 5000) score += 8
  if (category === 'Impulse') score += 18
  if (category === 'Luxury') score += 10
  if (onSale) score -= 8
  if (emi) score += 14
  if (/because|want|cool|bored|instagram|trend|deserve/i.test(reason)) score += 10
  if (reason.trim().length > 0 && reason.trim().length < 12) score += 5
  return Math.max(1, Math.min(100, score))
}

function scoreMood(score) {
  if (score >= 76) return { title: 'Wallet funeral incoming', emoji: '🪦' }
  if (score >= 51) return { title: 'Proceed with dramatic caution', emoji: '😬' }
  if (score >= 26) return { title: 'Mildly questionable', emoji: '🤨' }
  return { title: 'Surprisingly chill', emoji: '😌' }
}

function App() {
  const [savingsInput, setSavingsInput] = useState(() => localStorage.getItem('regretify-savings') || '')
  const [savings, setSavings] = useState(() => Number(localStorage.getItem('regretify-savings')) || 0)
  const [purchase, setPurchase] = useState(null)
  const [form, setForm] = useState({ product: '', price: '', category: '', reason: '', onSale: false, emi: false })

  useEffect(() => { if (savings > 0) localStorage.setItem('regretify-savings', String(savings)) }, [savings])

  const calculation = useMemo(() => {
    if (!purchase) return null
    const consumed = savings > 0 ? (purchase.price / savings) * 100 : 0
    const remaining = savings - purchase.price
    const score = getRegretScore({ ...purchase, savings })
    return { consumed, remaining, score, mood: scoreMood(score) }
  }, [purchase, savings])

  function saveSavings(event) {
    event.preventDefault()
    const amount = Number(savingsInput)
    if (amount > 0) setSavings(amount)
  }

  function updateForm(event) {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  function submitPurchase(event) {
    event.preventDefault()
    const price = Number(form.price)
    if (!form.product.trim() || price <= 0) return
    setPurchase({ ...form, product: form.product.trim(), price })
  }

  return <main className="app-shell" id="top">
    <header className="topbar">
      <a className="brand" href="#top" aria-label="Regretify home">REGRETIFY<span>™</span></a>
      <p className="edition">The spending issue &mdash; no. 001</p>
      <a className="nav-link" href="#confess">Calculate regret <span>↘</span></a>
    </header>

    <section className="hero">
      <div className="hero-copy">
        <p className="kicker">An entirely emotional purchase review</p>
        <h1>Before you <em>buy it,</em><br />read the room.</h1>
        <p className="hero-summary">A delightfully unqualified perspective on the things you want, the money you have, and the person you become after checkout.</p>
      </div>
      <aside className="reaction-placeholder hero-placeholder" aria-label="Future reaction image placeholder">
        <span>Future reaction image</span>
        <strong>THE FACE<br />OF A BAD IDEA</strong>
        <i>— coming soon</i>
      </aside>
    </section>

    <section className="calculator-section" id="confess" aria-labelledby="confession-heading">
      <div className="section-intro">
        <p className="kicker">The regret calculator</p>
        <h2 id="confession-heading">A small moment of<br /><em>honesty.</em></h2>
        <p>Give us the details. We’ll give your inner voice a surprisingly elegant microphone.</p>
      </div>

      <div className="calculator-grid">
        <section className="savings-card" aria-labelledby="savings-heading">
          <div className="card-topline"><span>01 / YOUR BASELINE</span><span>Private by design</span></div>
          <h3 id="savings-heading">What’s in the vault?</h3>
          <form onSubmit={saveSavings} className="savings-form">
            <label htmlFor="savings">Current savings</label>
            <div className="money-input"><span>₹</span><input id="savings" type="number" min="0" inputMode="decimal" placeholder="20,000" value={savingsInput} onChange={(event) => setSavingsInput(event.target.value)} /></div>
            <button type="submit" className="text-button">Save this number <span>→</span></button>
          </form>
          <p className="saved-value">{savings > 0 ? `Currently guarding ${rupees.format(savings)}` : 'Add a number so we can judge responsibly.'}</p>
        </section>

        <section className="purchase-card" aria-labelledby="purchase-heading">
          <div className="card-topline"><span>02 / THE TEMPTATION</span><span>Be brave</span></div>
          <h3 id="purchase-heading">Confess the purchase.</h3>
          <form onSubmit={submitPurchase} className="purchase-form">
            <label htmlFor="product">What are you buying?</label>
            <input id="product" name="product" placeholder="Gaming headphones" value={form.product} onChange={updateForm} required />
            <div className="form-grid"><div><label htmlFor="price">The damage</label><div className="money-input"><span>₹</span><input id="price" name="price" type="number" min="1" inputMode="decimal" placeholder="8,000" value={form.price} onChange={updateForm} required /></div></div><div><label htmlFor="category">Its personality <small>optional</small></label><select id="category" name="category" value={form.category} onChange={updateForm}><option value="">Pick a vibe</option><option>Essential</option><option>Fun</option><option>Luxury</option><option value="Impulse">Impulse</option></select></div></div>
            <label htmlFor="reason">Make your case <small>optional</small></label>
            <textarea id="reason" name="reason" rows="3" placeholder="It will change my life, probably." value={form.reason} onChange={updateForm} />
            <div className="toggles"><label className="toggle"><input name="onSale" type="checkbox" checked={form.onSale} onChange={updateForm} /><span className="switch" />It was on sale</label><label className="toggle"><input name="emi" type="checkbox" checked={form.emi} onChange={updateForm} /><span className="switch" />I’m using EMI</label></div>
            <button type="submit" className="primary-button">Give me the verdict <span>→</span></button>
          </form>
        </section>
      </div>
    </section>

    {calculation && <section className="result-panel" aria-live="polite">
      <div className="result-visual reaction-placeholder" aria-label="Future reaction image placeholder"><span>Future reaction image</span><strong>YOUR<br />WALLET<br />SPEAKS</strong><i>Issue 001</i></div>
      <div className="result-content">
        <p className="kicker">The verdict / {calculation.score} out of 100</p>
        <div className="verdict-title"><span>{calculation.mood.emoji}</span><h2>{calculation.mood.title}</h2></div>
        <p className="headline">{savings > 0 ? `Bro... that's ${Math.round(calculation.consumed)}% of your savings.` : 'Enter your savings to unlock the full emotional damage.'}</p>
        <p className="result-detail"><strong>{purchase.product}</strong> costs {rupees.format(purchase.price)}. {savings > 0 && (calculation.remaining >= 0 ? `You’d have ${rupees.format(calculation.remaining)} left.` : `That’s ${rupees.format(Math.abs(calculation.remaining))} more than your savings.`)}</p>
        {savings > 0 && <div className="stats" aria-label="Purchase impact"><div><span>Current savings</span><strong>{rupees.format(savings)}</strong></div><div><span>Current purchase</span><strong>{rupees.format(purchase.price)}</strong></div><div><span>Remaining after</span><strong>{rupees.format(calculation.remaining)}</strong></div><div><span>Savings consumed</span><strong>{calculation.consumed.toFixed(1)}%</strong></div></div>}
        <p className="disclaimer">For entertainment and calculation only — not financial advice. Your wallet, your plot twist.</p>
      </div>
    </section>}

    <footer><span>REGRETIFY™</span><p>Some purchases deserve a second opinion.</p><span>Made for the plot.</span></footer>
  </main>
}

export default App
