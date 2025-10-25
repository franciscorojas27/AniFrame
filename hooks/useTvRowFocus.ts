import React from 'react';
import { Platform, findNodeHandle } from 'react-native';

export type TvRowRefs = React.MutableRefObject<Array<Array<React.RefObject<any>>>>;

type Params = {
  rowRefs: TvRowRefs;
  rowIndex: number;
  index: number;
  itemsLen: number;
  rowsLen: number;
  enabled?: boolean; // Forzar/omitir (por defecto solo en Android TV)
};

/**
 * Hook para navegación DPAD en filas horizontales apiladas (Android TV).
 * - Trapea izquierda/derecha en extremos (primer/último item de la fila).
 * - En onFocus, mapea arriba/abajo a la misma columna en la fila vecina si existe.
 * - Registra el ref en rowRefs[rowIndex][index] para que otras celdas puedan apuntar a él.
 */
export function useTvRowFocus({ rowRefs, rowIndex, index, itemsLen, rowsLen, enabled }: Params) {
  const isTVAndroid = (enabled ?? (Platform.OS === 'android' && Platform.isTV));

  // Ref local del item
  const ref = React.useRef<any>(null);

  // Asegurar registro en rowRefs
  React.useEffect(() => {
    if (!rowRefs.current[rowIndex]) rowRefs.current[rowIndex] = [];
    rowRefs.current[rowIndex][index] = ref;
  }, [rowRefs, rowIndex, index]);

  const isFirst = index === 0;
  const isLast = index === itemsLen - 1;

  // Trampas en extremos L/R
  React.useEffect(() => {
    if (!isTVAndroid) return;
    const node = ref.current;
    const handle = node ? findNodeHandle(node) : null;
    if (!handle || !(node as any)?.setNativeProps) return;
    const props: any = {};
    if (isFirst) props.nextFocusLeft = handle;
    if (isLast) props.nextFocusRight = handle;
    if (Object.keys(props).length) (node as any).setNativeProps(props);
  }, [isTVAndroid, isFirst, isLast]);

  // onFocus que asigna U/D a misma columna
  const onFocus = React.useCallback(() => {
    if (!isTVAndroid) return;
    const currentNode = ref.current as any;
    if (!currentNode?.setNativeProps) return;

    const setDir = (dir: 'up' | 'down', targetRow: number) => {
      const row = rowRefs.current[targetRow];
      if (!row) return null;
      const targetRef = row[Math.min(index, row.length - 1)];
      const targetNode = targetRef?.current;
      const handle = targetNode ? findNodeHandle(targetNode) : null;
      if (handle) {
        if (dir === 'up') currentNode.setNativeProps({ nextFocusUp: handle });
        else currentNode.setNativeProps({ nextFocusDown: handle });
      }
      return handle;
    };

    if (rowIndex > 0) setDir('up', rowIndex - 1);
    if (rowIndex < rowsLen - 1) setDir('down', rowIndex + 1);
  }, [isTVAndroid, rowIndex, rowsLen, rowRefs, index]);

  return { ref, onFocus } as const;
}