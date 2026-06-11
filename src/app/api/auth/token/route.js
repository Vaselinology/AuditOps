export async function GET(request) {
	const userStr = request.headers.get('x-user-session');
	if (!userStr) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}

	try {
		const user = JSON.parse(userStr);
		return new Response(
			JSON.stringify({
				user: {
					id: user.id,
					email: user.email,
					name: user.name,
				},
			}),
			{
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);
	} catch {
		return new Response(JSON.stringify({ error: 'Invalid session' }), {
			status: 401,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}
}
