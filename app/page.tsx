'use client';

import { useState, useCallback } from 'react';
import { Button, Tag, Card, Image } from 'antd';
import products from '@/products.json';
import {
  Product,
  startPoint,
  finishPoint,
  getPath,
} from '@/app/shortestPath';

const GRID_SIZE = 4;
const CELL_SIZE = 64;
const EDGE_OFFSET = 4;

export default function Home() {
  const [cart, setCart] = useState<Product[]>([]);
  const [optimalOrder, setOptimalOrder] = useState<Product[]>([]);
  const [steps, setSteps] = useState<Product[]>([]);

  const toggleProduct = useCallback((product: Product) => {
    setCart((prev) => {
      const exists = prev.some((p) => p.name === product.name);
      if (exists) {
        return prev.filter((p) => p.name !== product.name);
      }
      else {
        return [...prev, product];
      }
    });
  }, []);

  const isInCart = (productName: string): boolean => {
    return cart.some((p) => p.name === productName);
  };

  const handleUpdateSteps = (): void => {
    const productsList = [...cart] as Product[];
    const shortestPath = getPath(productsList as any);
    setOptimalOrder(shortestPath.shortestPathProductsOrder);
    setSteps(shortestPath.shortestPath);
  };

  const handleClearSteps = (): void => {
    setCart([]);
    setOptimalOrder([]);
    setSteps([]);
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-xl mx-auto">
        <Card className="mb-3">
          <div className="flex flex-wrap gap-1">
            {products.map((product) => (
              <Tag
                key={product.name}
                color={isInCart(product.name) ? 'blue' : 'default'}
                onClick={() => toggleProduct(product)}
                style={{ cursor: 'pointer', fontSize: 14, padding: '2px 8px', borderRadius: 4 }}
              >
                {product.icon}
              </Tag>
            ))}
          </div>
        </Card>

        <Card className="mb-3">
          <div className="flex flex-wrap gap-1">
            {cart.length === 0 ? (
              <Tag style={{ fontSize: 14, padding: '2px 8px', borderRadius: 4 }}>Your cart items will appear here</Tag>
            ) : (
              cart.map((product) => (
                <Tag
                  key={product.name}
                  color="blue"
                  closable
                  onClose={() => toggleProduct(product)}
                  style={{ fontSize: 14, padding: '2px 8px', borderRadius: 4 }}
                >
                  {product.icon}
                </Tag>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', flexDirection: "column", gap: 16, justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <strong>Shortest walk distance:</strong> {steps.length}
            </div>
            <div>
              <strong>Optimal products order:</strong>
              <div className="flex flex-wrap gap-1">
                {optimalOrder.map((product) => (
                  <Tag
                    key={product.name}
                    color="blue"
                    style={{ cursor: 'pointer', fontSize: 14, padding: '2px 8px', borderRadius: 4 }}
                  >
                    {product.icon}
                  </Tag>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <strong>Steps</strong>
              <div>{steps.length > 0 ? steps.map(s => `(${s.x},${s.y})`).join(' → ') : 'None'}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="small" type="primary" onClick={handleUpdateSteps}>Get Shortest Path</Button>
              <Button size="small" onClick={handleClearSteps}>Clear</Button>
            </div>
          </div>
          <div
            style={{
              position: 'relative',
              width: GRID_SIZE * CELL_SIZE,
              height: GRID_SIZE * CELL_SIZE,
              border: '1px solid #bbb',
              background: '#fff',
              margin: '0 auto',
              boxShadow: '0 1px 4px #eee',
            }}
          >
            <canvas
              id="pathCanvas"
              width={GRID_SIZE * CELL_SIZE}
              height={GRID_SIZE * CELL_SIZE}
              style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
            />
            {Array.from({ length: GRID_SIZE }).map((_, y) =>
              Array.from({ length: GRID_SIZE }).map((_, x) => {
                const productAtCell = cart.find(p => p.x === x && p.y === y);
                return (
                  <div
                    key={`${x}-${y}`}
                    style={{
                      position: 'absolute',
                      left: x * CELL_SIZE,
                      top: (GRID_SIZE - 1 - y) * CELL_SIZE,
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      border: '1px solid #eee',
                      background: steps.some((s) => s.x === x && s.y === y || x === 0 && y === 0) ? '#d0e2ebff' : 'transparent',
                      boxSizing: 'border-box',
                      cursor: 'pointer',
                      zIndex: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                    }}
                  >
                    <span style={{ fontSize: 13, color: '#bbb' }}>{x},{y}</span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
                      {productAtCell && (
                        <span style={{ fontSize: 20 }}>{productAtCell.icon}</span>
                      )}
                      {x === startPoint.x && y === startPoint.y && (
                        <span title="Start" style={{ fontSize: 16 }}>{startPoint.icon}</span>
                      )}
                      {x === finishPoint.x && y === finishPoint.y && (
                        <span title="Finish" style={{ fontSize: 16 }}>{finishPoint.icon}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {steps.map((step, idx) => (
              <div
                key={`step-${idx}`}
                style={{
                  position: 'absolute',
                  left: step.x * CELL_SIZE + (EDGE_OFFSET),
                  top: (GRID_SIZE - 1 - step.y) * CELL_SIZE + (EDGE_OFFSET),
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#1890ff',
                  color: '#fff',
                  fontSize: 11,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 500,
                  zIndex: 3,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px #eee',
                }}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
