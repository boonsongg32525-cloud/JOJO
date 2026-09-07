/**
 * OS.com - Smart Document Cloud OS
 * Complete Document Management Application Logic
 * Implements all 10 Core Features + Interactive Image Viewer & Gallery System
 */

// ==========================================================================
// 1. STATE & STORAGE MANAGEMENT
// ==========================================================================

const STORAGE_KEY = 'os_documents_v2';
const THEME_KEY = 'os_theme_settings_v1';
const CUSTOM_WALLPAPER_KEY = 'os_custom_wallpaper_v1';

let appState = {
    documents: [],
    currentView: 'all',          // 'all', 'images', 'recent', 'folders', 'merged', 'favorites', 'trash'
    currentFolderId: null,      // null = root, or folder ID string
    searchQuery: '',
    dateFilter: 'all',          // 'all', 'today', 'week', 'month'
    sortBy: 'date-desc',        // 'date-desc', 'date-asc', 'name-asc', 'name-desc', 'size-desc'
    viewMode: 'grid',           // 'grid', 'list'
    selectedItemIds: new Set(),
    activeContextMenuTargetId: null,
    itemPendingDelete: null,
    itemPendingRename: null,

    // Image Viewer Specific State
    activeImageIndex: 0,
    currentImageList: [],
    imageZoom: 1,
    imageRotation: 0,
    isPanning: false,
    panStart: { x: 0, y: 0 },
    panOffset: { x: 0, y: 0 }
};

// High quality vector SVG Data URIs for realistic sample images
const SAMPLE_IMAGE_1 = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'><defs><linearGradient id='bg' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%230f172a'/><stop offset='50%' stop-color='%231e1b4b'/><stop offset='100%' stop-color='%230284c7'/></linearGradient><linearGradient id='g1' x1='0%' y1='0%' x2='100%' y2='0%'><stop offset='0%' stop-color='%2338bdf8'/><stop offset='100%' stop-color='%23818cf8'/></linearGradient></defs><rect width='1200' height='800' fill='url(%23bg)'/><circle cx='600' cy='320' r='180' fill='%2338bdf8' opacity='0.15'/><rect x='200' y='140' width='800' height='460' rx='24' fill='rgba(255,255,255,0.08)' stroke='rgba(255,255,255,0.2)' stroke-width='2'/><text x='600' y='260' fill='%23ffffff' font-family='sans-serif' font-size='42' font-weight='bold' text-anchor='middle'>OS.com System Architecture</text><text x='600' y='320' fill='%2338bdf8' font-family='sans-serif' font-size='24' text-anchor='middle'>แผนผังสถาปัตยกรรมระบบคลาวด์และดาต้าเบส 2026</text><rect x='280' y='380' width='180' height='120' rx='16' fill='url(%23g1)'/><text x='370' y='435' fill='%23ffffff' font-family='sans-serif' font-size='20' font-weight='bold' text-anchor='middle'>Frontend UI</text><text x='370' y='465' fill='%230f172a' font-family='sans-serif' font-size='14' text-anchor='middle'>Glassmorphism OS</text><rect x='510' y='380' width='180' height='120' rx='16' fill='%2310b981'/><text x='600' y='435' fill='%23ffffff' font-family='sans-serif' font-size='20' font-weight='bold' text-anchor='middle'>Core Engine</text><text x='600' y='465' fill='%23ffffff' font-family='sans-serif' font-size='14' text-anchor='middle'>Search &amp; Storage</text><rect x='740' y='380' width='180' height='120' rx='16' fill='%23f59e0b'/><text x='830' y='435' fill='%23ffffff' font-family='sans-serif' font-size='20' font-weight='bold' text-anchor='middle'>Cloud Storage</text><text x='830' y='465' fill='%23ffffff' font-family='sans-serif' font-size='14' text-anchor='middle'>LocalStorage &amp; Blob</text><text x='600' y='680' fill='rgba(255,255,255,0.6)' font-family='sans-serif' font-size='18' text-anchor='middle'>ระบบจัดการเอกสารอัจฉริยะ OS.com &bull; Resolution: 1200x800</text></svg>";

const SAMPLE_IMAGE_2 = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1000' height='750' viewBox='0 0 1000 750'><defs><linearGradient id='sunset' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%233b0764'/><stop offset='50%' stop-color='%23be123c'/><stop offset='100%' stop-color='%23fb923c'/></linearGradient></defs><rect width='1000' height='750' fill='url(%23sunset)'/><circle cx='500' cy='380' r='140' fill='%23fef08a' opacity='0.9'/><path d='M 0 520 Q 250 420 500 520 T 1000 520 L 1000 750 L 0 750 Z' fill='%231e1b4b' opacity='0.8'/><path d='M 0 580 Q 250 490 500 580 T 1000 580 L 1000 750 L 0 750 Z' fill='%230f172a'/><text x='500' y='200' fill='%23ffffff' font-family='sans-serif' font-size='36' font-weight='bold' text-anchor='middle'>ภาพถ่ายบรรยากาศ_Team_Camp_2026.jpg</text><text x='500' y='680' fill='%23fed7aa' font-family='sans-serif' font-size='20' text-anchor='middle'>กิจกรรมประจำปี &bull; บริษัท โอเอสดอทคอม จำกัด</text></svg>";

const SAMPLE_IMAGE_3 = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'><defs><linearGradient id='neon' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23030712'/><stop offset='100%' stop-color='%23064e3b'/></linearGradient></defs><rect width='800' height='800' fill='url(%23neon)'/><circle cx='400' cy='400' r='250' fill='none' stroke='%2310b981' stroke-width='8' stroke-dasharray='20,10'/><polygon points='400,240 540,480 260,480' fill='%2310b981' opacity='0.7'/><text x='400' y='570' fill='%23ffffff' font-family='sans-serif' font-size='34' font-weight='bold' text-anchor='middle'>OS.com Cyber Icon</text><text x='400' y='620' fill='%236ee7b7' font-family='sans-serif' font-size='18' text-anchor='middle'>โลโก้ความละเอียดสูง 800x800 PNG</text></svg>";

// Initial Sample Data with Rich Documents & Images
const SAMPLE_DOCUMENTS = [
    {
        id: 'doc-sample-img-1',
        name: 'แผนผังสถาปัตยกรรมระบบ_OS.png',
        type: 'png',
        content: SAMPLE_IMAGE_1,
        size: 1450000,
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        parentId: null,
        isFolder: false,
        isMerged: false,
        isStarred: true,
        isDeleted: false,
        deletedAt: null,
        tags: ['รูปภาพ', 'สถาปัตยกรรม', 'แผนผัง']
    },
    {
        id: 'doc-sample-img-2',
        name: 'ภาพถ่ายบรรยากาศ_Team_Camp_2026.jpg',
        type: 'jpg',
        content: SAMPLE_IMAGE_2,
        size: 2120000,
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        parentId: null,
        isFolder: false,
        isMerged: false,
        isStarred: false,
        isDeleted: false,
        deletedAt: null,
        tags: ['รูปภาพ', 'กิจกรรม', 'ทีมงาน']
    },
    {
        id: 'doc-sample-img-3',
        name: 'โลโก้แบรนด์_OS_Cloud_HighRes.png',
        type: 'png',
        content: SAMPLE_IMAGE_3,
        size: 890000,
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        parentId: null,
        isFolder: false,
        isMerged: false,
        isStarred: true,
        isDeleted: false,
        deletedAt: null,
        tags: ['รูปภาพ', 'โลโก้', 'การตลาด']
    },
    {
        id: 'doc-sample-1',
        name: 'รายงานผลการดำเนินงาน_ประจำปี_2569.pdf',
        type: 'pdf',
        content: '=== รายงานผลการดำเนินงานและงบประมาณประจำปี 2569 ===\n\n1. สรุปภาพรวม:\n- ผลประกอบการเติบโตขึ้น 24.5% เทียบกับปีก่อนหน้า\n- มีการขยายฐานผู้ใช้งานระบบคลาวด์เพิ่มขึ้น 40,000 ราย\n\n2. แผนกลยุทธ์ไตรมาสถัดไป:\n- พัฒนาระบบจัดเก็บเอกสาร OS.com เวอร์ชัน 2.0\n- เพิ่มระบบความปลอดภัยและการเข้ารหัสระดับสูง',
        size: 2450000,
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        parentId: null,
        isFolder: false,
        isMerged: false,
        isStarred: true,
        isDeleted: false,
        deletedAt: null,
        tags: ['งบการเงิน', 'รายงานประจำปี', 'ด่วน']
    },
    {
        id: 'doc-sample-2',
        name: 'สัญญาการให้บริการซอฟต์แวร์_CloudOS.docx',
        type: 'docx',
        content: '=== สัญญาการให้บริการคลาวด์ซอฟต์แวร์ ===\n\nสัญญานี้ทำขึ้นระหว่าง บริษัท โอเอสดอทคอม จำกัด กับ ผู้ใช้บริการ\nข้อ 1. ผู้ให้บริการตกลงให้บริการจัดเก็บและค้นหาเอกสารออนไลน์ตลอด 24 ชั่วโมง\nข้อ 2. ผู้ใช้บริการสามารถดาวน์โหลดและรวมเอกสารได้ตามความต้องการ\nข้อ 3. การเก็บรักษาความลับของข้อมูล',
        size: 1120000,
        createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        parentId: null,
        isFolder: false,
        isMerged: false,
        isStarred: false,
        isDeleted: false,
        deletedAt: null,
        tags: ['สัญญา', 'กฎหมาย']
    },
    {
        id: 'doc-sample-3',
        name: 'บันทึกการประชุม_ทีมพัฒนาระบบ_OS.txt',
        type: 'txt',
        content: 'บันทึกการประชุมประจำสัปดาห์:\n- สรุปการทดสอบระบบค้นหาเอกสาร (Feature 1): ทำงานได้รวดเร็วแบบ Real-time\n- ระบบจัดเก็บตามวันที่และตัวอักษร (Feature 2, 3): จัดเรียงได้แม่นยำ\n- ระบบถังขยะและกู้คืน (Feature 4, 5): ยืนยันการลบและกู้คืนสมบูรณ์แบบ\n- เพิ่มระบบดูรูปภาพความละเอียดสูง (Image Viewer): ซูม หมุน และสไลด์รูปได้ลื่นไหล',
        size: 34500,
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        parentId: null,
        isFolder: false,
        isMerged: false,
        isStarred: true,
        isDeleted: false,
        deletedAt: null,
        tags: ['การประชุม', 'OS.com']
    },
    {
        id: 'folder-sample-1',
        name: 'เอกสารโครงการพัฒนา_2026',
        type: 'folder',
        content: '',
        size: 0,
        createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
        parentId: null,
        isFolder: true,
        isMerged: false,
        isStarred: false,
        isDeleted: false,
        deletedAt: null,
        tags: ['โปรเจกต์'],
        color: '#3b82f6'
    },
    {
        id: 'doc-sample-4',
        name: 'ตารางแผนงบประมาณ_Q3_Q4.xlsx',
        type: 'xlsx',
        content: 'งวดงาน, งบประมาณที่ขอ, งบประมาณที่ได้รับ, คงเหลือ\nไตรมาส 3, 500,000 บาท, 480,000 บาท, 20,000 บาท\nไตรมาส 4, 750,000 บาท, 750,000 บาท, 0 บาท',
        size: 580000,
        createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
        parentId: 'folder-sample-1',
        isFolder: false,
        isMerged: false,
        isStarred: false,
        isDeleted: false,
        deletedAt: null,
        tags: ['งบประมาณ']
    },
    {
        id: 'doc-sample-5',
        name: 'เอกสารเก่า_แบบร่างแบบฟอร์ม_ลบทิ้ง.txt',
        type: 'txt',
        content: 'เอกสารแบบร่างเก่าที่ไม่ใช้งานแล้ว ย้ายมาไว้ที่ถังขยะ สามารถกู้คืนหรือลบถาวรได้',
        size: 15200,
        createdAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
        parentId: null,
        isFolder: false,
        isMerged: false,
        isStarred: false,
        isDeleted: true,
        deletedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        tags: ['ขยะ']
    }
];

