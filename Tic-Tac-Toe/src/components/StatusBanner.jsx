function StatusBanner({ statusText, statusColor, showTimer, timeLeft }) {
	return (
		<div className="status-panel">
			<p className="status" style={{ color: statusColor }} aria-live="polite">
				{statusText}
			</p>
			<p className={`timer ${showTimer ? "" : "timer-hidden"}`} aria-live="polite">
				Time left: 00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
			</p>
		</div>
	);
}

export default StatusBanner;
