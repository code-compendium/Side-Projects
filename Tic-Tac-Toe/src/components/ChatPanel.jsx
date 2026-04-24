function ChatPanel({ title, messages, value, onChange, onSubmit, disabled }) {
	return (
		<aside className="chat-panel">
			<div className="chat-header">
				<h2>{title}</h2>
				<span>{messages.length} messages</span>
			</div>

			<div className="chat-messages" aria-live="polite">
				{messages.length === 0 ? (
					<p className="chat-empty">The lobby is quiet. Start the mind games.</p>
				) : (
					messages.map((message) => (
						<article key={message.id} className={`chat-message ${message.system ? "system" : ""}`}>
							<div className="chat-meta">
								<strong>{message.author}</strong>
								<span>{new Date(message.timestamp).toLocaleTimeString()}</span>
							</div>
							<p>{message.message}</p>
						</article>
					))
				)}
			</div>

			<form className="chat-form" onSubmit={onSubmit}>
				<input
					className="name-input chat-input"
					type="text"
					value={value}
					onChange={(event) => onChange(event.target.value)}
					placeholder="Type a message"
					maxLength={240}
					disabled={disabled}
				/>
				<button type="submit" className="primary-button" disabled={disabled || !value.trim()}>
					Send
				</button>
			</form>
		</aside>
	);
}

export default ChatPanel;