// Audio cues using Web Audio API
const SoundFX = {
    ctx: null,
    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) this.ctx = new AudioContext();
        }
    },
    play(type) {
        try {
            this.init();
            if (!this.ctx) return;
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);

            const now = this.ctx.currentTime;
            if (type === 'click') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
            } else if (type === 'delete') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(320, now);
                osc.frequency.exponentialRampToValueAtTime(140, now + 0.15);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
            } else if (type === 'restore') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(260, now);
                osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                osc.start(now);
                osc.stop(now + 0.12);
            } else if (type === 'success') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, now);
                osc.frequency.setValueAtTime(659.25, now + 0.08);
                gain.gain.setValueAtTime(0.09, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
                osc.start(now);
                osc.stop(now + 0.22);
            }
        } catch (e) {
            // Audio not available or blocked
        }
    }
};

// Load and Save LocalStorage
function loadDocuments() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            appState.documents = JSON.parse(data);
        } else {
            appState.documents = [...SAMPLE_DOCUMENTS];
            saveDocuments();
        }
    } catch (e) {
        console.error('Error loading documents:', e);
        appState.documents = [...SAMPLE_DOCUMENTS];
    }
}

function saveDocuments() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.documents));
        updateStorageWidget();
        updateSidebarBadges();
    } catch (e) {
        console.error('Error saving documents:', e);
        showToast('ไม่สามารถบันทึกข้อมูลลง LocalStorage ได้ พื้นที่อาจเต็ม', 'danger');
    }
}

// Helper: Check if document is an image
function isImageItem(item) {
    if (!item || item.isFolder) return false;
    const type = (item.type || '').toLowerCase();
    const ext = item.name.split('.').pop().toLowerCase();
    const imgExts = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'];
    return imgExts.includes(type) || imgExts.includes(ext);
}

// ==========================================================================
// 2. DOM ELEMENTS CACHE
// ==========================================================================
const DOM = {
    // Topbar
    globalSearch: document.getElementById('global-search'),
    btnClearSearch: document.getElementById('btn-clear-search'),
    btnHome: document.getElementById('btn-home'),
    breadcrumbContainer: document.getElementById('breadcrumb-container'),
    btnOpenThemeModal: document.getElementById('btn-open-theme-modal'),
    btnCreateDoc: document.getElementById('btn-create-doc'),
    btnUploadFile: document.getElementById('btn-upload-file'),
    fileInputHidden: document.getElementById('file-input-hidden'),
    clockTime: document.getElementById('clock-time'),
    clockDate: document.getElementById('clock-date'),
    
    // Sidebar
    sidebarMenuItems: document.querySelectorAll('.os-sidebar .menu-item[data-view]'),
    dateFilterMenuItems: document.querySelectorAll('.date-filter-item'),
    badgeAllCount: document.getElementById('badge-all-count'),
    badgeImagesCount: document.getElementById('badge-images-count'),
    badgeFoldersCount: document.getElementById('badge-folders-count'),
    badgeMergedCount: document.getElementById('badge-merged-count'),
    badgeTrashCount: document.getElementById('badge-trash-count'),
    storageUsageText: document.getElementById('storage-usage-text'),
    storageProgressBar: document.getElementById('storage-progress-bar'),

    // Viewport
    currentViewTitle: document.getElementById('current-view-title'),
    itemsCountTag: document.getElementById('items-count-tag'),
    btnMergeAction: document.getElementById('btn-merge-action'),
    selectedCount: document.getElementById('selected-count'),
    btnDownloadSelected: document.getElementById('btn-download-selected'),
    btnDeleteSelected: document.getElementById('btn-delete-selected'),
    btnNewFolder: document.getElementById('btn-new-folder'),
    btnSortToggle: document.getElementById('btn-sort-toggle'),
    currentSortLabel: document.getElementById('current-sort-label'),
    sortDropdownMenu: document.getElementById('sort-dropdown-menu'),
    btnViewGrid: document.getElementById('btn-view-grid'),
    btnViewList: document.getElementById('btn-view-list'),
    trashBanner: document.getElementById('trash-banner'),
    btnRestoreAll: document.getElementById('btn-restore-all'),
    btnEmptyTrash: document.getElementById('btn-empty-trash'),
    activeFilterBar: document.getElementById('active-filter-bar'),
    filterChipsContainer: document.getElementById('filter-chips-container'),
    btnResetFilters: document.getElementById('btn-reset-filters'),
    fileDropOverlay: document.getElementById('file-drop-overlay'),
    itemsContainer: document.getElementById('items-container'),
    emptyState: document.getElementById('empty-state'),
    emptyTitle: document.getElementById('empty-title'),
    emptyDesc: document.getElementById('empty-desc'),
    btnEmptyCreate: document.getElementById('btn-empty-create'),
    btnEmptyUpload: document.getElementById('btn-empty-upload'),

    // Modals
    // 1. Delete Confirm
    modalDeleteConfirm: document.getElementById('modal-delete-confirm'),
    modalDeleteTitle: document.getElementById('modal-delete-title'),
    modalDeleteDesc: document.getElementById('modal-delete-desc'),
    deleteItemName: document.getElementById('delete-item-name'),
    deleteNoticeText: document.getElementById('delete-notice-text'),
    btnDeleteCancel: document.getElementById('btn-delete-cancel'),
    btnDeleteConfirm: document.getElementById('btn-delete-confirm'),

    // 2. Rename
    modalRename: document.getElementById('modal-rename'),
    renameInput: document.getElementById('rename-input'),
    btnCloseRenameModal: document.getElementById('btn-close-rename-modal'),
    btnRenameCancel: document.getElementById('btn-rename-cancel'),
    btnRenameSave: document.getElementById('btn-rename-save'),
    formRename: document.getElementById('form-rename'),

    // 3. New Folder
    modalNewFolder: document.getElementById('modal-new-folder'),
    folderNameInput: document.getElementById('folder-name-input'),
    folderColorOptions: document.getElementById('folder-color-options'),
    btnCloseFolderModal: document.getElementById('btn-close-folder-modal'),
    btnFolderCancel: document.getElementById('btn-folder-cancel'),
    btnFolderSave: document.getElementById('btn-folder-save'),
    formNewFolder: document.getElementById('form-new-folder'),

    // 4. Merge
    modalMerge: document.getElementById('modal-merge'),
    mergeNameInput: document.getElementById('merge-name-input'),
    mergeNameLabel: document.getElementById('merge-name-label'),
    mergeItemsCount: document.getElementById('merge-items-count'),
    mergeSelectedList: document.getElementById('merge-selected-list'),
    mergeTabBtns: document.querySelectorAll('.merge-tab-btn'),
    btnCloseMergeModal: document.getElementById('btn-close-merge-modal'),
    btnMergeCancel: document.getElementById('btn-merge-cancel'),
    btnMergeConfirm: document.getElementById('btn-merge-confirm'),

    // 5. Theme
    modalTheme: document.getElementById('modal-theme'),
    btnCloseThemeModal: document.getElementById('btn-close-theme-modal'),
    btnThemeDone: document.getElementById('btn-theme-done'),
    themePresetsGrid: document.getElementById('theme-presets-grid'),
    customWallpaperDropzone: document.getElementById('custom-wallpaper-dropzone'),
    wallpaperFileInput: document.getElementById('wallpaper-file-input'),
    wallpaperUploadPlaceholder: document.getElementById('wallpaper-upload-placeholder'),
    customWallpaperPreview: document.getElementById('custom-wallpaper-preview'),
    customWallpaperImg: document.getElementById('custom-wallpaper-img'),
    btnChangeWallpaper: document.getElementById('btn-change-wallpaper'),
    btnRemoveWallpaper: document.getElementById('btn-remove-wallpaper'),
    sliderBlur: document.getElementById('slider-blur'),
    valBlur: document.getElementById('val-blur'),
    sliderOpacity: document.getElementById('slider-opacity'),
    valOpacity: document.getElementById('val-opacity'),
    osWallpaper: document.getElementById('os-wallpaper'),

    // 6. Editor (Create/Edit doc)
    modalEditor: document.getElementById('modal-editor'),
    editorModalTitle: document.getElementById('editor-modal-title'),
    docTitleInput: document.getElementById('doc-title-input'),
    docTypeSelect: document.getElementById('doc-type-select'),
    docTagsInput: document.getElementById('doc-tags-input'),
    docContentInput: document.getElementById('doc-content-input'),
    btnCloseEditorModal: document.getElementById('btn-close-editor-modal'),
    btnEditorCancel: document.getElementById('btn-editor-cancel'),
    btnEditorSave: document.getElementById('btn-editor-save'),
    formEditor: document.getElementById('form-editor'),

    // 7. Document Text Viewer
    modalViewer: document.getElementById('modal-viewer'),
    viewerTypeIcon: document.getElementById('viewer-type-icon'),
    viewerDocTitle: document.getElementById('viewer-doc-title'),
    viewerMetaDate: document.getElementById('viewer-meta-date'),
    viewerMetaSize: document.getElementById('viewer-meta-size'),
    viewerMetaTags: document.getElementById('viewer-meta-tags'),
    viewerContentContainer: document.getElementById('viewer-content-container'),
    btnViewerDownload: document.getElementById('btn-viewer-download'),
    btnViewerEdit: document.getElementById('btn-viewer-edit'),
    btnViewerClose: document.getElementById('btn-viewer-close'),
    btnCloseViewerModal: document.getElementById('btn-close-viewer-modal'),

    // 8. NEW: Image Viewer Modal
    modalImageViewer: document.getElementById('modal-image-viewer'),
    imgViewerTitle: document.getElementById('img-viewer-title'),
    imgViewerDimensions: document.getElementById('img-viewer-dimensions'),
    btnImgZoomOut: document.getElementById('btn-img-zoom-out'),
    btnImgZoomIn: document.getElementById('btn-img-zoom-in'),
    btnImgZoomReset: document.getElementById('btn-img-zoom-reset'),
    imgZoomLevelText: document.getElementById('img-zoom-level-text'),
    btnImgRotateLeft: document.getElementById('btn-img-rotate-left'),
    btnImgRotateRight: document.getElementById('btn-img-rotate-right'),
    btnImgDownload: document.getElementById('btn-img-download'),
    btnImgDelete: document.getElementById('btn-img-delete'),
    btnCloseImageViewer: document.getElementById('btn-close-image-viewer'),
    imgViewerViewport: document.getElementById('img-viewer-viewport'),
    imgCanvasStage: document.getElementById('img-canvas-stage'),
    imgViewerMainSrc: document.getElementById('img-viewer-main-src'),
    btnImgPrev: document.getElementById('btn-img-prev'),
    btnImgNext: document.getElementById('btn-img-next'),
    imgChipDate: document.getElementById('img-chip-date'),
    imgChipSize: document.getElementById('img-chip-size'),
    imgChipCounter: document.getElementById('img-chip-counter'),
    imgThumbnailsStrip: document.getElementById('img-thumbnails-strip'),

    // Context Menu
    customContextMenu: document.getElementById('custom-context-menu'),
    contextItemActions: document.getElementById('context-item-actions'),
    ctxOpen: document.getElementById('ctx-open'),
    ctxDownload: document.getElementById('ctx-download'),
    ctxStar: document.getElementById('ctx-star'),
    ctxRename: document.getElementById('ctx-rename'),
    ctxNewFolder: document.getElementById('ctx-new-folder'),
    ctxMerge: document.getElementById('ctx-merge'),
    ctxDelete: document.getElementById('ctx-delete'),
    ctxRestore: document.getElementById('ctx-restore'),
    ctxDeletePermanent: document.getElementById('ctx-delete-permanent'),

    // Toast Container
    toastContainer: document.getElementById('toast-container')
};

