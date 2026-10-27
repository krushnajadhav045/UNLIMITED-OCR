/**
 * Unlimited-OCR Interactive Visualization Engine
 * Controls multi-page document rendering, token streaming, bounding box overlays,
 * and 3-way synchronization across Document Preview, Raw Output, and Layout Reconstruction.
 */

(function () {
  'use strict';

  // State
  let currentDocKey = 'unlimited_paper_main';
  let currentSampleKey = 'scanned_notebook';
  let isStreaming = false;
  let isPaused = false;
  let currentStreamIndex = 0;
  let streamTimer = null;
  let generatedTokensCount = 0;
  let startTime = 0;
  let zoomLevel = 1.0;
  let uploadedFile = null;

  // Flattened token events for streaming
  let tokenSequence = [];
  let renderedBlocks = [];

  // DOM Elements
  const statusPill = document.getElementById('statusPill');
  const statusText = document.getElementById('statusText');
  const btnStart = document.getElementById('btnStart');
  const btnStop = document.getElementById('btnStop');
  const btnReset = document.getElementById('btnReset');
  const docSelect = document.getElementById('docSelect');
  const speedSelect = document.getElementById('speedSelect');
  const fileInput = document.getElementById('fileInput');
  const uploadDropzone = document.getElementById('uploadDropzone');
  const btnBrowse = document.getElementById('btnBrowse');
  const btnChooseFile = document.getElementById('btnChooseFile');
  const fileSummary = document.getElementById('fileSummary');
  const fileName = document.getElementById('fileName');
  const fileMeta = document.getElementById('fileMeta');
  const fileTypeIcon = document.getElementById('fileTypeIcon');
  const btnRemoveFile = document.getElementById('btnRemoveFile');
  const toggleBBoxes = document.getElementById('toggleBBoxes');

  // Statistics
  const blocksMetric = document.getElementById('blocksMetric');
  const pagesMetric = document.getElementById('pagesMetric');
  const tablesMetric = document.getElementById('tablesMetric');
  const tabBlockCount = document.getElementById('tabBlockCount');
  const tabTableCount = document.getElementById('tabTableCount');
  const dataCountLabel = document.getElementById('dataCountLabel');
  const tableCountLabel = document.getElementById('tableCountLabel');

  // Panels
  const pagesWrapper = document.getElementById('pagesWrapper');
  const terminalContent = document.getElementById('terminalContent');
  const terminalCursor = document.getElementById('terminalCursor');
  const rawTerminal = document.getElementById('rawTerminal');
  const autoScroll = document.getElementById('autoScroll');
  const streamIndicator = document.getElementById('streamIndicator');
  const btnCopyRaw = document.getElementById('btnCopyRaw');

  // Result views and export center
  const layoutPages = document.getElementById('layoutPages');
  const layoutEmptyState = document.getElementById('layoutEmptyState');
  const tableResults = document.getElementById('tableResults');
  const jsonCode = document.getElementById('jsonCode');
  const btnExport = document.getElementById('btnExport');
  const exportDialog = document.getElementById('exportDialog');
  const btnCloseExport = document.getElementById('btnCloseExport');
  const appNotice = document.getElementById('appNotice');

  // Zoom controls
  const zoomInBtn = document.getElementById('zoomIn');
  const zoomOutBtn = document.getElementById('zoomOut');
  const zoomLevelText = document.getElementById('zoomLevel');

  /**
   * Initialize Application
   */
  function init() {
    setupEventListeners();
    btnStop.disabled = true;
    if (docSelect && docSelect.value) {
      currentDocKey = docSelect.value;
    }
    loadDocument(currentDocKey);
  }

  /**
   * Setup Event Listeners
   */
  function setupEventListeners() {
    btnStart.addEventListener('click', onStartClick);
    btnStop.addEventListener('click', onStopClick);
    btnReset.addEventListener('click', resetAll);

    docSelect.addEventListener('change', (e) => {
      if (!e.target.value.startsWith('custom_')) currentSampleKey = e.target.value;
      resetAll();
      loadDocument(e.target.value);
    });

    fileInput.addEventListener('change', handleCustomFileUpload);
    btnBrowse.addEventListener('click', () => fileInput.click());
    btnChooseFile.addEventListener('click', () => fileInput.click());
    uploadDropzone.addEventListener('click', (event) => {
      if (event.target.closest('button')) return;
      fileInput.click();
    });
    uploadDropzone.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        fileInput.click();
      }
    });
    ['dragenter', 'dragover'].forEach(eventName => uploadDropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      uploadDropzone.classList.add('drag-over');
    }));
    ['dragleave', 'drop'].forEach(eventName => uploadDropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      uploadDropzone.classList.remove('drag-over');
    }));
    uploadDropzone.addEventListener('drop', handleCustomFileUpload);
    btnRemoveFile.addEventListener('click', removeUploadedFile);

    toggleBBoxes.addEventListener('change', (e) => {
      const bboxes = document.querySelectorAll('.bbox');
      bboxes.forEach(b => b.style.display = e.target.checked ? 'block' : 'none');
    });

    // Zoom
    zoomInBtn.addEventListener('click', () => {
      if (zoomLevel < 1.6) {
        zoomLevel = Math.round((zoomLevel + 0.1) * 10) / 10;
        applyZoom();
      }
    });
    zoomOutBtn.addEventListener('click', () => {
      if (zoomLevel > 0.6) {
        zoomLevel = Math.round((zoomLevel - 0.1) * 10) / 10;
        applyZoom();
      }
    });

    document.querySelectorAll('.workspace-tab').forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.pane));
    });

    // Copy Raw
    btnCopyRaw.addEventListener('click', async () => {
      const rawText = terminalContent.innerText;
      try {
        await navigator.clipboard.writeText(rawText);
        showNotice('Recognized text copied to clipboard.', 'success');
      } catch {
        showNotice('Clipboard access is unavailable in this browser.', 'error');
      }
    });

    btnExport.addEventListener('click', () => exportDialog.showModal());
    btnCloseExport.addEventListener('click', () => exportDialog.close());
    exportDialog.addEventListener('click', (event) => {
      if (event.target === exportDialog) exportDialog.close();
    });
    document.querySelectorAll('[data-export-format]').forEach(button => {
      button.addEventListener('click', () => exportResults(button.dataset.exportFormat));
    });
  }

  function applyZoom() {
    pagesWrapper.style.transform = `scale(${zoomLevel})`;
    zoomLevelText.innerText = `${Math.round(zoomLevel * 100)}%`;
  }

  function showNotice(message, type = 'info') {
    appNotice.textContent = message;
    appNotice.className = `app-notice ${type}`;
    appNotice.hidden = false;
    clearTimeout(showNotice.timer);
    showNotice.timer = setTimeout(() => {
      appNotice.hidden = true;
    }, 5000);
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function getExportBaseName() {
    const title = DEMO_DATA[currentDocKey]?.title || 'ocr-results';
    const stem = title.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `${stem || 'ocr-results'}-results`;
  }

  function csvEscape(value) {
    return `"${String(value ?? '').replace(/"/g, '""')}"`;
  }

  function parseMarkdownTable(markdown) {
    return String(markdown).split(/\r?\n/)
      .filter(line => line.includes('|') && !/^\s*\|?\s*:?-{3,}/.test(line))
      .map(line => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(cell => cell.trim()))
      .filter(cells => cells.some(Boolean));
  }

  function buildPlainText() {
    const pages = new Map();
    renderedBlocks.forEach(block => {
      if (!pages.has(block.pageNumber)) pages.set(block.pageNumber, []);
      pages.get(block.pageNumber).push(block.content);
    });
    return Array.from(pages.entries()).map(([page, content]) => `--- Page ${page} ---\n\n${content.join('\n\n')}`).join('\n\n');
  }

  function buildMarkdown() {
    const pages = new Map();
    renderedBlocks.forEach(block => {
      if (!pages.has(block.pageNumber)) pages.set(block.pageNumber, []);
      const content = block.category === 'title' ? `### ${block.content}` : block.content;
      pages.get(block.pageNumber).push(content);
    });
    const pageSections = Array.from(pages.entries()).map(([page, content]) => `## Page ${page}\n\n${content.join('\n\n')}`);
    return `# ${DEMO_DATA[currentDocKey]?.title || 'OCR Extraction'}\n\n${pageSections.join('\n\n')}`;
  }

  async function exportPageImage(baseName) {
    const page = DEMO_DATA[currentDocKey]?.pages?.[0];
    if (!page?.image) {
      showNotice('No page image is available for this document.', 'warning');
      return;
    }
    try {
      const response = await fetch(page.image);
      if (!response.ok) throw new Error('Image could not be loaded');
      downloadBlob(await response.blob(), `${baseName}-page-${page.pageNumber}.png`);
      showNotice('First rendered page image downloaded as PNG.', 'success');
    } catch (error) {
      showNotice(`Could not download page image: ${error.message}`, 'error');
      return;
    }
    exportDialog.close();
  }

  function updateCounts() {
    const tableCount = renderedBlocks.filter(block => block.category === 'table').length;
    blocksMetric.innerText = String(renderedBlocks.length);
    tablesMetric.innerText = String(tableCount);
    tabBlockCount.innerText = String(renderedBlocks.length);
    tabTableCount.innerText = String(tableCount);
    dataCountLabel.innerText = `${renderedBlocks.length} ${renderedBlocks.length === 1 ? 'block' : 'blocks'}`;
    tableCountLabel.innerText = `${tableCount} ${tableCount === 1 ? 'table' : 'tables'}`;
    document.querySelectorAll('[data-export-format]').forEach(button => {
      button.disabled = renderedBlocks.length === 0;
    });
  }

  function formatFileSize(size) {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }

  function updateFileSummary() {
    const doc = DEMO_DATA[currentDocKey];
    if (!doc) {
      fileSummary.hidden = true;
      return;
    }
    const isCustom = currentDocKey.startsWith('custom_');
    fileSummary.hidden = false;
    fileSummary.dataset.custom = String(isCustom);
    fileName.textContent = isCustom && uploadedFile ? uploadedFile.name : doc.title;
    fileMeta.textContent = isCustom && uploadedFile
      ? `${formatFileSize(uploadedFile.size)} · ${doc.pages.length} ${doc.pages.length === 1 ? 'page' : 'pages'}`
      : `Sample document · ${doc.pages.length} ${doc.pages.length === 1 ? 'page' : 'pages'}`;
    const extension = (isCustom && uploadedFile ? uploadedFile.name : doc.title).split('.').pop().toUpperCase();
    fileTypeIcon.textContent = ['JPG', 'JPEG'].includes(extension) ? 'JPG' : extension.slice(0, 4);
  }

  async function exportResults(format) {
    if (renderedBlocks.length === 0) {
      showNotice('No parsed results yet. Start parsing a document before downloading.', 'warning');
      return;
    }

    const filename = getExportBaseName();
    const rows = renderedBlocks.map((block, index) => ({
      'Block #': index + 1,
      'Page': block.pageNumber,
      'Type': block.category,
      'Recognized text': block.content,
      'Bounding box (normalized)': Array.isArray(block.bbox) ? block.bbox.join(', ') : ''
    }));

    if (format === 'excel') {
      if (!window.XLSX) {
        showNotice('Excel export could not load. Check your internet connection and refresh the page.', 'error');
        return;
      }
      const worksheet = XLSX.utils.json_to_sheet(rows);
      worksheet['!cols'] = [
        { wch: 10 },
        { wch: 10 },
        { wch: 18 },
        { wch: 72 },
        { wch: 32 }
      ];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Parsed Blocks');
      const tables = renderedBlocks.filter(block => block.category === 'table');
      const tableRows = tables.flatMap((block, tableIndex) => parseMarkdownTable(block.content).map((cells, rowIndex) => ({
        'Table #': tableIndex + 1,
        'Page': block.pageNumber,
        'Row #': rowIndex + 1,
        'Cells': cells.join(' | ')
      })));
      if (tableRows.length) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(tableRows), 'Detected Tables');
      XLSX.writeFile(workbook, `${filename}.xlsx`);
      showNotice(`Excel workbook downloaded with ${renderedBlocks.length} parsed blocks.`, 'success');
      exportDialog.close();
      return;
    }

    if (format === 'json') {
      renderJsonView();
      downloadBlob(new Blob([jsonCode.innerText], { type: 'application/json;charset=utf-8' }), `${filename}.json`);
    } else if (format === 'csv') {
      const csvRows = [Object.keys(rows[0]), ...rows.map(row => Object.values(row))];
      const csv = csvRows.map(row => row.map(csvEscape).join(',')).join('\r\n');
      downloadBlob(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }), `${filename}.csv`);
    } else if (format === 'txt') {
      downloadBlob(new Blob([buildPlainText()], { type: 'text/plain;charset=utf-8' }), `${filename}.txt`);
    } else if (format === 'markdown') {
      downloadBlob(new Blob([buildMarkdown()], { type: 'text/markdown;charset=utf-8' }), `${filename}.md`);
    } else if (format === 'png') {
      await exportPageImage(filename);
      return;
    }
    showNotice(`${format.toUpperCase()} export downloaded.`, 'success');
    exportDialog.close();
  }

  function switchTab(paneId) {
    document.querySelectorAll('.workspace-tab').forEach(tab => {
      const selected = tab.dataset.pane === paneId;
      tab.classList.toggle('active', selected);
      tab.setAttribute('aria-selected', String(selected));
    });
    document.querySelectorAll('.result-pane').forEach(pane => {
      const selected = pane.id === paneId;
      pane.classList.toggle('active', selected);
      pane.hidden = !selected;
    });
    if (paneId === 'paneJson') renderJsonView();
  }

  /**
   * Load Document Data
   */
  function loadDocument(key) {
    currentDocKey = key;
    const docData = DEMO_DATA[key];
    if (!docData) return;
    pagesMetric.innerText = String(docData.pages.length);
    updateFileSummary();

    pagesWrapper.innerHTML = '';
    layoutPages.innerHTML = '';

    docData.pages.forEach((page, pIdx) => {
      // 1. Column 1: Page Image & BBox Layer
      const pageContainer = document.createElement('div');
      pageContainer.className = 'doc-page-container';
      pageContainer.id = `docPage_${page.pageNumber}`;
      pageContainer.style.aspectRatio = page.aspectRatio;

      const img = document.createElement('img');
      img.className = 'doc-page-image';
      img.src = page.image;
      img.alt = `Page ${page.pageNumber}`;

      const bboxLayer = document.createElement('div');
      bboxLayer.className = 'bbox-layer';
      bboxLayer.id = `bboxLayer_${page.pageNumber}`;

      pageContainer.appendChild(img);
      pageContainer.appendChild(bboxLayer);
      pagesWrapper.appendChild(pageContainer);

      // Create a page group for the extracted-content view.
      const layoutPageCard = document.createElement('div');
      layoutPageCard.className = 'layout-page-card';
      layoutPageCard.id = `layoutPageCard_${page.pageNumber}`;
      const pageHeading = document.createElement('h3');
      pageHeading.className = 'layout-page-heading';
      pageHeading.textContent = `Page ${page.pageNumber}`;
      layoutPageCard.appendChild(pageHeading);
      layoutPages.appendChild(layoutPageCard);
    });

    prepareTokenSequence(docData);
    updateCounts();
    if (jsonCode) jsonCode.innerText = '{}';
    updateStatus('Ready', 'ready');
  }

  /**
   * Prepare Token Stream Sequence from ground truth
   */
  function prepareTokenSequence(docData) {
    tokenSequence = [];
    docData.pages.forEach(page => {
      // Add <PAGE> token
      tokenSequence.push({
        type: 'page_header',
        pageNumber: page.pageNumber,
        rawText: `<PAGE>\n`
      });

      page.blocks.forEach(block => {
        // block starts
        const coordsStr = `[${block.bbox.join(', ')}]`;
        const tagText = `<|det|>${block.category} ${coordsStr}<|/det|>`;
        
        tokenSequence.push({
          type: 'block_start',
          blockId: block.id,
          pageNumber: page.pageNumber,
          category: block.category,
          bbox: block.bbox,
          tagText: tagText
        });

        // Break content into small realistic token chunks
        const words = block.content.split(' ');
        let chunk = '';
        words.forEach((w, idx) => {
          chunk += (idx > 0 ? ' ' : '') + w;
          if (chunk.length > 18 || idx === words.length - 1) {
            tokenSequence.push({
              type: 'text_chunk',
              blockId: block.id,
              pageNumber: page.pageNumber,
              text: chunk + (idx === words.length - 1 ? '\n' : '')
            });
            chunk = '';
          }
        });

        tokenSequence.push({
          type: 'block_end',
          blockId: block.id,
          pageNumber: page.pageNumber,
          category: block.category,
          bbox: block.bbox,
          content: block.content
        });
      });
    });
  }

  /**
   * Start / Resume Streaming
   */
  function onStartClick() {
    if (isStreaming) return;

    isStreaming = true;
    isPaused = false;
    btnStop.disabled = false;
    updateStatus('Streaming...', 'streaming');
    streamIndicator.classList.add('active');

    if (currentStreamIndex === 0) {
      startTime = performance.now();
      generatedTokensCount = 0;
      layoutEmptyState.style.display = 'none';
    }

    runStreamLoop();
  }

  /**
   * Stop / Pause Streaming
   */
  function onStopClick() {
    if (!isStreaming) return;
    isStreaming = false;
    isPaused = true;
    btnStop.disabled = true;
    clearTimeout(streamTimer);
    updateStatus('Paused', 'paused');
    streamIndicator.classList.remove('active');
  }

  /**
   * Reset All Panels
   */
  function resetAll() {
    clearTimeout(streamTimer);
    isStreaming = false;
    isPaused = false;
    btnStop.disabled = true;
    currentStreamIndex = 0;
    generatedTokensCount = 0;
    renderedBlocks = [];

    terminalContent.innerHTML = '';
    layoutPages.innerHTML = '';
    tableResults.innerHTML = '<div class="layout-empty-state"><div class="empty-icon">▦</div><p>No tables detected yet</p><span class="subtext">Detected tables will appear here after parsing.</span></div>';
    jsonCode.innerText = '{}';
    layoutEmptyState.style.display = 'flex';

    // Clear bboxes
    document.querySelectorAll('.bbox-layer').forEach(layer => layer.innerHTML = '');

    // Reset layout page containers
    const docData = DEMO_DATA[currentDocKey];
    if (docData) {
      docData.pages.forEach(page => {
        const layoutPageCard = document.createElement('div');
        layoutPageCard.className = 'layout-page-card';
        layoutPageCard.id = `layoutPageCard_${page.pageNumber}`;
        const pageHeading = document.createElement('h3');
        pageHeading.className = 'layout-page-heading';
        pageHeading.textContent = `Page ${page.pageNumber}`;
        layoutPageCard.appendChild(pageHeading);
        layoutPages.appendChild(layoutPageCard);
      });
    }

    updateCounts();
    streamIndicator.classList.remove('active');
    updateStatus('Ready', 'ready');
  }

  /**
   * Stream Processing Loop
   */
  function runStreamLoop() {
    if (!isStreaming) return;

    if (currentStreamIndex >= tokenSequence.length) {
      // Completed
      isStreaming = false;
      btnStop.disabled = true;
      updateStatus('Completed', 'completed');
      streamIndicator.classList.remove('active');
      return;
    }

    const item = tokenSequence[currentStreamIndex];
    processStreamItem(item);
    currentStreamIndex++;

    // Calculate TPS
    generatedTokensCount += (item.text ? item.text.split(/\s+/).length : 2);
    const elapsedSec = (performance.now() - startTime) / 1000;

    // Delay based on speed selection
    const speed = parseInt(speedSelect.value, 10);
    let delay = speed >= 9999 ? 0 : Math.max(5, Math.round(1000 / speed));

    if (delay === 0) {
      // Fast forward all in one tick
      while (currentStreamIndex < tokenSequence.length && isStreaming) {
        processStreamItem(tokenSequence[currentStreamIndex]);
        currentStreamIndex++;
        generatedTokensCount += 3;
      }
      isStreaming = false;
      btnStop.disabled = true;
      updateStatus('Completed', 'completed');
      streamIndicator.classList.remove('active');
      return;
    }

    streamTimer = setTimeout(runStreamLoop, delay);
  }

  /**
   * Process an individual stream item
   */
  function processStreamItem(item) {
    if (item.type === 'page_header') {
      appendPageHeaderToTerminal(item.pageNumber);
    } else if (item.type === 'block_start') {
      appendBlockStartToTerminal(item);
      createOrUpdateBoundingBox(item);
    } else if (item.type === 'text_chunk') {
      appendTextChunkToTerminal(item);
    } else if (item.type === 'block_end') {
      finalizeBlock(item);
    }

    if (autoScroll.checked) {
      rawTerminal.scrollTop = rawTerminal.scrollHeight;
    }
  }

  /**
   * Column 2 Terminal Helpers
   */
  let currentTerminalBlockSpan = null;

  function appendPageHeaderToTerminal(pageNumber) {
    const span = document.createElement('div');
    span.className = 'token-page';
    span.innerText = `<PAGE> [Page ${pageNumber}]`;
    terminalContent.appendChild(span);
    terminalContent.appendChild(document.createTextNode('\n'));
  }

  function appendBlockStartToTerminal(item) {
    currentTerminalBlockSpan = document.createElement('div');
    currentTerminalBlockSpan.className = 'token-block-wrapper';
    currentTerminalBlockSpan.id = `terminalBlock_${item.blockId}`;
    currentTerminalBlockSpan.dataset.blockId = item.blockId;

    // Syntax highlight tags
    const catClass = `token-tag-${item.category}`;
    const coordsStr = `[${item.bbox.join(', ')}]`;

    currentTerminalBlockSpan.innerHTML = `
      <span class="token-det-open">&lt;|det|&gt;</span><span class="${catClass}">${item.category}</span> <span class="token-coords">${coordsStr}</span><span class="token-det-close">&lt;|/det|&gt;</span>
      <span class="token-content-span"></span>
    `;

    // Add hover sync
    currentTerminalBlockSpan.addEventListener('mouseenter', () => highlightElement(item.blockId));
    currentTerminalBlockSpan.addEventListener('mouseleave', () => unhighlightElement(item.blockId));

    terminalContent.appendChild(currentTerminalBlockSpan);
  }

  function appendTextChunkToTerminal(item) {
    if (!currentTerminalBlockSpan) return;
    const contentSpan = currentTerminalBlockSpan.querySelector('.token-content-span');
    if (contentSpan) {
      contentSpan.appendChild(document.createTextNode(item.text));
    }
  }

  /**
   * Create Bounding Box Overlay on Document Page (Column 1)
   * Normalized coordinates [x1, y1, x2, y2] on 0..1000 scale
   */
  function createOrUpdateBoundingBox(item) {
    const layer = document.getElementById(`bboxLayer_${item.pageNumber}`);
    if (!layer) return;

    let bbox = document.getElementById(`bbox_${item.blockId}`);
    if (!bbox) {
      bbox = document.createElement('div');
      bbox.className = `bbox ${item.category} newly-generated`;
      bbox.id = `bbox_${item.blockId}`;
      bbox.dataset.blockId = item.blockId;

      const [x1, y1, x2, y2] = item.bbox;
      bbox.style.left = `${x1 / 10}%`;
      bbox.style.top = `${y1 / 10}%`;
      bbox.style.width = `${Math.max(1, (x2 - x1) / 10)}%`;
      bbox.style.height = `${Math.max(1.2, (y2 - y1) / 10)}%`;

      const tooltip = document.createElement('div');
      tooltip.className = 'bbox-tooltip';
      tooltip.innerText = `${item.category} [${x1}, ${y1}, ${x2}, ${y2}]`;
      bbox.appendChild(tooltip);

      // Hover sync
      bbox.addEventListener('mouseenter', () => highlightElement(item.blockId));
      bbox.addEventListener('mouseleave', () => unhighlightElement(item.blockId));

      layer.appendChild(bbox);

      // Scroll document to keep active box visible if needed
      const docViewer = document.getElementById('documentViewer');
      if (docViewer) {
        const topPos = bbox.offsetTop;
        if (topPos > docViewer.scrollTop + docViewer.clientHeight - 80) {
          docViewer.scrollTo({ top: topPos - 120, behavior: 'smooth' });
        }
      }
    }
  }

  /**
   * Finalize detected block: Render into Column 3 (Layout View & Markdown)
   */
  function finalizeBlock(item) {
    renderedBlocks.push(item);
    updateCounts();
    if (document.getElementById('paneJson').classList.contains('active')) renderJsonView();
    layoutEmptyState.style.display = 'none';

    // Render the recognized block in the page-grouped extracted-data view.
    const layoutPageCard = document.getElementById(`layoutPageCard_${item.pageNumber}`);
    if (layoutPageCard) {
      const blockEl = document.createElement('div');
      blockEl.className = `layout-block ${item.category}`;
      blockEl.id = `layoutBlock_${item.blockId}`;
      blockEl.dataset.blockId = item.blockId;

      const meta = document.createElement('div');
      meta.className = 'layout-block-meta';
      meta.innerHTML = `<span>${escapeHtml(item.category.replaceAll('_', ' '))}</span><span>Block ${renderedBlocks.length}</span>`;
      blockEl.appendChild(meta);

      const content = document.createElement('div');
      content.className = 'layout-block-content';
      if (item.category === 'table') {
        content.innerHTML = renderMarkdownTable(item.content);
      } else {
        content.textContent = item.content;
      }
      blockEl.appendChild(content);

      // Hover sync
      blockEl.addEventListener('mouseenter', () => highlightElement(item.blockId));
      blockEl.addEventListener('mouseleave', () => unhighlightElement(item.blockId));

      layoutPageCard.appendChild(blockEl);
      if (item.category === 'table') appendDetectedTable(item);
    }
  }

  function appendDetectedTable(item) {
    const emptyState = tableResults.querySelector('.layout-empty-state');
    if (emptyState) emptyState.remove();
    const card = document.createElement('article');
    card.className = 'detected-table-card';
    const heading = document.createElement('div');
    heading.className = 'detected-table-heading';
    heading.innerHTML = `<strong>Table ${renderedBlocks.filter(block => block.category === 'table').length}</strong><span>Page ${item.pageNumber}</span>`;
    card.appendChild(heading);
    const content = document.createElement('div');
    content.className = 'table-scroll';
    content.innerHTML = renderMarkdownTable(item.content);
    card.appendChild(content);
    tableResults.appendChild(card);
  }

  /**
   * Render Markdown Table from plain markdown text
   */
  function renderMarkdownTable(mdTable) {
    const rows = parseMarkdownTable(mdTable);
    if (rows.length === 0) return `<p>${escapeHtml(mdTable)}</p>`;
    const [header, ...body] = rows;
    return `<table class="rendered-table"><thead><tr>${header.map(cell => `<th>${escapeHtml(cell)}</th>`).join('')}</tr></thead><tbody>${body.map(row => `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  /**
   * Render Full JSON Tab View
   */
  function renderJsonView() {
    const doc = DEMO_DATA[currentDocKey];
    const jsonOutput = {
      document: doc?.title || 'OCR results',
      pageCount: doc?.pages.length || 0,
      totalBlocks: renderedBlocks.length,
      blocks: renderedBlocks.map(b => ({
        id: b.blockId,
        page: b.pageNumber,
        category: b.category,
        bbox_normalized: b.bbox,
        text: b.content
      }))
    };
    jsonCode.innerText = JSON.stringify(jsonOutput, null, 2);
  }

  /**
   * 3-Way Cross-Highlight Synchronization
   */
  function highlightElement(blockId) {
    if (!blockId) return;

    // 1. Column 1 Bbox
    const bbox = document.getElementById(`bbox_${blockId}`);
    if (bbox) bbox.classList.add('highlighted');

    // 2. Column 2 Terminal block
    const termBlock = document.getElementById(`terminalBlock_${blockId}`);
    if (termBlock) termBlock.classList.add('highlighted');

    // 3. Column 3 Layout block
    const layoutBlock = document.getElementById(`layoutBlock_${blockId}`);
    if (layoutBlock) layoutBlock.classList.add('highlighted');
  }

  function unhighlightElement(blockId) {
    if (!blockId) return;

    const bbox = document.getElementById(`bbox_${blockId}`);
    if (bbox) bbox.classList.remove('highlighted');

    const termBlock = document.getElementById(`terminalBlock_${blockId}`);
    if (termBlock) termBlock.classList.remove('highlighted');

    const layoutBlock = document.getElementById(`layoutBlock_${blockId}`);
    if (layoutBlock) layoutBlock.classList.remove('highlighted');
  }

  /**
   * Update Status Pill UI
   */
  function updateStatus(text, stateClass) {
    statusText.innerText = text;
    statusPill.className = `live-status-pill ${stateClass}`;
  }

  /**
   * Handle Custom File Upload (Image or PDF)
   * Sends file to /api/upload to convert PDF pages to PNG and extract real layout blocks
   */
  async function handleCustomFileUpload(e) {
    const file = e.dataTransfer?.files?.[0] || e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'png', 'jpg', 'jpeg', 'webp', 'tif', 'tiff'].includes(extension)) {
      showNotice('Please choose a PDF, PNG, JPG, WEBP, or TIFF document.', 'error');
      fileInput.value = '';
      return;
    }

    resetAll();
    updateStatus('Uploading & processing...', 'streaming');
    showNotice(`Processing ${file.name}…`, 'info');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const resp = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      let res;
      try {
        res = await resp.json();
      } catch {
        throw new Error(`The OCR server returned an unreadable response (HTTP ${resp.status}).`);
      }
      if (!res.success || !res.data) {
        throw new Error(res.error || `The OCR server could not process this document (HTTP ${resp.status}).`);
      }

      const parsedDoc = res.data;
      const docKey = 'custom_' + Date.now();
      DEMO_DATA[docKey] = parsedDoc;
      uploadedFile = file;

      // Add to dropdown
      let opt = document.createElement('option');
      opt.value = docKey;
      opt.innerText = `Uploaded: ${file.name.substring(0, 36)}`;
      docSelect.appendChild(opt);
      docSelect.value = docKey;

      loadDocument(docKey);
      updateStatus('Ready to parse', 'ready');
      showNotice(`Document ready: ${parsedDoc.pages.length} ${parsedDoc.pages.length === 1 ? 'page' : 'pages'} prepared. Select Start parsing to review results.`, 'success');
    } catch (err) {
      console.error('Document processing error:', err);
      updateStatus('Upload Failed', 'paused');
      const isUnreachable = err instanceof TypeError && /fetch/i.test(err.message);
      const message = isUnreachable
        ? 'Cannot reach the local OCR server. Start server.py in the project folder, then reload this page and try uploading again.'
        : `Could not process document: ${err.message} Please try another supported PDF or image.`;
      showNotice(message, 'error');
    } finally {
      // Clear file input so the same file can be re-uploaded if desired
      fileInput.value = '';
    }
  }

  function removeUploadedFile() {
    if (!currentDocKey.startsWith('custom_')) return;
    const uploadedOption = docSelect.querySelector(`option[value="${CSS.escape(currentDocKey)}"]`);
    if (uploadedOption) uploadedOption.remove();
    delete DEMO_DATA[currentDocKey];
    uploadedFile = null;
    docSelect.value = currentSampleKey;
    resetAll();
    loadDocument(currentSampleKey);
    showNotice('Uploaded document removed.', 'info');
  }

  // Start initialization on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
