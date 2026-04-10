const FENCE_PATTERN = /^```([\w-]+)?\s*$/;
const HEADING_PATTERN = /^(#{1,6})\s+(.*)$/;
const LIST_ITEM_PATTERN = /^(\s*)([-*+]|\d+\.)\s+(.*)$/;

function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function escapeAttribute(value: string): string {
	return escapeHtml(value);
}

function countIndentation(value: string): number {
	const whitespace = value.match(/^\s*/)?.[0] ?? '';
	return whitespace.replaceAll('\t', '    ').length;
}

function isSafeLink(value: string): boolean {
	return /^https?:\/\//i.test(value);
}

function renderInlineMarkdown(value: string): string {
	let html = escapeHtml(value);
	const codeTokens: string[] = [];

	html = html.replace(/`([^`]+)`/g, (_, code: string) => {
		const token = `__CODE_${codeTokens.length}__`;
		codeTokens.push(`<code>${escapeHtml(code)}</code>`);
		return token;
	});

	html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label: string, url: string) => {
		if (!isSafeLink(url)) {
			return label;
		}

		return `<a href="${escapeAttribute(url)}" target="_blank" rel="noreferrer noopener">${label}</a>`;
	});

	html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
	html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
	html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');

	for (const [index, token] of codeTokens.entries()) {
		html = html.replaceAll(`__CODE_${index}__`, token);
	}

	return html;
}

function parseList(lines: string[], startIndex: number, baseIndent: number): {
	html: string;
	nextIndex: number;
} {
	const firstMatch = lines[startIndex].match(LIST_ITEM_PATTERN);

	if (!firstMatch) {
		return { html: '', nextIndex: startIndex };
	}

	const ordered = /^\d+\.$/.test(firstMatch[2]);
	const tagName = ordered ? 'ol' : 'ul';
	let index = startIndex;
	let html = `<${tagName}>`;

	while (index < lines.length) {
		const line = lines[index];
		const match = line.match(LIST_ITEM_PATTERN);

		if (!match) {
			break;
		}

		const indent = countIndentation(match[1]);
		const isOrdered = /^\d+\.$/.test(match[2]);

		if (indent < baseIndent || indent > baseIndent || isOrdered !== ordered) {
			break;
		}

		const fragments = [renderInlineMarkdown(match[3])];
		index += 1;

		while (index < lines.length) {
			const nextLine = lines[index];

			if (nextLine.trim().length === 0) {
				index += 1;
				break;
			}

			const nextMatch = nextLine.match(LIST_ITEM_PATTERN);

			if (nextMatch) {
				const nextIndent = countIndentation(nextMatch[1]);

				if (nextIndent === baseIndent) {
					break;
				}

				if (nextIndent > baseIndent) {
					const nested = parseList(lines, index, nextIndent);
					fragments.push(nested.html);
					index = nested.nextIndex;
					continue;
				}
			}

			if (countIndentation(nextLine) > baseIndent) {
				fragments.push(`<div>${renderInlineMarkdown(nextLine.trim())}</div>`);
				index += 1;
				continue;
			}

			break;
		}

		html += `<li>${fragments.join('')}</li>`;
	}

	html += `</${tagName}>`;
	return { html, nextIndex: index };
}

function renderParagraph(lines: string[]): string {
	return `<p>${lines.map((line) => renderInlineMarkdown(line.trim())).join('<br />')}</p>`;
}

export function renderMarkdownToHtml(markdown: string): string {
	const normalized = markdown.replace(/\r\n/g, '\n').trim();

	if (normalized.length === 0) {
		return '';
	}

	const lines = normalized.split('\n');
	const blocks: string[] = [];
	let index = 0;

	while (index < lines.length) {
		const line = lines[index];
		const trimmed = line.trim();

		if (trimmed.length === 0) {
			index += 1;
			continue;
		}

		const fenceMatch = trimmed.match(FENCE_PATTERN);

		if (fenceMatch) {
			const language = fenceMatch[1]?.trim() ?? '';
			const codeLines: string[] = [];
			index += 1;

			while (index < lines.length && !lines[index].trim().startsWith('```')) {
				codeLines.push(lines[index]);
				index += 1;
			}

			if (index < lines.length) {
				index += 1;
			}

			blocks.push(
				`<pre class="ui-markdown__pre"><code${language ? ` data-language="${escapeAttribute(language)}"` : ''}>${escapeHtml(codeLines.join('\n'))}</code></pre>`
			);
			continue;
		}

		const headingMatch = trimmed.match(HEADING_PATTERN);

		if (headingMatch) {
			const level = headingMatch[1].length;
			blocks.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`);
			index += 1;
			continue;
		}

		const listMatch = line.match(LIST_ITEM_PATTERN);

		if (listMatch) {
			const parsedList = parseList(lines, index, countIndentation(listMatch[1]));
			blocks.push(parsedList.html);
			index = parsedList.nextIndex;
			continue;
		}

		const paragraphLines = [line];
		index += 1;

		while (index < lines.length) {
			const nextLine = lines[index];
			const nextTrimmed = nextLine.trim();

			if (
				nextTrimmed.length === 0 ||
				nextTrimmed.match(FENCE_PATTERN) ||
				nextTrimmed.match(HEADING_PATTERN) ||
				nextLine.match(LIST_ITEM_PATTERN)
			) {
				break;
			}

			paragraphLines.push(nextLine);
			index += 1;
		}

		blocks.push(renderParagraph(paragraphLines));
	}

	return blocks.join('');
}
