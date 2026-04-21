export default function DonateModal({
  selectedAmount,
  setSelectedAmount,
  onDonate,
  onClose,
  donationMessage,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-shell">
        <div className="section-title blue">Support This Download</div>
        <div className="modal-body">
          <p className="body-copy">
            Your download has started. Would you like to support the music with a donation from
            $1 to $5? <span className="bold-copy">{donationMessage}</span>
          </p>

          <div className="donation-grid">
            {[1, 2, 3, 4, 5].map((amount) => (
              <button
                key={amount}
                onClick={() => setSelectedAmount(String(amount))}
                className={selectedAmount === String(amount) ? "amount-button selected" : "amount-button"}
              >
                ${amount}
              </button>
            ))}
          </div>

          <div className="button-row">
            <button className="retro-button" onClick={onDonate}>
              Donate ${selectedAmount}
            </button>
            <button className="retro-button" onClick={onClose}>
              No Thanks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}