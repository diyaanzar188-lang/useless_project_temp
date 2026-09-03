import React, { useEffect, useMemo, useRef, useState } from 'react'
import vettamStill from './assets/vettam-regretify.jpeg'

const rupees = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const QUICK_AMOUNTS = [500, 1000, 2500, 5000]
const FOOD_PRICES = [
  { emoji: '🥚', name: 'MUTTA', price: 12, line: 'That’s a LOT of omelettes.' },
  { emoji: '🥐', name: 'PUFFS', price: 20, line: 'A flaky little trade-off.' },
  { emoji: '🍛', name: 'BIRIYANI', price: 160, line: 'Headphones over five biriyanis?' },
  { emoji: '☕', name: 'CHAYA', price: 12, line: 'A tea break for the whole class.' },
]

function getRegretScore(amount) {
  return Math.min(99, Math.max(4, Math.round(18 + Math.log10(Math.max(amount, 1)) * 21)))
}

function getRegretMessage(score) {
  if (score < 40) return 'You’re probably fine.'
  if (score <= 64) return 'Hmm… maybe think twice.'
  if (score <= 83) return 'This purchase is getting suspicious.'
  return 'This needs a proper second look.'
}

function FoodCard({ food, quantity, index }) {
  return <article className="food-card" style={{ '--entrance-delay': `${index * 90}ms` }}>
    <div className="food-card-topline"><span className="food-emoji">{food.emoji}</span><span>₹{food.price} each</span></div>
    <h3>{food.name}</h3>
    <strong>{quantity}</strong><span className="food-unit">{food.name.toLowerCase()}</span>
    <p>{food.line}</p>
  </article>
}

