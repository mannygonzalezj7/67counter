import React, { useState } from "react";

function digitsOnly(s) {
  return (s || "").replace(/\D/g, "");
}

function formatCardDigits(digits) {
  // Group into 4-digit blocks: 6767676767676767 -> "6767 6767 6767 6767"
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

export default function PaymentModal({ onAddReps }) {
  const [open, setOpen] = useState(false);
  const [option, setOption] = useState("100"); // '100' or '500'

  // Stored as formatted string for card (with spaces), raw string for others
  const [card, setCard] = useState("");
  const [cvc, setCvc] = useState("");
  const [code9, setCode9] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleCardChange(e) {
    const raw = digitsOnly(e.target.value).slice(0, 16); // limit to 16 digits
    const formatted = formatCardDigits(raw);
    setCard(formatted);
  }

  function handleCvcChange(e) {
    const raw = digitsOnly(e.target.value).slice(0, 4);
    setCvc(raw);
  }

  function handleCode9Change(e) {
    const raw = digitsOnly(e.target.value).slice(0, 9);
    // format as XXX XX XXXX for display
    const a = raw.slice(0, 3);
    const b = raw.slice(3, 5);
    const c = raw.slice(5, 9);
    const parts = [];
    if (a) parts.push(a);
    if (b) parts.push(b);
    if (c) parts.push(c);
    setCode9(parts.join(" "));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (option === "100") {
      if (digitsOnly(card).length !== 16) {
        setError("Enter a 16-digit fake card number (meme only).");
        return;
      }
      if (digitsOnly(cvc).length < 3) {
        setError("Enter a 3-4 digit fake CVC (meme only).");
        return;
      }
      setSuccess("(Meme) Accepted - +100 repetitions");
      if (onAddReps) onAddReps(100);
      setTimeout(() => setOpen(false), 700);
      return;
    }

    // 500 option
    if (digitsOnly(code9).length !== 9) {
      setError("Enter a 9-digit fake code (meme only).");
      return;
    }
    setSuccess("(Meme) Accepted - +500 repetitions");
    if (onAddReps) onAddReps(500);
    setTimeout(() => setOpen(false), 700);
  }

  return (
    <>
      <button className="payment-button" onClick={() => setOpen(true)}>
        Payment
      </button>

      {open && (
        <div className="payment-modal-overlay" onClick={() => setOpen(false)}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Purchase repetitions (Meme)</h2>

            <p style={{ color: "#ffdcdc", fontSize: "0.95rem" }}>
              This is a meme/demo flow — do NOT enter real personal or payment data.
            </p>

            <div className="payment-options" style={{ marginTop: 8 }}>
              <label style={{ display: "block", marginBottom: 8 }}>
                <input
                  type="radio"
                  name="option"
                  value="100"
                  checked={option === "100"}
                  onChange={() => { setOption("100"); setError(""); setSuccess(""); }}
                />{' '}
                Unlock 100 reps — input your parent's credit card information (FAKE)
              </label>

              <label style={{ display: "block" }}>
                <input
                  type="radio"
                  name="option"
                  value="500"
                  checked={option === "500"}
                  onChange={() => { setOption("500"); setError(""); setSuccess(""); }}
                />{' '}
                Unlock 500 reps — enter your Social Security number (FAKE)
              </label>
            </div>

            <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
              {option === "100" ? (
                <>
                  <input
                    className="payment-input"
                    placeholder="Fake card: 6767 6767 6767 6767"
                    value={card}
                    onChange={handleCardChange}
                    maxLength={19}
                    inputMode="numeric"
                  />

                  <input
                    className="payment-input"
                    placeholder="Fake CVC"
                    value={cvc}
                    onChange={handleCvcChange}
                    maxLength={4}
                    style={{ width: 140, marginTop: 8 }}
                    inputMode="numeric"
                  />
                </>
              ) : (
                <input
                  className="payment-input"
                  placeholder="Fake SSN: 123 45 6789"
                  value={code9}
                  onChange={handleCode9Change}
                  maxLength={11}
                  inputMode="numeric"
                />
              )}

              {error && <div className="payment-error">{error}</div>}
              {success && <div className="payment-success">{success}</div>}

              <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'center' }}>
                <button className="btn-crazy" type="submit">Confirm (Meme)</button>
                <button type="button" className="btn-crazy" onClick={() => setOpen(false)}>Close</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
