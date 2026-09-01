// Drag and Drop & Visual Connection Manager for ŠVP PV
import { store } from './store.js';

export class DnDManager {
  constructor() {
    this.draggedItem = null; // { type: 'outcome'|'competency'|'literacy'|'area'|'activity'|'block', data: any, sourceBlockId?: string }
    this.initGlobalListeners();
  }

  initGlobalListeners() {
    document.addEventListener('dragstart', (e) => this.handleDragStart(e));
    document.addEventListener('dragend', (e) => this.handleDragEnd(e));
    document.addEventListener('dragover', (e) => this.handleDragOver(e));
    document.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    document.addEventListener('drop', (e) => this.handleDrop(e));
  }

  handleDragStart(e) {
    const target = e.target.closest('[data-draggable]');
    if (!target) return;

    const itemType = target.dataset.itemType;
    const itemId = target.dataset.itemId;
    const sourceBlockId = target.dataset.sourceBlockId || null;

    this.draggedItem = {
      type: itemType,
      id: itemId,
      sourceBlockId,
      element: target
    };

    e.dataTransfer.effectAllowed = 'copyMove';
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: itemType, id: itemId, sourceBlockId }));

    target.classList.add('is-dragging');
    document.body.classList.add('dnd-active');

    // Highlight all valid dropzones
    const dropzones = document.querySelectorAll(`[data-dropzone-accepts*="${itemType}"]`);
    dropzones.forEach(dz => dz.classList.add('dropzone-highlight'));
  }

  handleDragEnd(e) {
    if (this.draggedItem && this.draggedItem.element) {
      this.draggedItem.element.classList.remove('is-dragging');
    }
    this.draggedItem = null;
    document.body.classList.remove('dnd-active');

    document.querySelectorAll('.dropzone-highlight').forEach(dz => {
      dz.classList.remove('dropzone-highlight');
      dz.classList.remove('dropzone-over');
    });
  }

  handleDragOver(e) {
    // Auto-scroll window when dragging near viewport top or bottom edges
    if (this.draggedItem) {
      const edgeThreshold = 90;
      const scrollSpeed = 16;
      if (e.clientY < edgeThreshold) {
        window.scrollBy(0, -scrollSpeed);
      } else if (e.clientY > window.innerHeight - edgeThreshold) {
        window.scrollBy(0, scrollSpeed);
      }
    }

    const dropzone = e.target.closest('[data-dropzone]');
    if (!dropzone || !this.draggedItem) return;

    const acceptedTypes = (dropzone.dataset.dropzoneAccepts || '').split(',');
    if (!acceptedTypes.includes(this.draggedItem.type)) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    dropzone.classList.add('dropzone-over');
  }

  handleDragLeave(e) {
    const dropzone = e.target.closest('[data-dropzone]');
    if (!dropzone) return;
    dropzone.classList.remove('dropzone-over');
  }

  handleDrop(e) {
    const dropzone = e.target.closest('[data-dropzone]');
    if (!dropzone || !this.draggedItem) return;

    const acceptedTypes = (dropzone.dataset.dropzoneAccepts || '').split(',');
    if (!acceptedTypes.includes(this.draggedItem.type)) return;

    e.preventDefault();
    dropzone.classList.remove('dropzone-over');

    const targetBlockId = dropzone.dataset.blockId;
    const targetType = dropzone.dataset.dropzoneType; // 'outcomes' | 'competencies' | 'activities' | 'blocks'

    this.processDrop(this.draggedItem, targetBlockId, targetType, dropzone);
  }

  processDrop(item, targetBlockId, targetType, dropzone) {
    if (!item) return;

    if (item.type === 'outcome' && targetBlockId) {
      store.toggleBlockOutcome(targetBlockId, item.id);
      this.playSuccessAnimation(dropzone);
    } else if (item.type === 'competency' && targetBlockId) {
      store.toggleBlockCompetency(targetBlockId, item.id);
      this.playSuccessAnimation(dropzone);
    } else if (item.type === 'literacy' && targetBlockId) {
      store.toggleBlockLiteracy(targetBlockId, item.id);
      this.playSuccessAnimation(dropzone);
    } else if (item.type === 'area' && targetBlockId) {
      store.toggleBlockArea(targetBlockId, item.id);
      this.playSuccessAnimation(dropzone);
    } else if (item.type === 'activity' && targetBlockId && item.sourceBlockId !== targetBlockId) {
      // Move activity between blocks
      const doc = store.getDoc();
      const srcBlock = doc.blocks.find(b => b.id === item.sourceBlockId);
      if (srcBlock && srcBlock.activities) {
        const act = srcBlock.activities.find(a => a.id === item.id);
        if (act) {
          store.deleteActivity(item.sourceBlockId, item.id);
          store.addActivityToBlock(targetBlockId, act);
          this.playSuccessAnimation(dropzone);
        }
      }
    } else if (item.type === 'block') {
      const sourceIdx = parseInt(item.id, 10);
      const destIdx = parseInt(dropzone.dataset.blockIndex, 10);
      if (!isNaN(sourceIdx) && !isNaN(destIdx) && sourceIdx !== destIdx) {
        store.reorderBlocks(sourceIdx, destIdx);
      }
    }
  }

  playSuccessAnimation(element) {
    element.classList.add('drop-success-pulse');
    setTimeout(() => {
      element.classList.remove('drop-success-pulse');
    }, 600);
  }
}

export const dnd = new DnDManager();
