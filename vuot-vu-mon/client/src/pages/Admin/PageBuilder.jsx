import React, { useEffect, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import presetWebpage from 'grapesjs-preset-webpage';
import basicBlocks from 'grapesjs-blocks-basic';
import formsPlugin from 'grapesjs-plugin-forms';
import './PageBuilder.css';

/**
 * PAGE BUILDER - GrapeJS Integration
 *
 * Trang này cho phép chỉnh sửa giao diện website bằng Drag & Drop
 * Giống như WordPress Elementor/Gutenberg
 *
 * Usage: /admin/builder/:pageName
 * Example: /admin/builder/home
 */

const PageBuilder = ({ pageName = 'home' }) => {
  const editorRef = useRef(null);
  const [editor, setEditor] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    // Initialize GrapeJS Editor
    const grapesEditor = grapesjs.init({
      container: '#gjs-editor',
      fromElement: false,
      height: '100vh',
      width: 'auto',
      storageManager: {
        type: 'local',
        autosave: true,
        autoload: true,
        stepsBeforeSave: 3,
        options: {
          local: {
            key: `gjs-page-${pageName}`,
          }
        }
      },

      // Canvas settings
      canvas: {
        styles: [
          // Import website's CSS để preview chính xác
          'http://localhost:5173/src/index.css',
        ],
        scripts: [],
      },

      // Device Manager - Responsive preview
      deviceManager: {
        devices: [
          {
            id: 'desktop',
            name: 'Desktop',
            width: '',
          },
          {
            id: 'tablet',
            name: 'Tablet',
            width: '768px',
            widthMedia: '992px',
          },
          {
            id: 'mobile',
            name: 'Mobile',
            width: '320px',
            widthMedia: '480px',
          },
        ]
      },

      // Panels - Toolbar buttons
      panels: {
        defaults: [
          {
            id: 'basic-actions',
            el: '.panel__basic-actions',
            buttons: [
              {
                id: 'visibility',
                active: true,
                className: 'btn-toggle-borders',
                label: '<i class="fa fa-clone"></i>',
                command: 'sw-visibility',
                attributes: { title: 'Hiện/Ẩn viền' },
              },
              {
                id: 'export',
                className: 'btn-open-export',
                label: '<i class="fa fa-code"></i>',
                command: 'export-template',
                attributes: { title: 'Xem code' },
              },
              {
                id: 'show-json',
                className: 'btn-show-json',
                label: '<i class="fa fa-file-code-o"></i>',
                context: 'show-json',
                command(editor) {
                  editor.Modal.setTitle('Components JSON')
                    .setContent(`<textarea style="width:100%; height: 250px;">
                      ${JSON.stringify(editor.getComponents(), null, 2)}
                    </textarea>`)
                    .open();
                },
                attributes: { title: 'Xem JSON' },
              },
            ],
          },
          {
            id: 'panel-devices',
            el: '.panel__devices',
            buttons: [
              {
                id: 'device-desktop',
                label: '<i class="fa fa-desktop"></i>',
                command: 'set-device-desktop',
                active: true,
                togglable: false,
                attributes: { title: 'Desktop' },
              },
              {
                id: 'device-tablet',
                label: '<i class="fa fa-tablet"></i>',
                command: 'set-device-tablet',
                togglable: false,
                attributes: { title: 'Tablet' },
              },
              {
                id: 'device-mobile',
                label: '<i class="fa fa-mobile"></i>',
                command: 'set-device-mobile',
                togglable: false,
                attributes: { title: 'Mobile' },
              },
            ],
          },
        ],
      },

      // Plugins
      plugins: [
        presetWebpage,
        basicBlocks,
        formsPlugin,
      ],

      pluginsOpts: {
        [presetWebpage]: {
          modalImportTitle: 'Nhập code',
          modalImportLabel: '<div style="margin-bottom: 10px; font-size: 13px;">Dán HTML/CSS của bạn vào đây</div>',
          modalImportContent: (editor) => editor.getHtml() + '<style>' + editor.getCss() + '</style>',
          blocksBasicOpts: {
            blocks: ['column1', 'column2', 'column3', 'column3-7', 'text', 'link', 'image', 'video'],
            flexGrid: 1,
          },
          blocks: ['link-block', 'quote', 'text-basic'],
          // Customize navbar
          navbarOpts: false,
          // Customize countdown
          countdownOpts: false,
          // Customize forms
          formsOpts: {
            blocks: ['form', 'input', 'textarea', 'select', 'button', 'label', 'checkbox', 'radio'],
          },
        },
        [basicBlocks]: {
          blocks: ['column1', 'column2', 'column3', 'text', 'link', 'image', 'video', 'map'],
          flexGrid: true,
        },
        [formsPlugin]: {
          blocks: ['form', 'input', 'textarea', 'select', 'button', 'label', 'checkbox', 'radio'],
        },
      },

      // Block Manager settings
      blockManager: {
        appendTo: '#blocks',
      },

      // Style Manager settings
      styleManager: {
        appendTo: '#styles-container',
        sectors: [
          {
            name: 'Kích thước',
            open: true,
            buildProps: ['width', 'min-width', 'height', 'min-height', 'max-width', 'max-height', 'margin', 'padding'],
          },
          {
            name: 'Văn bản',
            open: false,
            buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-decoration', 'text-shadow'],
          },
          {
            name: 'Màu sắc',
            open: false,
            buildProps: ['background-color', 'border-radius', 'border', 'box-shadow', 'background'],
          },
          {
            name: 'Flex',
            open: false,
            buildProps: ['flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'align-content', 'order', 'flex-basis', 'flex-grow', 'flex-shrink', 'align-self'],
          },
        ],
      },

      // Layer Manager
      layerManager: {
        appendTo: '#layers-container',
      },

      // Trait Manager
      traitManager: {
        appendTo: '#trait-container',
      },

      // Selector Manager
      selectorManager: {
        appendTo: '#selector-container',
      },
    });

    // Commands
    grapesEditor.Commands.add('set-device-desktop', {
      run: (editor) => editor.setDevice('Desktop'),
    });
    grapesEditor.Commands.add('set-device-tablet', {
      run: (editor) => editor.setDevice('Tablet'),
    });
    grapesEditor.Commands.add('set-device-mobile', {
      run: (editor) => editor.setDevice('Mobile'),
    });

    // Export template command
    grapesEditor.Commands.add('export-template', {
      run: (editor) => {
        const html = editor.getHtml();
        const css = editor.getCss();
        editor.Modal.setTitle('Code')
          .setContent(`
            <div style="padding: 20px;">
              <h3>HTML</h3>
              <textarea style="width:100%; height: 200px; font-family: monospace;">${html}</textarea>
              <h3 style="margin-top: 20px;">CSS</h3>
              <textarea style="width:100%; height: 200px; font-family: monospace;">${css}</textarea>
            </div>
          `)
          .open();
      },
    });

    // Load page content if exists
    const savedPage = localStorage.getItem(`page-${pageName}`);
    if (savedPage) {
      try {
        const pageData = JSON.parse(savedPage);
        grapesEditor.setComponents(pageData.html || '');
        grapesEditor.setStyle(pageData.css || '');
      } catch (error) {
        console.error('Error loading page:', error);
      }
    }

    // Auto-save on change
    grapesEditor.on('storage:store', () => {
      setLastSaved(new Date());
    });

    setEditor(grapesEditor);
    editorRef.current = grapesEditor;

    // Cleanup
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
      }
    };
  }, [pageName]);

  // Save page
  const handleSave = async () => {
    if (!editor) return;

    setIsSaving(true);
    try {
      const html = editor.getHtml();
      const css = editor.getCss();
      const components = editor.getComponents();

      const pageData = {
        html,
        css,
        components: JSON.parse(JSON.stringify(components)),
        updatedAt: new Date().toISOString(),
      };

      // Save to localStorage
      localStorage.setItem(`page-${pageName}`, JSON.stringify(pageData));

      // Download JSON file
      const blob = new Blob([JSON.stringify(pageData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pageName}-page.json`;
      a.click();
      URL.revokeObjectURL(url);

      setLastSaved(new Date());
      alert('✅ Đã lưu thành công! File JSON đã được tải xuống.');
    } catch (error) {
      console.error('Error saving page:', error);
      alert('❌ Lỗi khi lưu trang!');
    } finally {
      setIsSaving(false);
    }
  };

  // Preview
  const handlePreview = () => {
    if (!editor) return;

    const html = editor.getHtml();
    const css = editor.getCss();

    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview - ${pageName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Nunito', sans-serif; }
          ${css}
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `);
    previewWindow.document.close();
  };

  // Publish
  const handlePublish = () => {
    if (window.confirm('Bạn có chắc muốn xuất bản trang này lên website live?')) {
      handleSave();
      alert('✅ Đã xuất bản! Refresh trang web để xem thay đổi.');
    }
  };

  return (
    <div className="page-builder">
      {/* Header */}
      <div className="builder-header">
        <div className="builder-title">
          <h1>🎨 Page Builder - {pageName.charAt(0).toUpperCase() + pageName.slice(1)}</h1>
          {lastSaved && (
            <span className="last-saved">
              Lưu lần cuối: {lastSaved.toLocaleTimeString('vi-VN')}
            </span>
          )}
        </div>

        <div className="builder-actions">
          <div className="panel__devices"></div>
          <div className="panel__basic-actions"></div>

          <button className="btn-preview" onClick={handlePreview}>
            <i className="fa fa-eye"></i> Xem trước
          </button>

          <button className="btn-save" onClick={handleSave} disabled={isSaving}>
            {isSaving ? '⏳ Đang lưu...' : '💾 Lưu'}
          </button>

          <button className="btn-publish" onClick={handlePublish}>
            ✅ Xuất bản
          </button>
        </div>
      </div>

      {/* Main Editor */}
      <div className="builder-body">
        {/* Left Sidebar - Blocks & Layers */}
        <div className="builder-sidebar builder-sidebar-left">
          <div className="sidebar-tabs">
            <button className="tab-btn active" data-tab="blocks">
              📦 Blocks
            </button>
            <button className="tab-btn" data-tab="layers">
              📑 Layers
            </button>
          </div>

          <div className="tab-content active" id="blocks-tab">
            <div id="blocks"></div>
          </div>

          <div className="tab-content" id="layers-tab">
            <div id="layers-container"></div>
          </div>
        </div>

        {/* Canvas */}
        <div className="builder-canvas">
          <div id="gjs-editor"></div>
        </div>

        {/* Right Sidebar - Styles & Traits */}
        <div className="builder-sidebar builder-sidebar-right">
          <div className="sidebar-tabs">
            <button className="tab-btn active" data-tab="styles">
              🎨 Styles
            </button>
            <button className="tab-btn" data-tab="traits">
              ⚙️ Settings
            </button>
          </div>

          <div className="tab-content active" id="styles-tab">
            <div id="selector-container"></div>
            <div id="styles-container"></div>
          </div>

          <div className="tab-content" id="traits-tab">
            <div id="trait-container"></div>
          </div>
        </div>
      </div>

      {/* Tab switching logic */}
      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            const tabBtns = document.querySelectorAll('.tab-btn');
            tabBtns.forEach(btn => {
              btn.addEventListener('click', function() {
                const parent = this.closest('.builder-sidebar');
                const tabName = this.getAttribute('data-tab');

                parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                this.classList.add('active');
                parent.querySelector('#' + tabName + '-tab').classList.add('active');
              });
            });
          });
        `
      }} />
    </div>
  );
};

export default PageBuilder;
