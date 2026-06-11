export async function GET(request) {
	const userStr = request.headers.get('x-user-session');
	if (!userStr) {
		return new Response(
			`
			<html>
				<body>
					<script>
						window.parent.postMessage({ type: 'AUTH_ERROR', error: 'Unauthorized' }, '*');
					</script>
				</body>
			</html>
			`,
			{
				status: 401,
				headers: {
					'Content-Type': 'text/html',
				},
			}
		);
	}

	try {
		const user = JSON.parse(userStr);
		const message = {
			type: 'AUTH_SUCCESS',
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
			},
		};

		return new Response(
			`
			<html>
				<body>
					<script>
						window.parent.postMessage(${JSON.stringify(message)}, '*');
					</script>
				</body>
			</html>
			`,
			{
				headers: {
					'Content-Type': 'text/html',
				},
			}
		);
	} catch {
		return new Response(
			`
			<html>
				<body>
					<script>
						window.parent.postMessage({ type: 'AUTH_ERROR', error: 'Invalid session' }, '*');
					</script>
				</body>
			</html>
			`,
			{
				status: 401,
				headers: {
					'Content-Type': 'text/html',
				},
			}
		);
	}
}