// ==========================================================================
// 3. CORE RENDERING ENGINE & FILTERING (Feature 1, 2, 3, 5, 9)
// ==========================================================================

function getFilteredAndSortedDocuments() {
    let list = [...appState.documents];

    // Filter by View
    if (appState.currentView === 'trash') {
        list = list.filter(item => item.isDeleted);
    } else {
        // Active documents only
        list = list.filter(item => !item.isDeleted);

        if (appState.currentView === 'all') {
            if (appState.currentFolderId) {
                list = list.filter(item => item.parentId === appState.currentFolderId);
            } else {
                list = list.filter(item => !item.parentId);
            }
        } else if (appState.currentView === 'images') {
            list = list.filter(item => isImageItem(item));
        } else if (appState.currentView === 'recent') {
            list = list.filter(item => !item.isFolder);
        } else if (appState.currentView === 'folders') {
            list = list.filter(item => item.isFolder);
        } else if (appState.currentView === 'merged') {
            list = list.filter(item => item.isMerged);
        } else if (appState.currentView === 'favorites') {
            list = list.filter(item => item.isStarred);
        }
    }

    // Feature 1: Global Search Query
    if (appState.searchQuery.trim()) {
        const q = appState.searchQuery.toLowerCase().trim();
        list = list.filter(item => {
            const nameMatch = item.name.toLowerCase().includes(q);
            const contentMatch = (typeof item.content === 'string' && !item.content.startsWith('data:image'))
                ? item.content.toLowerCase().includes(q) : false;
            const tagsMatch = (item.tags || []).some(t => t.toLowerCase().includes(q));
            const typeMatch = (item.type || '').toLowerCase().includes(q);
            return nameMatch || contentMatch || tagsMatch || typeMatch;
        });
    }

    // Feature 2: Date Storage Filter
    if (appState.dateFilter !== 'all') {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfWeek = startOfToday - 7 * 24 * 60 * 60 * 1000;
        const startOfMonth = startOfToday - 30 * 24 * 60 * 60 * 1000;

        list = list.filter(item => {
            const itemTime = new Date(item.createdAt).getTime();
            if (appState.dateFilter === 'today') return itemTime >= startOfToday;
            if (appState.dateFilter === 'week') return itemTime >= startOfWeek;
            if (appState.dateFilter === 'month') return itemTime >= startOfMonth;
            return true;
        });
    }

    // Feature 3 & 2: Alphabetical and Date Sorting
    list.sort((a, b) => {
        if (appState.currentView !== 'trash') {
            if (a.isFolder && !b.isFolder) return -1;
            if (!a.isFolder && b.isFolder) return 1;
        }

        if (appState.sortBy === 'name-asc') {
            return a.name.localeCompare(b.name, 'th', { sensitivity: 'base' });
        } else if (appState.sortBy === 'name-desc') {
            return b.name.localeCompare(a.name, 'th', { sensitivity: 'base' });
        } else if (appState.sortBy === 'date-desc') {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (appState.sortBy === 'date-asc') {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (appState.sortBy === 'size-desc') {
            return (b.size || 0) - (a.size || 0);
        }
        return 0;
    });

    return list;
}

function renderWorkspace() {
    const filteredItems = getFilteredAndSortedDocuments();
    DOM.itemsContainer.innerHTML = '';

    // Update Title & Badge
    updateViewHeader(filteredItems.length);

    // Update Selection Toolbar
    updateSelectionToolbar();

    // Toggle Empty State
    if (filteredItems.length === 0) {
        DOM.emptyState.style.display = 'flex';
        DOM.itemsContainer.style.display = 'none';
        
        if (appState.searchQuery) {
            DOM.emptyTitle.textContent = `ไม่พบเอกสารที่ตรงกับ "${appState.searchQuery}"`;
            DOM.emptyDesc.textContent = 'ลองตรวจสอบตัวสะกด หรือล้างการค้นหาเพื่อดูเอกสารทั้งหมด';
        } else if (appState.currentView === 'trash') {
            DOM.emptyTitle.textContent = 'ถังขยะว่างเปล่า';
            DOM.emptyDesc.textContent = 'ไม่มีเอกสารที่ถูกลบอยู่ในถังขยะในขณะนี้';
        } else if (appState.currentView === 'images') {
            DOM.emptyTitle.textContent = 'ยังไม่มีไฟล์รูปภาพ';
            DOM.emptyDesc.textContent = 'คุณสามารถลากไฟล์รูปภาพมาวางหรือกดปุ่ม "อัปโหลด" เพื่อเพิ่มรูปภาพได้ทันที';
        } else if (appState.currentFolderId) {
            DOM.emptyTitle.textContent = 'โฟลเดอร์นี้ยังไม่มีเอกสาร';
            DOM.emptyDesc.textContent = 'คุณสามารถสร้างเอกสารใหม่ ลากไฟล์มาวาง หรือย้ายไฟล์เข้ามาได้';
        } else {
            DOM.emptyTitle.textContent = 'ยังไม่มีเอกสารในส่วนนี้';
            DOM.emptyDesc.textContent = 'เริ่มต้นโดยการกดปุ่ม "สร้างเอกสาร" หรือ "อัปโหลด" ด้านบน';
        }
    } else {
        DOM.emptyState.style.display = 'none';
        DOM.itemsContainer.style.display = appState.viewMode === 'grid' ? 'grid' : 'flex';
        DOM.itemsContainer.className = `items-view-container ${appState.viewMode}-view`;

        // Render each item
        filteredItems.forEach(item => {
            const cardEl = createItemCardElement(item);
            DOM.itemsContainer.appendChild(cardEl);
        });
    }

    // Render Breadcrumb
    renderBreadcrumb();
}

function createItemCardElement(item) {
    const isSelected = appState.selectedItemIds.has(item.id);
    const card = document.createElement('div');
    card.className = `item-card ${isSelected ? 'selected' : ''}`;
    card.dataset.id = item.id;
    card.setAttribute('draggable', 'true');

    // Format Date & Size
    const dateFormatted = formatThaiDate(item.createdAt);
    const sizeFormatted = item.isFolder ? 'โฟลเดอร์' : formatBytes(item.size);

    // Thumbnail vs Icon
    const isImg = isImageItem(item);
    let iconBoxHtml = '';
    if (isImg && item.content) {
        iconBoxHtml = `
            <div class="item-icon-box type-img">
                <img class="card-img-thumb" src="${item.content}" alt="${escapeHtml(item.name)}" loading="lazy">
            </div>
        `;
    } else {
        const iconMeta = getFileIconMeta(item);
        iconBoxHtml = `
            <div class="item-icon-box ${iconMeta.colorClass}" style="${item.color ? `color: ${item.color}` : ''}">
                <i class="${iconMeta.icon}"></i>
            </div>
        `;
    }

    // Tags HTML
    const tagsHtml = (item.tags && item.tags.length > 0)
        ? `<div class="item-tags-row">
            ${item.tags.map(t => `<span class="tag-badge">#${escapeHtml(t)}</span>`).join('')}
           </div>`
        : '';

    card.innerHTML = `
        <div class="item-checkbox" title="เลือกเอกสาร">
            <i class="fa-solid fa-check"></i>
        </div>

        <div class="item-top-actions">
            ${!item.isDeleted ? `
                <button class="btn-card-action btn-star-item ${item.isStarred ? 'active' : ''}" title="${item.isStarred ? 'ยกเลิกติดดาว' : 'ติดดาว'}">
                    <i class="fa-${item.isStarred ? 'solid' : 'regular'} fa-star"></i>
                </button>
                <button class="btn-card-action btn-download-item" title="ดาวน์โหลดเอกสาร">
                    <i class="fa-solid fa-download"></i>
                </button>
                <button class="btn-card-action btn-del-item" title="ลบเอกสาร">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            ` : `
                <button class="btn-card-action btn-restore-item" title="กู้เอกสารคืน">
                    <i class="fa-solid fa-rotate-left"></i>
                </button>
                <button class="btn-card-action btn-perm-del-item" title="ลบถาวร">
                    <i class="fa-solid fa-fire-flame-curved"></i>
                </button>
            `}
        </div>

        ${iconBoxHtml}

        <div class="item-details">
            <div class="item-name-row" title="${escapeHtml(item.name)}">
                ${escapeHtml(item.name)}
            </div>
            <div class="item-meta-row">
                <span>${dateFormatted}</span>
                <span>${sizeFormatted}</span>
            </div>
            ${tagsHtml}
        </div>
    `;

    // Checkbox Click
    const checkbox = card.querySelector('.item-checkbox');
    checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleItemSelection(item.id);
    });

    // Star Click
    const starBtn = card.querySelector('.btn-star-item');
    if (starBtn) {
        starBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleStarDocument(item.id);
        });
    }

    // Download Click (Feature 6)
    const downloadBtn = card.querySelector('.btn-download-item');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            downloadDocument(item);
        });
    }

    // Delete Click (Feature 4)
    const delBtn = card.querySelector('.btn-del-item');
    if (delBtn) {
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openDeleteConfirmModal(item, false);
        });
    }

    // Restore Click (Feature 5)
    const restoreBtn = card.querySelector('.btn-restore-item');
    if (restoreBtn) {
        restoreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            restoreDocument(item.id);
        });
    }

    // Permanent Delete Click (Feature 5)
    const permDelBtn = card.querySelector('.btn-perm-del-item');
    if (permDelBtn) {
        permDelBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openDeleteConfirmModal(item, true);
        });
    }

    // Card Primary Click (Open or View)
    card.addEventListener('click', (e) => {
        if (e.target.closest('.item-checkbox') || e.target.closest('.btn-card-action')) return;
        
        if (e.shiftKey || e.ctrlKey || e.metaKey) {
            toggleItemSelection(item.id);
        } else {
            handleOpenItem(item);
        }
    });

    // Right-Click Context Menu (Feature 8 & 9)
    card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openCustomContextMenu(e.clientX, e.clientY, item.id);
    });

    // Drag & Drop to folder
    setupCardDragAndDrop(card, item);

    return card;
}

function getFileIconMeta(item) {
    if (item.isFolder) {
        return { icon: 'fa-solid fa-folder', colorClass: 'type-folder' };
    }
    if (item.isMerged) {
        return { icon: 'fa-solid fa-object-group', colorClass: 'type-merged' };
    }
    const ext = (item.type || '').toLowerCase();
    switch (ext) {
        case 'pdf': return { icon: 'fa-solid fa-file-pdf', colorClass: 'type-pdf' };
        case 'doc':
        case 'docx': return { icon: 'fa-solid fa-file-word', colorClass: 'type-docx' };
        case 'xls':
        case 'xlsx': return { icon: 'fa-solid fa-file-excel', colorClass: 'type-xlsx' };
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'webp':
        case 'gif':
        case 'svg': return { icon: 'fa-solid fa-file-image', colorClass: 'type-img' };
        case 'md': return { icon: 'fa-solid fa-file-lines', colorClass: 'type-md' };
        default: return { icon: 'fa-solid fa-file-lines', colorClass: 'type-txt' };
    }
}

function handleOpenItem(item) {
    if (item.isFolder) {
        appState.currentFolderId = item.id;
        appState.currentView = 'all';
        appState.selectedItemIds.clear();
        renderWorkspace();
        SoundFX.play('click');
    } else if (isImageItem(item)) {
        // Open Dedicated Interactive Image Viewer!
        openImageViewer(item);
    } else {
        // Open Text/Doc Preview Viewer
        openDocumentViewer(item);
    }
}

// ==========================================================================
// 4. BREADCRUMB & HEADER UPDATES
// ==========================================================================

function updateViewHeader(itemCount) {
    let title = 'เอกสารทั้งหมด';
    let icon = 'fa-folder-open';

    if (appState.currentView === 'trash') {
        title = 'ถังขยะ (Recycle Bin)';
        icon = 'fa-trash-can';
        DOM.trashBanner.style.display = 'flex';
    } else {
        DOM.trashBanner.style.display = 'none';

        if (appState.currentFolderId) {
            const currFolder = appState.documents.find(d => d.id === appState.currentFolderId);
            title = currFolder ? currFolder.name : 'โฟลเดอร์';
            icon = 'fa-folder';
        } else if (appState.currentView === 'images') {
            title = 'คลังรูปภาพ (Images Gallery)';
            icon = 'fa-images';
        } else if (appState.currentView === 'recent') {
            title = 'เอกสารล่าสุด';
            icon = 'fa-clock-rotate-left';
        } else if (appState.currentView === 'folders') {
            title = 'โฟลเดอร์ทั้งหมด';
            icon = 'fa-folder-tree';
        } else if (appState.currentView === 'merged') {
            title = 'เอกสารที่รวมแล้ว (Merged)';
            icon = 'fa-object-group';
        } else if (appState.currentView === 'favorites') {
            title = 'รายการโปรด (ติดดาว)';
            icon = 'fa-star';
        }
    }

    DOM.currentViewTitle.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(title)}</span>`;
    DOM.itemsCountTag.textContent = `${itemCount} รายการ`;

    renderActiveFilterChips();
}

function renderBreadcrumb() {
    DOM.breadcrumbContainer.innerHTML = '';

    const rootItem = document.createElement('div');
    rootItem.className = 'breadcrumb-item';
    rootItem.innerHTML = `<i class="fa-solid fa-house"></i> <span>คลังเอกสาร</span>`;
    rootItem.addEventListener('click', () => {
        appState.currentFolderId = null;
        appState.currentView = 'all';
        renderWorkspace();
    });
    DOM.breadcrumbContainer.appendChild(rootItem);

    if (appState.currentFolderId) {
        const path = [];
        let currId = appState.currentFolderId;
        while (currId) {
            const folder = appState.documents.find(d => d.id === currId);
            if (folder) {
                path.unshift(folder);
                currId = folder.parentId;
            } else {
                break;
            }
        }

        path.forEach((folder, idx) => {
            const sep = document.createElement('span');
            sep.className = 'breadcrumb-separator';
            sep.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
            DOM.breadcrumbContainer.appendChild(sep);

            const folderItem = document.createElement('div');
            folderItem.className = 'breadcrumb-item';
            folderItem.innerHTML = `<i class="fa-solid fa-folder"></i> <span>${escapeHtml(folder.name)}</span>`;
            if (idx < path.length - 1) {
                folderItem.addEventListener('click', () => {
                    appState.currentFolderId = folder.id;
                    renderWorkspace();
                });
            }
            DOM.breadcrumbContainer.appendChild(folderItem);
        });
    }
}

function renderActiveFilterChips() {
    let chips = [];
    if (appState.searchQuery) {
        chips.push({ label: `ค้นหา: "${appState.searchQuery}"`, key: 'search' });
    }
    if (appState.dateFilter !== 'all') {
        const labels = { today: 'วันนี้', week: 'สัปดาห์นี้', month: 'เดือนนี้' };
        chips.push({ label: `ช่วงเวลา: ${labels[appState.dateFilter]}`, key: 'date' });
    }

    if (chips.length > 0) {
        DOM.activeFilterBar.style.display = 'flex';
        DOM.filterChipsContainer.innerHTML = chips.map(c => `
            <div class="filter-chip">
                <span>${escapeHtml(c.label)}</span>
                <span class="chip-close" data-key="${c.key}"><i class="fa-solid fa-xmark"></i></span>
            </div>
        `).join('');

        DOM.filterChipsContainer.querySelectorAll('.chip-close').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.dataset.key;
                if (key === 'search') {
                    appState.searchQuery = '';
                    DOM.globalSearch.value = '';
                    DOM.btnClearSearch.style.display = 'none';
                } else if (key === 'date') {
                    appState.dateFilter = 'all';
                    DOM.dateFilterMenuItems.forEach(m => m.classList.toggle('active', m.dataset.dateFilter === 'all'));
                }
                renderWorkspace();
            });
        });
    } else {
        DOM.activeFilterBar.style.display = 'none';
    }
}

