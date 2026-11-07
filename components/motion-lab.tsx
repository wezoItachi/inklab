'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { Gamepad2, Pause, Play, RotateCcw, Sparkles } from 'lucide-react';
import {
  angleDifferenceDegrees,
  isRollJumpTiming,
  isRollReverse,
} from '@/lib/analysis';

type MotionPoint = { x: number; y: number };
export function MotionLab() {
  const [stick, setStick] = useState({ x: 0, y: 0 }),
    stickRef = useRef({ x: 0, y: 0 });
  const [trail, setTrail] = useState<MotionPoint[]>([{ x: 50, y: 78 }]),
    posRef = useRef({ x: 50, y: 78 });
  const [running, setRunning] = useState(true),
    runningRef = useRef(true);
  const [controller, setController] = useState('未连接'),
    [status, setStatus] = useState('先保持一个方向，再快速反向'),
    [source, setSource] = useState('键鼠');
  const [stats, setStats] = useState({
    angle: 0,
    strength: 0,
    reverse: 0,
    delay: 0,
    attempts: 0,
    success: 0,
  });
  const previousRef = useRef({ x: 0, y: -1, time: 0 }),
    reverseAtRef = useRef(0),
    sourceRef = useRef('键鼠');
  const setInput = useCallback(
    (rawX: number, rawY: number, source = '键鼠') => {
      const length = Math.hypot(rawX, rawY),
        scale = length > 1 ? 1 / length : 1;
      const x = rawX * scale,
        y = rawY * scale,
        magnitude = Math.min(1, length);
      stickRef.current = { x, y };
      setStick({ x, y });
      sourceRef.current = source;
      setSource(source);
      if (magnitude > 0.5) {
        const prev = previousRef.current;
        const difference = angleDifferenceDegrees(prev, { x, y });
        if (isRollReverse(difference, Date.now() - prev.time)) {
          reverseAtRef.current = Date.now();
          setStatus('反向完成：现在按跳跃');
        }
        previousRef.current = { x, y, time: Date.now() };
        setStats((s) => ({
          ...s,
          angle: ((Math.atan2(x, -y) * 180) / Math.PI + 360) % 360,
          strength: magnitude * 100,
          reverse: difference,
        }));
      } else setStats((s) => ({ ...s, strength: magnitude * 100 }));
    },
    [],
  );
  const jump = useCallback(() => {
    const delay = reverseAtRef.current ? Date.now() - reverseAtRef.current : 0,
      success = isRollJumpTiming(delay);
    setStats((s) => ({
      ...s,
      delay,
      attempts: s.attempts + 1,
      success: s.success + (success ? 1 : 0),
    }));
    setStatus(
      success
        ? '滚行时机命中！继续尝试稳定复现'
        : '未命中：先快速反向，再于 350ms 内跳跃',
    );
    reverseAtRef.current = 0;
  }, []);
  useEffect(() => {
    runningRef.current = running;
  }, [running]);
  useEffect(() => {
    let frame = 0,
      lastButton = false;
    const tick = () => {
      const pads = navigator.getGamepads?.() || [],
        pad = Array.from(pads).find(Boolean);
      if (pad) {
        setController(pad.id);
        const x = Math.abs(pad.axes[0] || 0) > 0.07 ? pad.axes[0] || 0 : 0,
          y = Math.abs(pad.axes[1] || 0) > 0.07 ? pad.axes[1] || 0 : 0;
        if (x || y || sourceRef.current === '手柄') setInput(x, y, '手柄');
        const pressed = !!pad.buttons[0]?.pressed;
        if (pressed && !lastButton) jump();
        lastButton = pressed;
      }
      if (runningRef.current && ++frame % 3 === 0) {
        const v = stickRef.current;
        if (Math.hypot(v.x, v.y) > 0.08) {
          const next = {
            x: Math.max(3, Math.min(97, posRef.current.x + v.x * 1.05)),
            y: Math.max(4, Math.min(96, posRef.current.y + v.y * 1.05)),
          };
          posRef.current = next;
          setTrail((t) => [...t.slice(-179), next]);
        }
      }
      id = requestAnimationFrame(tick);
    };
    let id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [jump, setInput]);
  useEffect(() => {
    const keys = new Set<string>();
    const update = () =>
      setInput(
        (keys.has('d') || keys.has('arrowright') ? 1 : 0) -
          (keys.has('a') || keys.has('arrowleft') ? 1 : 0),
        (keys.has('s') || keys.has('arrowdown') ? 1 : 0) -
          (keys.has('w') || keys.has('arrowup') ? 1 : 0),
        '键盘',
      );
    const down = (e: KeyboardEvent) => {
      if (
        ['input', 'textarea'].includes(
          (e.target as HTMLElement)?.tagName?.toLowerCase(),
        )
      )
        return;
      const key = e.key.toLowerCase();
      if (key === ' ') {
        e.preventDefault();
        jump();
        return;
      }
      keys.add(key);
      update();
    };
    const up = (e: KeyboardEvent) => {
      keys.delete(e.key.toLowerCase());
      update();
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [jump, setInput]);
  const pointer = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setInput(
      (e.clientX - r.left - r.width / 2) / (r.width * 0.42),
      (e.clientY - r.top - r.height / 2) / (r.height * 0.42),
      '触摸 / 鼠标',
    );
  };
  const reset = () => {
    posRef.current = { x: 50, y: 78 };
    setTrail([{ x: 50, y: 78 }]);
    setStats({
      angle: 0,
      strength: 0,
      reverse: 0,
      delay: 0,
      attempts: 0,
      success: 0,
    });
    setStatus('先保持一个方向，再快速反向');
  };
  const points = trail.map((p) => `${p.x},${p.y}`).join(' ');
  const currentPosition = trail.at(-1) ?? { x: 50, y: 78 };
  return (
    <section className="workspace motion-page">
      <div className="intro">
        <div>
          <em>CONTROL LAB / EXPERIMENT 01</em>
          <h1>鱿鱼滚行练习器</h1>
          <p>观察摇杆反向与跳跃时机，把操作手感转换成可以复盘的轨迹。</p>
        </div>
        <span className="version-pill">独立实验原型</span>
      </div>
      <div className="motion-grid">
        <section className="motion-controls">
          <Title n="01" text="输入设备">
            <small>三种方式任选</small>
          </Title>
          <div className="device-card">
            <Gamepad2 />
            <div>
              <b>
                {controller === '未连接'
                  ? '连接 PC 手柄即可自动识别'
                  : '手柄已连接'}
              </b>
              <small title={controller}>
                {controller === '未连接'
                  ? '也可直接使用 WASD / 方向键'
                  : controller}
              </small>
            </div>
            <span>{source}</span>
          </div>
          <Title n="02" text="模拟摇杆">
            <small>拖动圆盘，Space / 手柄 A 跳跃</small>
          </Title>
          <div
            className="stick-zone"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              pointer(e);
            }}
            onPointerMove={(e) => {
              if (e.currentTarget.hasPointerCapture(e.pointerId)) pointer(e);
            }}
            onPointerUp={(e) => {
              e.currentTarget.releasePointerCapture(e.pointerId);
              setInput(0, 0, '触摸 / 鼠标');
            }}
          >
            <i />
            <b
              style={{
                transform: `translate(calc(-50% + ${stick.x * 82}px),calc(-50% + ${stick.y * 82}px))`,
              }}
            >
              <span />
            </b>
          </div>
          <div
            className={
              'motion-status ' +
              (status.startsWith('滚行时机命中')
                ? 'success'
                : status.startsWith('未命中')
                  ? 'error'
                  : '')
            }
          >
            <span>
              {status.startsWith('滚行时机命中')
                ? '✓'
                : status.startsWith('未命中')
                  ? '×'
                  : '→'}
            </span>
            <div>
              <b>{status}</b>
              <small>建议：先向前推住，再在一次干净动作中反拉并跳跃</small>
            </div>
          </div>
          <button className="primary jump-button" onClick={jump}>
            模拟跳跃 <kbd>Space</kbd>
          </button>
        </section>
        <aside className="motion-result">
          <div className="motion-head">
            <div>
              <small>ESTIMATED MOVEMENT PATH</small>
              <h2>行动轨迹</h2>
            </div>
            <div>
              <button onClick={() => setRunning((v) => !v)}>
                {running ? <Pause size={14} /> : <Play size={14} />}{' '}
                {running ? '暂停' : '继续'}
              </button>
              <button onClick={reset}>
                <RotateCcw size={14} /> 重置
              </button>
            </div>
          </div>
          <div className="path-board">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-label="估算行动轨迹"
            >
              <defs>
                <pattern
                  id="motion-grid"
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 10 0 L 0 0 0 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth=".18"
                  />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#motion-grid)" />
              <line x1="50" y1="0" x2="50" y2="100" />
              <line x1="0" y1="50" x2="100" y2="50" />
              <polyline points={points} fill="none" />
              <circle cx={currentPosition.x} cy={currentPosition.y} r="1.8" />
            </svg>
            <span>起点</span>
            <b>当前朝向 {Math.round(stats.angle)}°</b>
          </div>
          <div className="motion-metrics">
            <div>
              <span>摇杆力度</span>
              <b>{Math.round(stats.strength)}%</b>
              <i>
                <em style={{ width: `${stats.strength}%` }} />
              </i>
            </div>
            <div>
              <span>本次反向角</span>
              <b>{Math.round(stats.reverse)}°</b>
              <small>目标 ≥ 120°</small>
            </div>
            <div>
              <span>反向 → 跳跃</span>
              <b>{stats.delay ? stats.delay + 'ms' : '—'}</b>
              <small>练习窗 ≤ 350ms</small>
            </div>
            <div>
              <span>命中次数</span>
              <b>
                {stats.success} / {stats.attempts}
              </b>
              <small>仅为练习判定</small>
            </div>
          </div>
          <div className="motion-disclaimer">
            <Sparkles size={16} />
            <p>
              <b>原型边界</b>　摇杆输入来自浏览器 Gamepad
              API；右侧角色路径是二维估算，不读取 Nintendo
              Switch、游戏画面或游戏物理。后续可接入武器重量、游速 AP
              与动作阶段模型。
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Title({
  n,
  text,
  children,
}: {
  n: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <div className="title">
      <div>
        <span>{n}</span>
        <h3>{text}</h3>
      </div>
      {children}
    </div>
  );
}
