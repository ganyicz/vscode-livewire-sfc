import * as vscode from 'vscode';

type PhpBlock = {
	start: number;
	end: number;
};

type PhpBlockCacheEntry = {
	version: number;
	blocks: PhpBlock[];
};

const phpBlockCache = new Map<string, PhpBlockCacheEntry>();

const collectPhpBlocks = (documentText: string): PhpBlock[] => {
	const blocks: PhpBlock[] = [];
	const regex = /<\?php[\s\S]*?\?>/g;
	let match: RegExpExecArray | null;

	while ((match = regex.exec(documentText)) !== null) {
		blocks.push({ start: match.index, end: match.index + match[0].length });
	}

	return blocks;
};

const isOffsetInPhp = (blocks: PhpBlock[], offset: number): boolean =>
	blocks.some((block) => offset >= block.start && offset <= block.end);

const languageForOffset = (blocks: PhpBlock[], offset: number): 'php' | 'blade' =>
	isOffsetInPhp(blocks, offset) ? 'php' : 'blade';

const rangeIntersectsPhp = (blocks: PhpBlock[], start: number, end: number): boolean =>
	blocks.some((block) => start < block.end && end > block.start);

const rangeFullyWithinPhp = (blocks: PhpBlock[], start: number, end: number): boolean =>
	blocks.some((block) => start >= block.start && end <= block.end);

const getPhpBlocks = (document: vscode.TextDocument): PhpBlock[] => {
	const key = document.uri.toString();
	const cached = phpBlockCache.get(key);

	if (cached && cached.version === document.version) {
		return cached.blocks;
	}

	const blocks = collectPhpBlocks(document.getText());
	phpBlockCache.set(key, { version: document.version, blocks });
	return blocks;
};

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.window.onDidChangeTextEditorSelection((event) => {
		const editor = event.textEditor;
		if (! editor.document.fileName.endsWith('.blade.php')) return
		const document = editor.document;
		const position = editor.selection.active;

		const phpBlocks = getPhpBlocks(document);
		const offset = document.offsetAt(position);
		const lang = languageForOffset(phpBlocks, offset);

		vscode.languages.setTextDocumentLanguage(editor.document, lang);
	});

	context.subscriptions.push(disposable);

		context.subscriptions.push(
			vscode.window.onDidChangeTextEditorVisibleRanges((event) => {
				const editor = event.textEditor;
				if (! editor.document.fileName.endsWith('.blade.php')) return

				const document = editor.document;
				const visibleRanges = event.visibleRanges;
				if (!visibleRanges.length) return;

				const phpBlocks = getPhpBlocks(document);

				let phpVisible = false;
				let bladeVisible = false;

			for (const range of visibleRanges) {
				const startOffset = document.offsetAt(range.start);
				const endOffset = document.offsetAt(range.end);

				if (!phpVisible && rangeIntersectsPhp(phpBlocks, startOffset, endOffset)) {
					phpVisible = true;
				}

				if (!bladeVisible && !rangeFullyWithinPhp(phpBlocks, startOffset, endOffset)) {
					bladeVisible = true;
				}

				if (phpVisible && bladeVisible) {
					break;
				}
			}

			let lang: 'php' | 'blade';

			if (phpVisible && bladeVisible) {
				const offset = document.offsetAt(editor.selection.active);
				lang = languageForOffset(phpBlocks, offset);
			} else if (phpVisible) {
				lang = 'php';
			} else {
				lang = 'blade';
			}

				vscode.languages.setTextDocumentLanguage(document, lang);
			})
		);

	context.subscriptions.push(
		vscode.workspace.onDidCloseTextDocument((document) => {
			if (! document.fileName.endsWith('.blade.php')) return;
			phpBlockCache.delete(document.uri.toString());
		})
	);
}