function updateSidebarBadges() {
    const activeDocs = appState.documents.filter(d => !d.isDeleted);
    const trashDocs = appState.documents.filter(d => d.isDeleted);
    const images = activeDocs.filter(d => isImageItem(d));
    const folders = activeDocs.filter(d => d.isFolder);
    const merged = activeDocs.filter(d => d.isMerged);

    DOM.badgeAllCount.textContent = activeDocs.length;
    DOM.badgeImagesCount.textContent = images.length;
    DOM.badgeFoldersCount.textContent = folders.length;
    DOM.badgeMergedCount.textContent = merged.length;
    DOM.badgeTrashCount.textContent = trashDocs.length;
}

function updateStorageWidget() {
    let totalBytes = 0;
    appState.documents.forEach(d => {
        totalBytes += (d.size || 0);
        if (d.content && typeof d.content === 'string') totalBytes += (d.content.length * 2);
    });

    const maxBytes = 50 * 1024 * 1024;
    const usedMB = (totalBytes / (1024 * 1024)).toFixed(2);
    const percent = Math.min(100, Math.max(2, (totalBytes / maxBytes) * 100));

    DOM.storageUsageText.textContent = `${usedMB} MB / 50 MB`;
    DOM.storageProgressBar.style.width = `${percent}%`;
}

// ==========================================================================
// 5. INTERACTIVE IMAGE VIEWER & GALLERY ENGINE (NEW FEATURE!)
// ==========================================================================

function openImageViewer(targetItem) {
    // Gather all active non-deleted images in the current scope
    appState.currentImageList = appState.documents.filter(d => !d.isDeleted && isImageItem(d));
    
    // Find index of target image
    let index = appState.currentImageList.findIndex(d => d.id === targetItem.id);
    if (index === -1) {
        appState.currentImageList = [targetItem];
        index = 0;
    }
    appState.activeImageIndex = index;

    // Reset zoom and rotation transforms
    resetImageTransform();

    // Render active image in viewer
    renderActiveImageInViewer();

    DOM.modalImageViewer.classList.add('active');
    SoundFX.play('click');
}

function renderActiveImageInViewer() {
    if (appState.currentImageList.length === 0) {
        closeImageViewer();
        return;
    }

    const currentImg = appState.currentImageList[appState.activeImageIndex];
    if (!currentImg) return;

    DOM.imgViewerTitle.textContent = currentImg.name;
    DOM.imgViewerMainSrc.src = currentImg.content || '';

    // Calculate/format dimensions on image load
    const tempImg = new Image();
    tempImg.onload = () => {
        DOM.imgViewerDimensions.textContent = `${tempImg.naturalWidth} × ${tempImg.naturalHeight} • ${(currentImg.type || 'IMG').toUpperCase()}`;
    };
    tempImg.src = currentImg.content || '';

    // Metadata chips
    DOM.imgChipDate.innerHTML = `<i class="fa-solid fa-calendar"></i> ${formatThaiDate(currentImg.createdAt)}`;
    DOM.imgChipSize.innerHTML = `<i class="fa-solid fa-weight-hanging"></i> ${formatBytes(currentImg.size)}`;
    DOM.imgChipCounter.textContent = `${appState.activeImageIndex + 1} / ${appState.currentImageList.length}`;

    // Render Filmstrip thumbnails
    DOM.imgThumbnailsStrip.innerHTML = '';
    appState.currentImageList.forEach((img, idx) => {
        const thumbDiv = document.createElement('div');
        thumbDiv.className = `img-thumb-item ${idx === appState.activeImageIndex ? 'active' : ''}`;
        thumbDiv.innerHTML = `<img src="${img.content}" alt="${escapeHtml(img.name)}">`;
        thumbDiv.addEventListener('click', () => {
            appState.activeImageIndex = idx;
            resetImageTransform();
            renderActiveImageInViewer();
            SoundFX.play('click');
        });
        DOM.imgThumbnailsStrip.appendChild(thumbDiv);
    });

    // Auto scroll active thumbnail into view
    const activeThumb = DOM.imgThumbnailsStrip.children[appState.activeImageIndex];
    if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    applyImageTransform();
}

