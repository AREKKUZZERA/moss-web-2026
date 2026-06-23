import { Download, RotateCcw, Upload, X } from 'lucide-react';
import { useRef } from 'react';
import { DEFAULT_THEME, type ThemeVars, useThemeStore } from '../../store/themeStore';

const groups: Array<[string, Array<keyof ThemeVars>]> = [
  ['Фоны', ['--bg', '--bg-deep', '--s1', '--s2', '--s3', '--s4', '--s5']],
  ['Акценты', ['--acc', '--acc-2', '--grn', '--red']],
  ['Текст', ['--txt', '--txt2', '--mut']],
];
const radiusKeys = Object.keys(DEFAULT_THEME).filter((key) => key.startsWith('--radius')) as Array<keyof ThemeVars>;

function normalizeColor(value: string) {
  return value.startsWith('#') ? value : '#000000';
}

function getRadiusNumber(value: string) {
  return Number.parseFloat(value) || 0;
}

function getRadiusMax(key: keyof ThemeVars) {
  return key === '--radius-round' ? 100 : 36;
}

export function ThemeEditor({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { theme, setVar, reset, importTheme } = useThemeStore();
  const drawerRef = useRef<HTMLElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function exportCss() {
    const body = Object.entries(theme).map(([key, value]) => `  ${key}: ${value};`).join('\n');
    navigator.clipboard.writeText(`:root {\n${body}\n}`);
  }

  async function importFile(file?: File) {
    if (!file) return;
    const text = await file.text();
    importTheme(JSON.parse(text));
  }

  function handleClose() {
    if (drawerRef.current?.contains(document.activeElement)) {
      (document.activeElement as HTMLElement).blur();
    }
    onClose();
  }

  return (
    <aside ref={drawerRef} className={`theme-drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
      <div className="drawer-head">
        <div>
          <span className="crumb">Theme</span>
          <h2>Темизация</h2>
        </div>
        <button className="icon-button" type="button" onClick={handleClose} aria-label="Закрыть"><X size={18} /></button>
      </div>
      {groups.map(([title, keys]) => (
        <section className="theme-group" key={title}>
          <h3>{title}</h3>
          {keys.map((key) => (
            <label className="theme-row" key={key}>
              <span>{key}</span>
              <input type="color" value={normalizeColor(theme[key])} onChange={(e) => setVar(key, e.target.value)} />
              <input value={theme[key]} onChange={(e) => setVar(key, e.target.value)} />
            </label>
          ))}
        </section>
      ))}
      <section className="theme-group">
        <h3>Прочее</h3>
        {radiusKeys.map((key) => (
          <label className="theme-row radius-row" key={key}>
            <span>{key}</span>
            <input type="range" min="0" max={getRadiusMax(key)} value={getRadiusNumber(theme[key])} onChange={(e) => setVar(key, `${e.target.value}px`)} />
            <input value={theme[key]} onChange={(e) => setVar(key, e.target.value)} />
          </label>
        ))}
      </section>
      <div className="drawer-actions">
        <button type="button" onClick={reset}><RotateCcw size={16} /> Сбросить</button>
        <button type="button" onClick={exportCss}><Download size={16} /> CSS</button>
        <button type="button" onClick={() => fileRef.current?.click()}><Upload size={16} /> Импорт</button>
        <input ref={fileRef} hidden type="file" accept="application/json" onChange={(e) => importFile(e.target.files?.[0])} />
      </div>
      <pre className="theme-preview">{JSON.stringify(DEFAULT_THEME, null, 2).slice(0, 260)}...</pre>
    </aside>
  );
}
