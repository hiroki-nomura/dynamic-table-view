import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const initialRows = 11; // ヘッダー行を含めて11行
  const initialCols = 6;  // ヘッダー列を含めて6列

  const [rows, setRows] = useState(initialRows);
  const [cols, setCols] = useState(initialCols);

  const [tableData, setTableData] = useState([]);
  const [menuPosition, setMenuPosition] = useState(null);
  const [menuType, setMenuType] = useState(null); // 'row' または 'col'
  const [targetIndex, setTargetIndex] = useState(null);

  const [editingCell, setEditingCell] = useState({ rowIndex: null, colIndex: null });
  const [editingHeader, setEditingHeader] = useState({ type: null, index: null });

  // 新たな変化点の入力用の状態
  const [newChangePoint, setNewChangePoint] = useState('');

  // ハイライトする行のインデックスを保持
  const [highlightedRow, setHighlightedRow] = useState(null);

  // 初期データを生成
  useEffect(() => {
    // 車両への影響観点のリスト
    const impactViewpoints = [
      '燃費への影響',
      '排出ガスへの影響',
      '加速性能への影響',
      'ブレーキ性能への影響',
      '操縦安定性への影響',
    ];

    // 性能変化点のリスト
    const performanceChangePoints = [
      'エンジン制御アルゴリズムの更新',
      'トランスミッションギア比の変更',
      'タイヤサイズの変更',
      'ブレーキパッド材質の変更',
      'サスペンション設定の調整',
      '空力パーツの追加',
      '電動パワーステアリングの調整',
      '排気システムの最適化',
      'ハイブリッドシステムの制御改善',
      'エアコン制御ロジックの変更',
    ];

    // ヘッダー行の作成
    const headers = [
      { text: '性能変化点', editable: false },
      ...impactViewpoints.map((vp) => ({ text: vp, editable: false })),
    ];

    // データ行の作成
    const data = performanceChangePoints.map((point) => {
      const row = [
        { text: point, editable: false },
        ...impactViewpoints.map((viewpoint) => {
          // 影響の有無をランダムに決定
          const hasImpact = Math.random() > 0.5;
          const impactText = hasImpact ? '影響あり' : '影響なし';
          const reason = hasImpact ? `${viewpoint}に改善効果` : '変更なし';
          return `${impactText}\n理由：${reason}`;
        }),
      ];
      return row;
    });

    setTableData([headers, ...data]);
  }, []);

  // セルの値を変更
  const handleCellChange = (rowIndex, colIndex, value) => {
    setTableData((prevData) => {
      const newData = [...prevData];
      newData[rowIndex][colIndex] = value;
      return newData;
    });
  };

  // セルをダブルクリックしたときの処理
  const handleCellDoubleClick = (rowIndex, colIndex) => {
    setEditingCell({ rowIndex, colIndex });
  };

  // セルの編集が終了したときの処理
  const handleCellBlur = () => {
    setEditingCell({ rowIndex: null, colIndex: null });
  };

  // ヘッダーをダブルクリックしたときの処理
  const handleHeaderDoubleClick = (type, index) => {
    const header =
      type === 'col' ? tableData[0][index] : tableData[index][0];
    if (header.editable) {
      setEditingHeader({ type, index });
    }
  };

  // ヘッダーの編集が終了したときの処理
  const handleHeaderBlur = () => {
    setEditingHeader({ type: null, index: null });
  };

  // ヘッダーの値を変更
  const handleHeaderChange = (type, index, value) => {
    setTableData((prevData) => {
      const newData = [...prevData];
      if (type === 'col') {
        newData[0][index].text = value;
      } else if (type === 'row') {
        newData[index][0].text = value;
      }
      return newData;
    });
  };

  // コンテキストメニューを表示
  const showMenu = (e, type, index) => {
    e.preventDefault();
    setMenuType(type);
    setTargetIndex(index);
    setMenuPosition({
      x: e.pageX,
      y: e.pageY,
    });
  };

  // 行を追加
  const addRow = () => {
    setTableData((prevData) => {
      const newData = [...prevData];
      const insertIndex = targetIndex + 1; // 新しい行のインデックス
      const newRow = [
        { text: `新しい性能変化点`, editable: true },
        ...Array(cols - 1).fill(''),
      ];

      newData.splice(insertIndex, 0, newRow);

      // 新しく追加した行の1列目を編集モードに設定
      setEditingHeader({ type: 'row', index: insertIndex });

      return newData;
    });

    setRows((prevRows) => prevRows + 1);

    closeMenu();
  };

  // 列を追加
  const addColumn = () => {
    setTableData((prevData) => {
      const newColIndex = targetIndex + 1;
      const newData = prevData.map((row, rowIndex) => {
        const newRow = [...row];
        if (rowIndex === 0) {
          // ヘッダー行の場合
          newRow.splice(newColIndex, 0, { text: `新しい影響観点`, editable: true });
        } else {
          // データ行の場合
          newRow.splice(newColIndex, 0, '');
        }
        return newRow;
      });

      // 新しく追加した列のヘッダーを編集モードに設定
      setEditingHeader({ type: 'col', index: newColIndex });

      return newData;
    });

    setCols((prevCols) => prevCols + 1);

    closeMenu();
  };

  // メニューを閉じる
  const closeMenu = () => {
    setMenuPosition(null);
    setMenuType(null);
    setTargetIndex(null);
  };

  // 新たな変化点を追加する処理
  const handleAddChangePoint = () => {
    if (newChangePoint.trim() === '') {
      alert('新たな変化点を入力してください。');
      return;
    }

    setTableData((prevData) => {
      const dataLength = prevData.length - 1; // ヘッダー行を除く
      if (dataLength === 0) {
        alert('データ行がありません。');
        return prevData;
      }
      const randomRowIndex = Math.floor(Math.random() * dataLength) + 1; // 1以上のインデックス

      const newData = [...prevData];
      const highlightedRowData = newData[randomRowIndex];
      const newRow = [
        { text: newChangePoint, editable: true },
        ...highlightedRowData.slice(1),
      ];

      const insertIndex = randomRowIndex + 1;
      newData.splice(insertIndex, 0, newRow);

      // 新しく追加した行のみをハイライト
      setHighlightedRow(insertIndex);

      return newData;
    });

    setNewChangePoint('');
  };

  // 画面クリック時にメニューを閉じる
  useEffect(() => {
    const handleClick = () => {
      closeMenu();
    };
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div className="App">
      <h1>変化点影響確認表</h1>
      {/* 新たな変化点の入力 */}
      <div className="new-change-point">
        <input
          type="text"
          placeholder="新たな変化点を入力"
          value={newChangePoint}
          onChange={(e) => setNewChangePoint(e.target.value)}
        />
        <button onClick={handleAddChangePoint}>追加</button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {tableData[0]?.map((header, colIndex) => (
                <th
                  key={colIndex}
                  onContextMenu={(e) => showMenu(e, 'col', colIndex)}
                  onDoubleClick={() => handleHeaderDoubleClick('col', colIndex)}
                  className="header-cell"
                >
                  {editingHeader.type === 'col' &&
                  editingHeader.index === colIndex &&
                  header.editable ? (
                    <input
                      type="text"
                      value={header.text}
                      onChange={(e) => handleHeaderChange('col', colIndex, e.target.value)}
                      onBlur={handleHeaderBlur}
                      autoFocus
                    />
                  ) : (
                    header.text
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.slice(1).map((rowData, dataRowIndex) => {
              const tableDataRowIndex = dataRowIndex + 1; // ヘッダーを含むインデックス
              const isHighlighted = highlightedRow === tableDataRowIndex;

              return (
                <tr
                  key={tableDataRowIndex}
                  className={isHighlighted ? 'highlighted' : ''}
                >
                  {rowData.map((cellData, colIndex) => {
                    const isEditingCell =
                      editingCell.rowIndex === tableDataRowIndex &&
                      editingCell.colIndex === colIndex;

                    const isEditingHeader =
                      editingHeader.type === 'row' &&
                      editingHeader.index === tableDataRowIndex &&
                      colIndex === 0 &&
                      cellData.editable;

                    if (colIndex === 0) {
                      // 性能変化点（行のヘッダー）
                      return (
                        <th
                          key={colIndex}
                          onContextMenu={(e) => showMenu(e, 'row', tableDataRowIndex)}
                          onDoubleClick={() => handleHeaderDoubleClick('row', tableDataRowIndex)}
                          className="header-cell"
                        >
                          {isEditingHeader ? (
                            <input
                              type="text"
                              value={cellData.text}
                              onChange={(e) =>
                                handleHeaderChange('row', tableDataRowIndex, e.target.value)
                              }
                              onBlur={handleHeaderBlur}
                              autoFocus
                            />
                          ) : (
                            cellData.text
                          )}
                        </th>
                      );
                    } else {
                      return (
                        <td
                          key={colIndex}
                          onDoubleClick={() =>
                            handleCellDoubleClick(tableDataRowIndex, colIndex)
                          }
                        >
                          {isEditingCell ? (
                            <textarea
                              value={cellData}
                              onChange={(e) =>
                                handleCellChange(tableDataRowIndex, colIndex, e.target.value)
                              }
                              onBlur={handleCellBlur}
                              autoFocus
                            />
                          ) : (
                            <div className="cell-display">{cellData}</div>
                          )}
                        </td>
                      );
                    }
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* メニューの表示 */}
        {menuPosition && (
          <div
            className="context-menu"
            style={{ top: menuPosition.y, left: menuPosition.x }}
          >
            {menuType === 'row' && (
              <button onClick={addRow}>行を追加</button>
            )}
            {menuType === 'col' && (
              <button onClick={addColumn}>列を追加</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
