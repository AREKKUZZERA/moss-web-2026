import { useEffect, useState } from 'react';
import { getItemTextureCandidates } from '../../utils/minecraft';

export function ItemIcon({ id, name, size = 32 }: { id: string; name: string; size?: number }) {
  const [sources, setSources] = useState<string[]>([]);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const src = sources[sourceIndex] ?? null;

  useEffect(() => {
    let active = true;
    setSources([]);
    setSourceIndex(0);
    setFailed(false);

    getItemTextureCandidates(id)
      .then((textures) => {
        if (active) {
          setSources(textures);
          setFailed(textures.length === 0);
        }
      })
      .catch(() => {
        if (active) setFailed(true);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (failed || !src) {
    return <span className="item-fallback" style={{ width: size, height: size }} />;
  }

  return (
    <img
      className="item-icon"
      src={src}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      onError={() => {
        if (sourceIndex < sources.length - 1) {
          setSourceIndex((value) => value + 1);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}
