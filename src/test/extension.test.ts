import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Commands should be registered', async () => {
		const ext = vscode.extensions.getExtension('haksolot.zoomiz');
		assert.ok(ext, 'Extension should be present');
		await ext.activate();

		const commands = await vscode.commands.getCommands(true);
		assert.ok(commands.includes('zoomiz.jump'), 'zoomiz.jump should be registered');
		assert.ok(commands.includes('zoomiz.jumpAll'), 'zoomiz.jumpAll should be registered');
	});
});
