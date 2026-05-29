import { useMemo, useState } from "react";

function InvitePanel({ roomId }) {
	const [copied, setCopied] = useState(false);

	const inviteLink = useMemo(() => {
		const url = new URL(window.location.href);
		url.searchParams.set("room", roomId);
		return url.toString();
	}, [roomId]);

	const copyInvite = async () => {
		try {
			await navigator.clipboard.writeText(inviteLink);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1500);
		} catch {
			setCopied(false);
		}
	};

	return (
		<section className="invite-panel">
			<div>
				<h2>Invite a challenger</h2>
				<p>Host stays Player 1 (X). Anyone joining this room becomes Player 2 (O).</p>
			</div>

			<div className="invite-code">
				<span>Room code</span>
				<strong>{roomId}</strong>
			</div>

			<div className="invite-link-row">
				<input className="name-input invite-input" type="text" value={inviteLink} readOnly />
				<button type="button" className="primary-button" onClick={copyInvite}>
					{copied ? "Copied" : "Copy Link"}
				</button>
			</div>
		</section>
	);
}

export default InvitePanel;