function resetImageTransform() {
    appState.imageZoom = 1;
    appState.imageRotation = 0;
    appState.panOffset = { x: 0, y: 0 };
    DOM.imgZoomLevelText.textContent = '100%';
    applyImageTransform();
}

function applyImageTransform() {
    DOM.imgCanvasStage.style.transform = `translate(${appState.panOffset.x}px, ${appState.panOffset.y}px) scale(${appState.imageZoom}) rotate(${appState.imageRotation}deg)`;
    DOM.imgZoomLevelText.textContent = `${Math.round(appState.imageZoom * 100)}%`;
}

function closeImageViewer() {
    DOM.modalImageViewer.classList.remove('active');
    resetImageTransform();
}

// Image Zoom Controls
DOM.btnImgZoomIn.addEventListener('click', () => {
    appState.imageZoom = Math.min(5, appState.imageZoom + 0.25);
    applyImageTransform();
    SoundFX.play('click');
});

DOM.btnImgZoomOut.addEventListener('click', () => {
    appState.imageZoom = Math.max(0.2, appState.imageZoom - 0.25);
    applyImageTransform();
    SoundFX.play('click');
});

DOM.btnImgZoomReset.addEventListener('click', () => {
    resetImageTransform();
    SoundFX.play('click');
});

// Image Rotation Controls
DOM.btnImgRotateLeft.addEventListener('click', () => {
    appState.imageRotation -= 90;
    applyImageTransform();
    SoundFX.play('click');
});

DOM.btnImgRotateRight.addEventListener('click', () => {
    appState.imageRotation += 90;
    applyImageTransform();
    SoundFX.play('click');
});

// Mouse Wheel Zoom on Viewport
DOM.imgViewerViewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
        appState.imageZoom = Math.min(5, appState.imageZoom + 0.15);
    } else {
        appState.imageZoom = Math.max(0.2, appState.imageZoom - 0.15);
    }
    applyImageTransform();
}, { passive: false });

// Pan/Drag Image when Zoomed
DOM.imgViewerViewport.addEventListener('mousedown', (e) => {
    if (e.target.closest('.btn-nav-arrow') || e.target.closest('.img-viewer-tools')) return;
    appState.isPanning = true;
    appState.panStart = { x: e.clientX - appState.panOffset.x, y: e.clientY - appState.panOffset.y };
    DOM.imgViewerViewport.classList.add('dragging');
});

window.addEventListener('mousemove', (e) => {
    if (!appState.isPanning) return;
    appState.panOffset = {
        x: e.clientX - appState.panStart.x,
        y: e.clientY - appState.panStart.y
    };
    applyImageTransform();
});

window.addEventListener('mouseup', () => {
    if (appState.isPanning) {
        appState.isPanning = false;
        DOM.imgViewerViewport.classList.remove('dragging');
    }
});

// Prev / Next Navigation
function showPrevImage() {
    if (appState.currentImageList.length <= 1) return;
    appState.activeImageIndex = (appState.activeImageIndex - 1 + appState.currentImageList.length) % appState.currentImageList.length;
    resetImageTransform();
    renderActiveImageInViewer();
    SoundFX.play('click');
}

function showNextImage() {
    if (appState.currentImageList.length <= 1) return;
    appState.activeImageIndex = (appState.activeImageIndex + 1) % appState.currentImageList.length;
    resetImageTransform();
    renderActiveImageInViewer();
    SoundFX.play('click');
}

DOM.btnImgPrev.addEventListener('click', showPrevImage);
DOM.btnImgNext.addEventListener('click', showNextImage);
DOM.btnCloseImageViewer.addEventListener('click', closeImageViewer);

DOM.btnImgDownload.addEventListener('click', () => {
    const currentImg = appState.currentImageList[appState.activeImageIndex];
    if (currentImg) downloadDocument(currentImg);
});

DOM.btnImgDelete.addEventListener('click', () => {
    const currentImg = appState.currentImageList[appState.activeImageIndex];
    if (currentImg) {
        closeImageViewer();
        openDeleteConfirmModal(currentImg, false);
    }
});

// Keyboard Shortcuts (Arrows for Nav, Esc to close)
window.addEventListener('keydown', (e) => {
    if (DOM.modalImageViewer.classList.contains('active')) {
        if (e.key === 'ArrowLeft') showPrevImage();
        if (e.key === 'ArrowRight') showNextImage();
        if (e.key === 'Escape') closeImageViewer();
    }
});

// ==========================================================================
// 6. FEATURE 4: DELETE BUTTON WITH CONFIRM / CANCEL MODAL
// ==========================================================================

function openDeleteConfirmModal(item, isPermanent = false) {
    appState.itemPendingDelete = { item, isPermanent };

    if (isPermanent) {
        DOM.modalDeleteTitle.textContent = 'ยืนยันการลบถาวร';
        DOM.modalDeleteDesc.textContent = 'คุณต้องการลบเอกสาร/รูปภาพนี้ออกจากระบบอย่างถาวรใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้';
        DOM.deleteNoticeText.textContent = 'เอกสารจะถูกลบออกจากฐานข้อมูลและหน่วยความจำอย่างสมบูรณ์';
    } else {
        DOM.modalDeleteTitle.textContent = 'ยืนยันการลบเอกสาร';
        DOM.modalDeleteDesc.textContent = 'คุณต้องการย้ายเอกสาร/รูปภาพนี้ไปยังถังขยะใช่หรือไม่?';
        DOM.deleteNoticeText.textContent = 'เอกสารจะถูกย้ายไปเก็บไว้ใน "ถังขยะ (Recycle Bin)" และสามารถกู้คืนได้ตลอดเวลา';
    }

    DOM.deleteItemName.textContent = item.name;
    DOM.modalDeleteConfirm.classList.add('active');
    SoundFX.play('click');
}

function closeDeleteConfirmModal() {
    appState.itemPendingDelete = null;
    DOM.modalDeleteConfirm.classList.remove('active');
}

DOM.btnDeleteCancel.addEventListener('click', () => {
    closeDeleteConfirmModal();
    SoundFX.play('click');
    showToast('ยกเลิกการลบเรียบร้อย เอกสารยังคงอยู่เหมือนเดิม', 'info');
});

DOM.btnDeleteConfirm.addEventListener('click', () => {
    if (!appState.itemPendingDelete) return;

    const { item, isPermanent } = appState.itemPendingDelete;

    if (isPermanent) {
        appState.documents = appState.documents.filter(d => d.id !== item.id);
        saveDocuments();
        renderWorkspace();
        SoundFX.play('delete');
        showToast(`ลบ "${item.name}" ออกจากระบบถาวรเรียบร้อยแล้ว`, 'danger');
    } else {
        item.isDeleted = true;
        item.deletedAt = new Date().toISOString();
        saveDocuments();
        renderWorkspace();
        SoundFX.play('delete');
        showToast(`ย้าย "${item.name}" ไปยังถังขยะเรียบร้อยแล้ว`, 'danger');
    }

    closeDeleteConfirmModal();
});

// ==========================================================================
// 7. FEATURE 5: RECYCLE BIN & RESTORE / PURGE ACTIONS
// ==========================================================================

function restoreDocument(itemId) {
    const item = appState.documents.find(d => d.id === itemId);
    if (item) {
        item.isDeleted = false;
        item.deletedAt = null;
        saveDocuments();
        renderWorkspace();
        SoundFX.play('restore');
        showToast(`กู้คืนเอกสาร "${item.name}" สำเร็จ นำกลับเข้าสู่คลังเอกสารแล้ว`, 'success');
    }
}

DOM.btnRestoreAll.addEventListener('click', () => {
    const trashItems = appState.documents.filter(d => d.isDeleted);
    if (trashItems.length === 0) return;

    trashItems.forEach(item => {
        item.isDeleted = false;
        item.deletedAt = null;
    });

    saveDocuments();
    renderWorkspace();
    SoundFX.play('restore');
    showToast(`กู้คืนเอกสารทั้งหมด ${trashItems.length} รายการเรียบร้อยแล้ว`, 'success');
});

DOM.btnEmptyTrash.addEventListener('click', () => {
    const trashItems = appState.documents.filter(d => d.isDeleted);
    if (trashItems.length === 0) {
        showToast('ถังขยะว่างเปล่าอยู่แล้ว', 'info');
        return;
    }

    if (confirm(`คุณต้องการลบเอกสารทั้งหมด ${trashItems.length} รายการในถังขยะอย่างถาวรใช่หรือไม่?`)) {
        appState.documents = appState.documents.filter(d => !d.isDeleted);
        saveDocuments();
        renderWorkspace();
        SoundFX.play('delete');
        showToast('ล้างถังขยะทั้งหมดเรียบร้อยแล้ว', 'danger');
    }
});

// ==========================================================================
// 8. FEATURE 6: DOWNLOAD DOCUMENT & IMAGE SYSTEM
// ==========================================================================

