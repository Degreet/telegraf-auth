const msg = require('telegraf-msg');

module.exports = {
	async reg(ctx, db, otherFields = {}) {
		const userId = ctx.from.id;
		const firstName = ctx.from.first_name;
		const lastName = ctx.from.last_name;
		const { username } = ctx.from;

		const data = this.regData(
			userId,
			firstName,
			lastName,
			username,
			otherFields
		);

		await db.insertOne(data);
		return data;
	},

	regData(userId, firstName, lastName, username, otherFields = {}) {
		return {
			userId,
			firstName,
			lastName,
			username,
			dateReg: new Date(),
			...otherFields,
		};
	},

	async find(ctx, db, fields, needFailMsg, params = {}) {
		const candidate = await db.findOne(fields);
		const { successFn, failFn } = params;

		if (candidate) {
			const firstName = ctx.from.first_name;
			const lastName = ctx.from.last_name;
			const { username } = ctx.from;

			if (
				candidate.firstName != firstName ||
				candidate.lastName != lastName ||
				candidate.username != username
			) {
				await db.updateOne(
					{ _id: candidate._id },
					{ $set: { firstName, lastName, username } }
				);
			}

			await db.updateOne(
				{ _id: candidate._id },
				{ $set: { lastPing: Date.now() } }
			);

			if (successFn && typeof successFn === 'function')
				return successFn(candidate);
			else return candidate;
		} else {
			if (failFn) return failFn();
			if (needFailMsg)
				msg.send(ctx, `❌ <b>Ошибка!</b>\nВведите <b>/start</b>`);
			return false;
		}
	},
};