function App() {
  const [savingsInput, setSavingsInput] = useState(() => localStorage.getItem('regretify-savings') || '')
  const [savings, setSavings] = useState(() => Number(localStorage.getItem('regretify-savings')) || 0)
  const [purchase, setPurchase] = useState(null)
  const [form, setForm] = useState({ product: '', price: '' })
  const resultRef = useRef(null)

  useEffect(() => {
    if (savings > 0) localStorage.setItem('regretify-savings', String(savings))
  }, [savings])

  const foodResults = useMemo(() => purchase
    ? FOOD_PRICES.map((food) => ({ ...food, quantity: Math.floor(purchase.price / food.price) }))
    : [], [purchase])
  const regretScore = useMemo(() => purchase ? getRegretScore(purchase.price) : null, [purchase])

  useEffect(() => {
    if (purchase) resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [purchase])

  function saveSavings(event) {
    event.preventDefault()
    const amount = Number(savingsInput)
    if (amount > 0) setSavings(amount)
  }

  function updateForm(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function submitPurchase(event) {
    event.preventDefault()
    const price = Number(form.price)
    if (!form.product.trim() || price <= 0) return
    setPurchase({ product: form.product.trim(), price })
  }

  const biriyani = foodResults.find((food) => food.name === 'BIRIYANI')
  const chaya = foodResults.find((food) => food.name === 'CHAYA')
  const mutta = foodResults.find((food) => food.name === 'MUTTA')

  return <main className="app-shell" id="top">
    <header className="topbar">
      <a className="brand" href="#top" aria-label="Regretify home"><b aria-hidden="true">☹</b> REGRETIFY</a>
      <nav aria-label="Main navigation"><a href="#top">Home</a><a href="#confess">Calculate</a><a href="#how-it-works">How it works</a></nav>
      <a className="nav-link" href="#confess">My regrets <span aria-hidden="true">↻</span></a>
    </header>

    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-copy">
        <p className="kicker">The unnecessary spending companion</p>
        <h1 id="hero-heading">Before you buy it...<br /><em>onnu aalochichittu</em><br />vaangikko.</h1>
        <p className="hero-summary">Enter the amount and product name. Find out enthellam you could&rsquo;ve had instead. No judgment. Okay, a little judgment.</p>
        <a className="hero-action" href="#confess">Regretify it <span aria-hidden="true">✦</span></a>
      </div>
      <div className="hero-scene">
        <img src={vettamStill} alt="User-provided Vettam train still showing two characters considering a purchase" />
        <aside className="hero-score-card" aria-live="polite">
          <p>Current purchase</p><strong>{purchase ? rupees.format(purchase.price) : '₹ —'}</strong>
          <div><span>{purchase ? purchase.product : 'Your product goes here'}</span><small>{purchase ? 'Ready for the food report' : 'Enter an amount below'}</small></div>
        </aside>
        <p className="movie-quote">Onnu aalochichittu vaangikko...</p>
      </div>
    </section>

    <section className="calculator-section" id="confess" aria-labelledby="confession-heading">
      <div className="section-intro"><p className="kicker">The regret calculator</p><h2 id="confession-heading">A small moment of<br /><em>honesty.</em></h2><p>Give us the amount and the product. We’ll do the rest.</p></div>
      <div className="calculator-grid">
        <section className="savings-card" aria-labelledby="savings-heading">
          <div className="card-topline"><span>01 / YOUR BASELINE</span><span>Private by design</span></div><h3 id="savings-heading">What’s in the vault?</h3>
          <form onSubmit={saveSavings} className="savings-form">
            <label htmlFor="savings">Current savings</label><div className="money-input"><span aria-hidden="true">₹</span><input id="savings" type="number" min="0" inputMode="decimal" placeholder="20,000" value={savingsInput} onChange={(event) => setSavingsInput(event.target.value)} /></div>
            <button type="submit" className="text-button">Save this number <span aria-hidden="true">→</span></button>
          </form>
          <p className="saved-value">{savings > 0 ? `Currently guarding ${rupees.format(savings)}` : 'Add a number so we can judge responsibly.'}</p>
        </section>
        <section className="purchase-card" aria-labelledby="purchase-heading">
          <div className="card-topline"><span>02 / THE TEMPTATION</span><span>Be brave</span></div><h3 id="purchase-heading">Confess the purchase.</h3>
          <form onSubmit={submitPurchase} className="purchase-form simple-purchase-form">
            <label htmlFor="price">Product amount</label><div className="money-input"><span aria-hidden="true">₹</span><input id="price" name="price" type="number" min="1" inputMode="decimal" placeholder="8,000" value={form.price} onChange={updateForm} required /></div>
            <div className="quick-amounts" aria-label="Quick price choices">{QUICK_AMOUNTS.map((amount) => <button key={amount} type="button" onClick={() => setForm((current) => ({ ...current, price: String(amount) }))}>₹{amount.toLocaleString('en-IN')}</button>)}</div>
            <label htmlFor="product">Product name</label><input id="product" name="product" placeholder="Gaming headphones" value={form.product} onChange={updateForm} required />
            <button type="submit" className="primary-button">Give me the food report <span aria-hidden="true">→</span></button>
          </form>
        </section>
      </div>
    </section>

    {purchase && <section className="food-report" ref={resultRef} aria-live="polite" aria-labelledby="report-heading">
      <div className="report-heading"><p className="kicker">FINANCIAL DAMAGE REPORT</p><h2 id="report-heading">{rupees.format(purchase.price)} could also buy…</h2></div>
      <div className="food-grid">{foodResults.map((food, index) => <FoodCard key={food.name} food={food} quantity={food.quantity} index={index} />)}</div>
      <p className="personalised-regret">{biriyani.quantity >= 1 ? `That ${purchase.product} costs ${biriyani.quantity} biriyanis — or ${chaya.quantity} chayas.` : `That ${purchase.product} costs ${mutta.quantity} eggs. Small amount, real snacks.`}</p>
      <section className="score-section" aria-labelledby="score-heading"><p className="kicker" id="score-heading">REGRET SCORE</p><strong>{regretScore}%</strong><p>{getRegretMessage(regretScore)}</p><small>For entertainment, not financial advice.</small></section>
      <p className="reference-note">Reference prices are approximate and may vary by location.</p>
    </section>}

    <section className="marquee" aria-label="Some purchases are worth it. Some purchases need a second look."><div className="marquee-track"><span>Some purchases are worth it. <b>Some purchases need a second look.</b></span><span aria-hidden="true">Some purchases are worth it. <b>Some purchases need a second look.</b></span></div></section>

    <section className="how-it-works" id="how-it-works" aria-labelledby="method-heading"><p className="kicker">THE VERY SCIENTIFIC METHOD</p><h2 id="method-heading">Spend.<br />Count snacks.<br /><em>Reconsider.</em></h2><p>We turn the price tag into things you actually understand. No judgement — just a friendly reminder that your cart has consequences.</p></section>

    <footer><span>REGRETIFY®</span><p>Making bad financial decisions slightly more visible.</p><span>Prices are approximate reference values.</span></footer>
  </main>
}

export default App