function downloadDocument(item) {
    try {
        let content = item.content || `เอกสาร: ${item.name}\nวันที่สร้าง: ${item.createdAt}\nระบบ OS.com`;
        let filename = item.name;

        // If it's a data URL image
        if (typeof content === 'string' && content.startsWith('data:')) {
            const a = document.createElement('a');
            a.href = content;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            SoundFX.play('success');
            showToast(`กำลังดาวน์โหลดรูปภาพ "${filename}"...`, 'success');
            return;
        }

        let mimeType = 'text/plain;charset=utf-8';
        if (item.type === 'pdf') {
            mimeType = 'application/pdf';
            if (!filename.toLowerCase().endsWith('.pdf')) filename += '.pdf';
        } else if (item.type === 'md') {
            mimeType = 'text/markdown;charset=utf-8';
            if (!filename.toLowerCase().endsWith('.md')) filename += '.md';
        } else if (item.type === 'docx') {
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            if (!filename.toLowerCase().endsWith('.docx')) filename += '.docx';
        } else if (item.type === 'xlsx') {
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            if (!filename.toLowerCase().endsWith('.xlsx')) filename += '.xlsx';
        } else if (item.type === 'txt') {
            mimeType = 'text/plain;charset=utf-8';
            if (!filename.toLowerCase().endsWith('.txt')) filename += '.txt';
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        SoundFX.play('success');
        showToast(`กำลังดาวน์โหลดเอกสาร "${filename}"...`, 'success');
    } catch (e) {
        console.error('Download error:', e);
        showToast('เกิดข้อผิดพลาดในการดาวน์โหลดเอกสาร', 'danger');
    }
}

DOM.btnDownloadSelected.addEventListener('click', () => {
    const selected = appState.documents.filter(d => appState.selectedItemIds.has(d.id));
    if (selected.length === 0) return;

    selected.forEach((item, index) => {
        setTimeout(() => downloadDocument(item), index * 300);
    });
});

// ==========================================================================
// 9. FEATURE 7: MERGE DOCUMENTS SYSTEM
// ==========================================================================

let currentMergeMode = 'folder';

function openMergeModal() {
    const selected = appState.documents.filter(d => appState.selectedItemIds.has(d.id));
    if (selected.length < 2) {
        showToast('กรุณาเลือกเอกสารอย่างน้อย 2 รายการเพื่อทำการรวม', 'info');
        return;
    }

    DOM.mergeItemsCount.textContent = selected.length;
    DOM.mergeNameInput.value = `เอกสารรวม_${new Date().toLocaleDateString('th-TH').replace(/\//g, '-')}`;
    
    DOM.mergeSelectedList.innerHTML = selected.map(item => `
        <li class="merge-selected-item">
            <i class="fa-solid ${item.isFolder ? 'fa-folder' : isImageItem(item) ? 'fa-image' : 'fa-file-lines'}"></i>
            <span>${escapeHtml(item.name)}</span>
        </li>
    `).join('');

    DOM.modalMerge.classList.add('active');
    DOM.mergeNameInput.focus();
    SoundFX.play('click');
}

DOM.mergeTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        DOM.mergeTabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMergeMode = btn.dataset.mergeMode;

        if (currentMergeMode === 'folder') {
            DOM.mergeNameLabel.textContent = 'ชื่อโฟลเดอร์สำหรับจัดเก็บชุดเอกสาร:';
            DOM.mergeNameInput.placeholder = 'เช่น โฟลเดอร์รวมเอกสารโครงการ_ชุดที่1';
        } else {
            DOM.mergeNameLabel.textContent = 'ชื่อไฟล์เอกสารรวม (.TXT / .MD):';
            DOM.mergeNameInput.placeholder = 'เช่น รวมบันทึกการประชุม_2026.txt';
        }
    });
});

DOM.btnCloseMergeModal.addEventListener('click', () => DOM.modalMerge.classList.remove('active'));
DOM.btnMergeCancel.addEventListener('click', () => DOM.modalMerge.classList.remove('active'));

DOM.btnMergeConfirm.addEventListener('click', () => {
    const name = DOM.mergeNameInput.value.trim() || `เอกสารรวม_${Date.now()}`;
    const selected = appState.documents.filter(d => appState.selectedItemIds.has(d.id));

    if (currentMergeMode === 'folder') {
        const newFolderId = 'folder-' + Date.now();
        const newFolder = {
            id: newFolderId,
            name: name,
            type: 'folder',
            content: '',
            size: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            parentId: appState.currentFolderId,
            isFolder: true,
            isMerged: true,
            isStarred: false,
            isDeleted: false,
            deletedAt: null,
            tags: ['รวมเอกสาร'],
            color: '#a855f7'
        };

        selected.forEach(item => {
            item.parentId = newFolderId;
            item.updatedAt = new Date().toISOString();
        });

        appState.documents.unshift(newFolder);
    } else {
        let mergedContent = `====================================================\n`;
        mergedContent += `เอกสารรวม: ${name}\n`;
        mergedContent += `วันที่สร้าง: ${new Date().toLocaleString('th-TH')}\n`;
        mergedContent += `จำนวนเอกสารที่นำมารวม: ${selected.length} รายการ\n`;
        mergedContent += `====================================================\n\n`;

        let totalSize = 0;
        selected.forEach((item, i) => {
            mergedContent += `\n--- [เอกสารที่ ${i + 1}: ${item.name}] ---\n`;
            mergedContent += (item.content || '(ไม่มีข้อความในเอกสารนี้)') + '\n\n';
            totalSize += (item.size || 0);
        });

        const mergedDoc = {
            id: 'doc-merged-' + Date.now(),
            name: name.endsWith('.txt') || name.endsWith('.md') ? name : name + '.txt',
            type: 'txt',
            content: mergedContent,
            size: Math.max(totalSize, mergedContent.length),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            parentId: appState.currentFolderId,
            isFolder: false,
            isMerged: true,
            isStarred: false,
            isDeleted: false,
            deletedAt: null,
            tags: ['รวมเนื้อหา']
        };

        appState.documents.unshift(mergedDoc);
    }

    saveDocuments();
    appState.selectedItemIds.clear();
    DOM.modalMerge.classList.remove('active');
    renderWorkspace();
    SoundFX.play('success');
    showToast(`รวมเอกสาร ${selected.length} รายการเป็น "${name}" สำเร็จเรียบร้อย!`, 'success');
});

DOM.btnMergeAction.addEventListener('click', openMergeModal);

// ==========================================================================
// 10. FEATURE 8: RENAME VIA RIGHT-CLICK CONTEXT MENU
// ==========================================================================

function openRenameModal(item) {
    appState.itemPendingRename = item;
    DOM.renameInput.value = item.name;
    DOM.modalRename.classList.add('active');
    DOM.renameInput.focus();
    DOM.renameInput.select();
    SoundFX.play('click');
}

function closeRenameModal() {
    appState.itemPendingRename = null;
    DOM.modalRename.classList.remove('active');
}

DOM.btnCloseRenameModal.addEventListener('click', closeRenameModal);
DOM.btnRenameCancel.addEventListener('click', closeRenameModal);

DOM.formRename.addEventListener('submit', (e) => {
    e.preventDefault();
    saveRename();
});
DOM.btnRenameSave.addEventListener('click', saveRename);

function saveRename() {
    if (!appState.itemPendingRename) return;
    const newName = DOM.renameInput.value.trim();
    if (!newName) {
        showToast('กรุณาระบุชื่อเอกสาร', 'warning');
        return;
    }

    const item = appState.itemPendingRename;
    const oldName = item.name;
    item.name = newName;
    item.updatedAt = new Date().toISOString();

    saveDocuments();
    renderWorkspace();
    closeRenameModal();
    SoundFX.play('success');
    showToast(`เปลี่ยนชื่อจาก "${oldName}" เป็น "${newName}" เรียบร้อยแล้ว`, 'success');
}

// ==========================================================================
// 11. FEATURE 9: FOLDER SYSTEM & CONTEXT MENU
// ==========================================================================

let selectedFolderColor = '#3b82f6';

function openNewFolderModal() {
    DOM.folderNameInput.value = '';
    DOM.modalNewFolder.classList.add('active');
    DOM.folderNameInput.focus();
    SoundFX.play('click');
}

function closeNewFolderModal() {
    DOM.modalNewFolder.classList.remove('active');
}

DOM.btnNewFolder.addEventListener('click', openNewFolderModal);
DOM.btnCloseFolderModal.addEventListener('click', closeNewFolderModal);
DOM.btnFolderCancel.addEventListener('click', closeNewFolderModal);

DOM.folderColorOptions.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
        DOM.folderColorOptions.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        selectedFolderColor = dot.dataset.color;
    });
});

DOM.formNewFolder.addEventListener('submit', (e) => {
    e.preventDefault();
    saveNewFolder();
});
DOM.btnFolderSave.addEventListener('click', saveNewFolder);

function saveNewFolder() {
    const name = DOM.folderNameInput.value.trim();
    if (!name) {
        showToast('กรุณาระบุชื่อโฟลเดอร์', 'warning');
        return;
    }

    const newFolder = {
        id: 'folder-' + Date.now(),
        name: name,
        type: 'folder',
        content: '',
        size: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        parentId: appState.currentFolderId,
        isFolder: true,
        isMerged: false,
        isStarred: false,
        isDeleted: false,
        deletedAt: null,
        tags: ['โฟลเดอร์'],
        color: selectedFolderColor
    };

    appState.documents.unshift(newFolder);
    saveDocuments();
    renderWorkspace();
    closeNewFolderModal();
    SoundFX.play('success');
    showToast(`สร้างโฟลเดอร์ "${name}" สำเร็จ`, 'success');
}

// Setup Context Menu (Feature 8 & 9)
function openCustomContextMenu(x, y, targetItemId = null) {
    appState.activeContextMenuTargetId = targetItemId;
    const targetItem = targetItemId ? appState.documents.find(d => d.id === targetItemId) : null;

    if (targetItem) {
        DOM.contextItemActions.style.display = 'flex';
        DOM.ctxRename.style.display = 'flex';
        
        if (targetItem.isDeleted) {
            DOM.ctxDelete.style.display = 'none';
            DOM.ctxRestore.style.display = 'flex';
            DOM.ctxDeletePermanent.style.display = 'flex';
        } else {
            DOM.ctxDelete.style.display = 'flex';
            DOM.ctxRestore.style.display = 'none';
            DOM.ctxDeletePermanent.style.display = 'none';
        }
    } else {
        DOM.contextItemActions.style.display = 'none';
        DOM.ctxDelete.style.display = 'none';
        DOM.ctxRestore.style.display = 'none';
        DOM.ctxDeletePermanent.style.display = 'none';
    }

    const menuWidth = 220;
    const menuHeight = 280;
    const posX = (x + menuWidth > window.innerWidth) ? (window.innerWidth - menuWidth - 10) : x;
    const posY = (y + menuHeight > window.innerHeight) ? (window.innerHeight - menuHeight - 10) : y;

    DOM.customContextMenu.style.left = `${posX}px`;
    DOM.customContextMenu.style.top = `${posY}px`;
    DOM.customContextMenu.style.display = 'flex';
    SoundFX.play('click');
}

function hideCustomContextMenu() {
    DOM.customContextMenu.style.display = 'none';
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('#custom-context-menu')) {
        hideCustomContextMenu();
    }
    if (!e.target.closest('.dropdown-wrapper')) {
        DOM.sortDropdownMenu.classList.remove('show');
    }
});

DOM.itemsContainer.addEventListener('contextmenu', (e) => {
    if (e.target === DOM.itemsContainer || e.target.closest('.empty-state')) {
        e.preventDefault();
        openCustomContextMenu(e.clientX, e.clientY, null);
    }
});

// Context Menu Action Handlers
DOM.ctxOpen.addEventListener('click', () => {
    hideCustomContextMenu();
    if (appState.activeContextMenuTargetId) {
        const item = appState.documents.find(d => d.id === appState.activeContextMenuTargetId);
        if (item) handleOpenItem(item);
    }
});

DOM.ctxDownload.addEventListener('click', () => {
    hideCustomContextMenu();
    if (appState.activeContextMenuTargetId) {
        const item = appState.documents.find(d => d.id === appState.activeContextMenuTargetId);
        if (item) downloadDocument(item);
    }
});

DOM.ctxStar.addEventListener('click', () => {
    hideCustomContextMenu();
    if (appState.activeContextMenuTargetId) {
        toggleStarDocument(appState.activeContextMenuTargetId);
    }
});

DOM.ctxRename.addEventListener('click', () => {
    hideCustomContextMenu();
    if (appState.activeContextMenuTargetId) {
        const item = appState.documents.find(d => d.id === appState.activeContextMenuTargetId);
        if (item) openRenameModal(item);
    }
});

DOM.ctxNewFolder.addEventListener('click', () => {
    hideCustomContextMenu();
    openNewFolderModal();
});

DOM.ctxMerge.addEventListener('click', () => {
    hideCustomContextMenu();
    if (appState.selectedItemIds.size >= 2) {
        openMergeModal();
    } else {
        showToast('กรุณาเลือกเอกสารอย่างน้อย 2 รายการก่อนกดรวมเอกสาร', 'info');
    }
});

DOM.ctxDelete.addEventListener('click', () => {
    hideCustomContextMenu();
    if (appState.activeContextMenuTargetId) {
        const item = appState.documents.find(d => d.id === appState.activeContextMenuTargetId);
        if (item) openDeleteConfirmModal(item, false);
    }
});

DOM.ctxRestore.addEventListener('click', () => {
    hideCustomContextMenu();
    if (appState.activeContextMenuTargetId) {
        restoreDocument(appState.activeContextMenuTargetId);
    }
});

DOM.ctxDeletePermanent.addEventListener('click', () => {
    hideCustomContextMenu();
    if (appState.activeContextMenuTargetId) {
        const item = appState.documents.find(d => d.id === appState.activeContextMenuTargetId);
        if (item) openDeleteConfirmModal(item, true);
    }
});

// Drag and drop into folders
function setupCardDragAndDrop(card, item) {
    card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', item.id);
        card.style.opacity = '0.5';
    });
    card.addEventListener('dragend', () => {
        card.style.opacity = '1';
    });

    if (item.isFolder) {
        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            card.style.transform = 'scale(1.05)';
            card.style.borderColor = 'var(--accent)';
        });
        card.addEventListener('dragleave', () => {
            card.style.transform = 'none';
            card.style.borderColor = '';
        });
        card.addEventListener('drop', (e) => {
            e.preventDefault();
            card.style.transform = 'none';
            card.style.borderColor = '';
            const draggedId = e.dataTransfer.getData('text/plain');
            if (draggedId && draggedId !== item.id) {
                const draggedItem = appState.documents.find(d => d.id === draggedId);
                if (draggedItem) {
                    draggedItem.parentId = item.id;
                    saveDocuments();
                    renderWorkspace();
                    SoundFX.play('success');
                    showToast(`ย้าย "${draggedItem.name}" เข้าโฟลเดอร์ "${item.name}" สำเร็จ`, 'success');
                }
            }
        });
    }
}

// ==========================================================================
// 12. FEATURE 10: THEME SWITCHER & CUSTOM WALLPAPER UPLOAD
// ==========================================================================

function initThemeSystem() {
    try {
        const savedSettings = JSON.parse(localStorage.getItem(THEME_KEY) || '{}');
        const activeTheme = savedSettings.theme || 'dark-glass';
        const blur = savedSettings.blur || 20;
        const opacity = savedSettings.opacity || 75;

        DOM.sliderBlur.value = blur;
        DOM.valBlur.textContent = `${blur}px`;
        DOM.sliderOpacity.value = opacity;
        DOM.valOpacity.textContent = `${opacity}%`;

        const customWallpaper = localStorage.getItem(CUSTOM_WALLPAPER_KEY);
        if (customWallpaper) {
            applyCustomWallpaper(customWallpaper, false);
            DOM.customWallpaperImg.src = customWallpaper;
            DOM.customWallpaperPreview.style.display = 'block';
            DOM.wallpaperUploadPlaceholder.style.display = 'none';
        } else {
            applyThemePreset(activeTheme, false);
        }

        applyGlassEffects(blur, opacity);
    } catch (e) {
        console.error('Theme init error:', e);
    }
}

function applyThemePreset(presetName, save = true) {
    document.body.dataset.theme = presetName;
    DOM.osWallpaper.style.backgroundImage = '';

    DOM.themePresetsGrid.querySelectorAll('.theme-card').forEach(card => {
        card.classList.toggle('active', card.dataset.preset === presetName);
    });

    if (save) {
        const settings = JSON.parse(localStorage.getItem(THEME_KEY) || '{}');
        settings.theme = presetName;
        localStorage.setItem(THEME_KEY, JSON.stringify(settings));
        SoundFX.play('success');
        showToast(`เปลี่ยนธีมเป็น "${presetName}" สำเร็จ`, 'info');
    }
}

function applyCustomWallpaper(dataUrl, save = true) {
    document.body.dataset.theme = 'custom';
    DOM.osWallpaper.style.backgroundImage = `url("${dataUrl}")`;

    DOM.themePresetsGrid.querySelectorAll('.theme-card').forEach(card => {
        card.classList.remove('active');
    });

    if (save) {
        try {
            localStorage.setItem(CUSTOM_WALLPAPER_KEY, dataUrl);
            const settings = JSON.parse(localStorage.getItem(THEME_KEY) || '{}');
            settings.theme = 'custom';
            localStorage.setItem(THEME_KEY, JSON.stringify(settings));
            SoundFX.play('success');
            showToast('บันทึกรูปภาพธีมส่วนตัวของคุณสำเร็จแล้ว!', 'success');
        } catch (e) {
            showToast('รูปภาพมีขนาดใหญ่เกินไปสำหรับ LocalStorage', 'danger');
        }
    }
}

function removeCustomWallpaper() {
    localStorage.removeItem(CUSTOM_WALLPAPER_KEY);
    DOM.customWallpaperImg.src = '';
    DOM.customWallpaperPreview.style.display = 'none';
    DOM.wallpaperUploadPlaceholder.style.display = 'block';
    DOM.wallpaperFileInput.value = '';

    applyThemePreset('dark-glass', true);
    showToast('ลบรูปธีมส่วนตัวแล้ว กลับสู่ธีมเริ่มต้น', 'info');
}

function applyGlassEffects(blur, opacity) {
    document.documentElement.style.setProperty('--glass-blur', `${blur}px`);
    document.documentElement.style.setProperty('--custom-opacity', `${opacity / 100}`);
}

DOM.btnOpenThemeModal.addEventListener('click', () => {
    DOM.modalTheme.classList.add('active');
    SoundFX.play('click');
});
DOM.btnCloseThemeModal.addEventListener('click', () => DOM.modalTheme.classList.remove('active'));
DOM.btnThemeDone.addEventListener('click', () => DOM.modalTheme.classList.remove('active'));

DOM.themePresetsGrid.querySelectorAll('.theme-card').forEach(card => {
    card.addEventListener('click', () => {
        const preset = card.dataset.preset;
        applyThemePreset(preset, true);
    });
});

DOM.customWallpaperDropzone.addEventListener('click', (e) => {
    if (e.target.closest('#btn-remove-wallpaper') || e.target.closest('#btn-change-wallpaper')) return;
    DOM.wallpaperFileInput.click();
});

DOM.btnChangeWallpaper.addEventListener('click', () => DOM.wallpaperFileInput.click());
DOM.btnRemoveWallpaper.addEventListener('click', removeCustomWallpaper);

DOM.wallpaperFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (PNG, JPG, WebP)', 'warning');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const dataUrl = event.target.result;
        DOM.customWallpaperImg.src = dataUrl;
        DOM.customWallpaperPreview.style.display = 'block';
        DOM.wallpaperUploadPlaceholder.style.display = 'none';
        applyCustomWallpaper(dataUrl, true);
    };
    reader.readAsDataURL(file);
});

DOM.sliderBlur.addEventListener('input', (e) => {
    const blur = e.target.value;
    DOM.valBlur.textContent = `${blur}px`;
    applyGlassEffects(blur, DOM.sliderOpacity.value);
});
DOM.sliderBlur.addEventListener('change', (e) => {
    const settings = JSON.parse(localStorage.getItem(THEME_KEY) || '{}');
    settings.blur = e.target.value;
    localStorage.setItem(THEME_KEY, JSON.stringify(settings));
});

DOM.sliderOpacity.addEventListener('input', (e) => {
    const opacity = e.target.value;
    DOM.valOpacity.textContent = `${opacity}%`;
    applyGlassEffects(DOM.sliderBlur.value, opacity);
});
DOM.sliderOpacity.addEventListener('change', (e) => {
    const settings = JSON.parse(localStorage.getItem(THEME_KEY) || '{}');
    settings.opacity = e.target.value;
    localStorage.setItem(THEME_KEY, JSON.stringify(settings));
});

// ==========================================================================
// 13. CREATE / EDIT DOCUMENT & TEXT VIEWER MODALS
// ==========================================================================

let editingDocumentId = null;

function openCreateDocModal() {
    editingDocumentId = null;
    DOM.editorModalTitle.textContent = 'สร้างเอกสารใหม่';
    DOM.docTitleInput.value = '';
    DOM.docTypeSelect.value = 'txt';
    DOM.docTagsInput.value = '';
    DOM.docContentInput.value = '';
    DOM.modalEditor.classList.add('active');
    DOM.docTitleInput.focus();
    SoundFX.play('click');
}

function openEditDocModal(item) {
    editingDocumentId = item.id;
    DOM.editorModalTitle.textContent = 'แก้ไขเอกสาร';
    DOM.docTitleInput.value = item.name;
    DOM.docTypeSelect.value = item.type || 'txt';
    DOM.docTagsInput.value = (item.tags || []).join(', ');
    DOM.docContentInput.value = item.content || '';
    DOM.modalEditor.classList.add('active');
    DOM.docTitleInput.focus();
    SoundFX.play('click');
}

DOM.btnCreateDoc.addEventListener('click', openCreateDocModal);
DOM.btnEmptyCreate.addEventListener('click', openCreateDocModal);
DOM.btnCloseEditorModal.addEventListener('click', () => DOM.modalEditor.classList.remove('active'));
DOM.btnEditorCancel.addEventListener('click', () => DOM.modalEditor.classList.remove('active'));

DOM.formEditor.addEventListener('submit', (e) => {
    e.preventDefault();
    saveDocumentFromEditor();
});
DOM.btnEditorSave.addEventListener('click', saveDocumentFromEditor);

function saveDocumentFromEditor() {
    const title = DOM.docTitleInput.value.trim();
    if (!title) {
        showToast('กรุณาระบุชื่อเอกสาร', 'warning');
        return;
    }

    const type = DOM.docTypeSelect.value;
    const content = DOM.docContentInput.value;
    const tags = DOM.docTagsInput.value.split(',').map(t => t.trim()).filter(t => t.length > 0);
    const size = new Blob([content]).size;

    if (editingDocumentId) {
        const item = appState.documents.find(d => d.id === editingDocumentId);
        if (item) {
            item.name = title;
            item.type = type;
            item.content = content;
            item.tags = tags;
            item.size = size;
            item.updatedAt = new Date().toISOString();
            showToast(`แก้ไขเอกสาร "${title}" เรียบร้อยแล้ว`, 'success');
        }
    } else {
        const newDoc = {
            id: 'doc-' + Date.now(),
            name: title,
            type: type,
            content: content,
            size: size,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            parentId: appState.currentFolderId,
            isFolder: false,
            isMerged: false,
            isStarred: false,
            isDeleted: false,
            deletedAt: null,
            tags: tags
        };
        appState.documents.unshift(newDoc);
        showToast(`สร้างเอกสาร "${title}" สำเร็จ!`, 'success');
    }

    saveDocuments();
    renderWorkspace();
    DOM.modalEditor.classList.remove('active');
    SoundFX.play('success');
}

let activeViewingItem = null;

function openDocumentViewer(item) {
    activeViewingItem = item;
    const iconMeta = getFileIconMeta(item);

    DOM.viewerTypeIcon.className = `${iconMeta.icon} ${iconMeta.colorClass}`;
    DOM.viewerDocTitle.textContent = item.name;
    DOM.viewerMetaDate.innerHTML = `<i class="fa-solid fa-calendar"></i> จัดเก็บเมื่อ: ${formatThaiDate(item.createdAt)}`;
    DOM.viewerMetaSize.innerHTML = `<i class="fa-solid fa-database"></i> ขนาด: ${formatBytes(item.size)}`;
    DOM.viewerMetaTags.innerHTML = `<i class="fa-solid fa-tags"></i> แท็ก: ${(item.tags || []).join(', ') || 'ไม่มี'}`;

    DOM.viewerContentContainer.textContent = item.content || '(เอกสารนี้ไม่มีเนื้อหาข้อความหรือเป็นไฟล์ไบนารี)';
    DOM.modalViewer.classList.add('active');
    SoundFX.play('click');
}

DOM.btnViewerClose.addEventListener('click', () => DOM.modalViewer.classList.remove('active'));
DOM.btnCloseViewerModal.addEventListener('click', () => DOM.modalViewer.classList.remove('active'));

DOM.btnViewerDownload.addEventListener('click', () => {
    if (activeViewingItem) downloadDocument(activeViewingItem);
});

DOM.btnViewerEdit.addEventListener('click', () => {
    DOM.modalViewer.classList.remove('active');
    if (activeViewingItem) openEditDocModal(activeViewingItem);
});

// ==========================================================================
// 14. FILE UPLOADS (DOCUMENTS & IMAGES)
// ==========================================================================

DOM.btnUploadFile.addEventListener('click', () => DOM.fileInputHidden.click());
DOM.btnEmptyUpload.addEventListener('click', () => DOM.fileInputHidden.click());

DOM.fileInputHidden.addEventListener('change', (e) => {
    handleUploadedFiles(e.target.files);
    DOM.fileInputHidden.value = '';
});

function handleUploadedFiles(files) {
    if (!files || files.length === 0) return;

    let count = 0;
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const ext = file.name.split('.').pop().toLowerCase();
            const newDoc = {
                id: 'doc-up-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                name: file.name,
                type: ext || 'txt',
                content: event.target.result,
                size: file.size,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                parentId: appState.currentFolderId,
                isFolder: false,
                isMerged: false,
                isStarred: false,
                isDeleted: false,
                deletedAt: null,
                tags: file.type.startsWith('image/') ? ['รูปภาพ', 'อัปโหลด'] : ['อัปโหลด']
            };

            appState.documents.unshift(newDoc);
            count++;
            if (count === files.length) {
                saveDocuments();
                renderWorkspace();
                SoundFX.play('success');
                showToast(`อัปโหลดไฟล์ ${files.length} รายการสำเร็จ!`, 'success');
            }
        };

        if (file.type.startsWith('image/') || file.name.match(/\.(png|jpg|jpeg|webp|gif|svg)$/i)) {
            reader.readAsDataURL(file);
        } else if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.json')) {
            reader.readAsText(file);
        } else {
            reader.readAsDataURL(file);
        }
    });
}

// Window Drag & Drop Overlay
window.addEventListener('dragenter', (e) => {
    if (e.dataTransfer.types.includes('Files')) {
        DOM.fileDropOverlay.classList.add('active');
    }
});

DOM.fileDropOverlay.addEventListener('dragover', (e) => e.preventDefault());
DOM.fileDropOverlay.addEventListener('dragleave', (e) => {
    if (e.relatedTarget === null || e.relatedTarget === document.body) {
        DOM.fileDropOverlay.classList.remove('active');
    }
});

DOM.fileDropOverlay.addEventListener('drop', (e) => {
    e.preventDefault();
    DOM.fileDropOverlay.classList.remove('active');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleUploadedFiles(e.dataTransfer.files);
    }
});

// ==========================================================================
// 15. SELECTION & BULK ACTIONS
// ==========================================================================

function toggleItemSelection(id) {
    if (appState.selectedItemIds.has(id)) {
        appState.selectedItemIds.delete(id);
    } else {
        appState.selectedItemIds.add(id);
    }
    renderWorkspace();
    SoundFX.play('click');
}

function updateSelectionToolbar() {
    const count = appState.selectedItemIds.size;
    if (count > 0) {
        DOM.selectedCount.textContent = count;
        DOM.btnMergeAction.style.display = count >= 2 ? 'flex' : 'none';
        DOM.btnDownloadSelected.style.display = 'flex';
        DOM.btnDeleteSelected.style.display = 'flex';
    } else {
        DOM.btnMergeAction.style.display = 'none';
        DOM.btnDownloadSelected.style.display = 'none';
        DOM.btnDeleteSelected.style.display = 'none';
    }
}

DOM.btnDeleteSelected.addEventListener('click', () => {
    const selected = appState.documents.filter(d => appState.selectedItemIds.has(d.id));
    if (selected.length === 0) return;

    if (confirm(`คุณต้องการย้ายเอกสารที่เลือกทั้ง ${selected.length} รายการไปที่ถังขยะใช่หรือไม่?`)) {
        selected.forEach(item => {
            item.isDeleted = true;
            item.deletedAt = new Date().toISOString();
        });
        appState.selectedItemIds.clear();
        saveDocuments();
        renderWorkspace();
        SoundFX.play('delete');
        showToast(`ย้ายเอกสาร ${selected.length} รายการไปยังถังขยะแล้ว`, 'danger');
    }
});

function toggleStarDocument(id) {
    const item = appState.documents.find(d => d.id === id);
    if (item) {
        item.isStarred = !item.isStarred;
        saveDocuments();
        renderWorkspace();
        SoundFX.play('click');
        showToast(item.isStarred ? `ติดดาว "${item.name}" แล้ว` : `ยกเลิกติดดาว "${item.name}" แล้ว`, 'info');
    }
}

// ==========================================================================
// 16. SEARCH & SORTING CONTROLS (Feature 1, 2, 3)
// ==========================================================================

DOM.globalSearch.addEventListener('input', (e) => {
    appState.searchQuery = e.target.value;
    DOM.btnClearSearch.style.display = appState.searchQuery ? 'block' : 'none';
    renderWorkspace();
});

DOM.btnClearSearch.addEventListener('click', () => {
    appState.searchQuery = '';
    DOM.globalSearch.value = '';
    DOM.btnClearSearch.style.display = 'none';
    DOM.globalSearch.focus();
    renderWorkspace();
});

window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        DOM.globalSearch.focus();
    }
});

DOM.dateFilterMenuItems.forEach(item => {
    item.addEventListener('click', () => {
        DOM.dateFilterMenuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        appState.dateFilter = item.dataset.dateFilter;
        renderWorkspace();
        SoundFX.play('click');
    });
});

DOM.btnSortToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    DOM.sortDropdownMenu.classList.toggle('show');
    SoundFX.play('click');
});

DOM.sortDropdownMenu.querySelectorAll('.dropdown-item').forEach(btn => {
    btn.addEventListener('click', () => {
        const sortVal = btn.dataset.sort;
        appState.sortBy = sortVal;
        
        DOM.sortDropdownMenu.querySelectorAll('.dropdown-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        DOM.currentSortLabel.textContent = `เรียงตาม: ${btn.querySelector('span').textContent}`;
        DOM.sortDropdownMenu.classList.remove('show');
        renderWorkspace();
        SoundFX.play('click');
    });
});

DOM.btnViewGrid.addEventListener('click', () => {
    appState.viewMode = 'grid';
    DOM.btnViewGrid.classList.add('active');
    DOM.btnViewList.classList.remove('active');
    renderWorkspace();
});

DOM.btnViewList.addEventListener('click', () => {
    appState.viewMode = 'list';
    DOM.btnViewList.classList.add('active');
    DOM.btnViewGrid.classList.remove('active');
    renderWorkspace();
});

DOM.sidebarMenuItems.forEach(item => {
    item.addEventListener('click', () => {
        DOM.sidebarMenuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        appState.currentView = item.dataset.view;
        appState.currentFolderId = null;
        appState.selectedItemIds.clear();
        renderWorkspace();
        SoundFX.play('click');
    });
});

DOM.btnHome.addEventListener('click', () => {
    DOM.sidebarMenuItems.forEach(i => i.classList.toggle('active', i.dataset.view === 'all'));
    appState.currentView = 'all';
    appState.currentFolderId = null;
    appState.searchQuery = '';
    DOM.globalSearch.value = '';
    DOM.btnClearSearch.style.display = 'none';
    renderWorkspace();
    SoundFX.play('click');
});

// ==========================================================================
// 17. UTILITY FUNCTIONS & SYSTEM CLOCK
// ==========================================================================

function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    DOM.clockTime.textContent = `${hours}:${minutes}`;

    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const dateStr = `${now.getDate()} ${thaiMonths[now.getMonth()]} ${now.getFullYear() + 543}`;
    DOM.clockDate.textContent = dateStr;
}

function formatThaiDate(isoString) {
    if (!isoString) return '-';
    const d = new Date(isoString);
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}, ${hours}:${mins} น.`;
}

function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'danger') icon = 'fa-circle-exclamation';

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${escapeHtml(message)}</span>
    `;

    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(40px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ==========================================================================
// 18. INITIALIZATION ON PAGE LOAD
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    loadDocuments();
    initThemeSystem();
    renderWorkspace();
    updateClock();
    setInterval(updateClock, 1000);
});
