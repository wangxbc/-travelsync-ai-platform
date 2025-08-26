"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [cursorType, setCursorType] = useState<'default' | 'nav' | 'button' | 'input' | 'link' | 'card' | 'logo'>('default');
  const [hoveredElement, setHoveredElement] = useState<Element | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);

    // 检测悬停状态 - 支持多种元素类型，添加防抖机制
    const handleMouseEnter = (e: MouseEvent) => {
      try {
        // 确保 target 是一个 HTMLElement
        if (!e.target || !(e.target instanceof HTMLElement)) return;
        const target = e.target as HTMLElement;

        // 防抖：如果正在动画中，跳过
        if (isAnimating) return;

        // 检查导航链接
        const navLink = target.closest?.("a[href]");
        if (navLink && navLink.closest?.("nav")) {
          const href = navLink.getAttribute("href");
          const text = navLink.textContent?.trim();
          const targetNavs = ["/planning", "/map", "/collaboration", "/analytics", "/demo"];
          const targetTexts = ["智能规划", "3D地图", "协作", "数据分析", "功能演示"];

          if (targetNavs.includes(href || "") || targetTexts.includes(text || "")) {
            if (hoveredElement !== navLink) {
              cleanupPreviousEffect();
              setIsHovering(true);
              setCursorType('nav');
              setHoveredElement(navLink);
              createAdvancedHoverEffect(navLink, 'nav');
            }
            return;
          }
        }

        // 检查按钮（包括链接按钮）
        const button = target.closest?.("button");
        const linkElement = target.closest?.("a[href]");
        const linkButton = linkElement && (
          linkElement.textContent?.includes("开始规划旅行") ||
          linkElement.textContent?.includes("查看演示") ||
          linkElement.className?.includes("bg-indigo-600") ||
          linkElement.className?.includes("bg-white")
        );

        if ((button && !button.disabled) || linkButton) {
          const element = button || linkElement;
          if (element && hoveredElement !== element) {
            cleanupPreviousEffect();
            setIsHovering(true);
            setCursorType('button');
            setHoveredElement(element);
            createAdvancedHoverEffect(element, 'button');
          }
          return;
        }

        // 检查输入框
        const input = target.closest?.("input, textarea, select");
        if (input) {
          if (hoveredElement !== input) {
            cleanupPreviousEffect();
            setIsHovering(true);
            setCursorType('input');
            setHoveredElement(input);
            createAdvancedHoverEffect(input, 'input');
          }
          return;
        }

        // 检查Logo链接（TravelSync）
        const logoLink = target.closest?.("a[href='/']");
        if (logoLink && logoLink.textContent?.includes("TravelSync")) {
          if (hoveredElement !== logoLink) {
            cleanupPreviousEffect();
            setIsHovering(true);
            setCursorType('logo');
            setHoveredElement(logoLink);
            createAdvancedHoverEffect(logoLink, 'logo');
          }
          return;
        }

        // 检查普通链接
        const link = target.closest?.("a[href]");
        if (link) {
          if (hoveredElement !== link) {
            cleanupPreviousEffect();
            setIsHovering(true);
            setCursorType('link');
            setHoveredElement(link);
            createAdvancedHoverEffect(link, 'link');
          }
          return;
        }

        // 检查特殊的交互元素（兴趣偏好选项等）- 使用更精确的选择器
        const interactiveElement = target.closest?.("label[class*='cursor-pointer']");
        if (interactiveElement) {
          // 检查是否是兴趣偏好选项
          const isInterestOption = interactiveElement.querySelector("input[type='checkbox']");
          if (isInterestOption && hoveredElement !== interactiveElement) {
            cleanupPreviousEffect();
            setIsHovering(true);
            setCursorType('card');
            setHoveredElement(interactiveElement);
            createAdvancedHoverEffect(interactiveElement, 'card');
          }
          return;
        }

        // 检查其他卡片元素
        const card = target.closest?.(".cursor-pointer, [role='button'], .hover\\:bg-gray-50");
        if (card && !card.closest("label")) { // 排除已经处理过的label元素
          if (hoveredElement !== card) {
            cleanupPreviousEffect();
            setIsHovering(true);
            setCursorType('card');
            setHoveredElement(card);
            createAdvancedHoverEffect(card, 'card');
          }
          return;
        }
      } catch (error) {
        console.warn('CustomCursor handleMouseEnter error:', error);
      }
    };

    // 清理之前的悬停效果
    const cleanupPreviousEffect = () => {
      if (hoveredElement) {
        // 清理所有动画元素
        const prevBackgroundEl = hoveredElement.querySelector(".cursor-hover-bg");
        const prevGlowEl = hoveredElement.querySelector(".cursor-hover-glow");
        const prevPulseEl = hoveredElement.querySelector(".cursor-hover-pulse");

        [prevBackgroundEl, prevGlowEl, prevPulseEl].forEach(el => {
          if (el && el.parentNode) {
            el.parentNode.removeChild(el);
          }
        });

        const prevElement = hoveredElement as HTMLElement;
        prevElement.style.overflow = "";
        prevElement.style.position = "";

        // 恢复文字元素的z-index
        const textElements = prevElement.querySelectorAll('*');
        textElements.forEach(el => {
          (el as HTMLElement).style.position = '';
          (el as HTMLElement).style.zIndex = '';
        });
      }
    };

    // 创建智能填充效果
    const createAdvancedHoverEffect = (element: Element, type: string) => {
      if (isAnimating) return;
      setIsAnimating(true);
      
      // 添加防抖延迟，避免快速切换时的闪烁
      setTimeout(() => {
        if (hoveredElement !== element) {
          setIsAnimating(false);
          return;
        }

      const linkElement = element as HTMLElement;

      // 获取元素的原始背景色和文字颜色
      const computedStyle = window.getComputedStyle(linkElement);
      const originalBg = computedStyle.backgroundColor;
      const originalColor = computedStyle.color;
      const isLightBg = isLightBackground(originalBg);

      // 根据元素类型和原始背景色智能选择填充颜色
      const getSmartColors = () => {
        switch (type) {
          case 'nav':
            return {
              fill: isLightBg ? 'rgba(79, 70, 229, 0.08)' : 'rgba(79, 70, 229, 0.15)',
              glow: 'rgba(79, 70, 229, 0.2)',
              pulse: 'rgba(79, 70, 229, 0.3)'
            };
          case 'button':
            // 对于按钮，使用更智能的颜色选择
            if (originalBg.includes('rgb(79, 70, 229)') || originalBg.includes('indigo')) {
              // 靛蓝色按钮 - 使用更深的靛蓝
              return {
                fill: 'rgba(67, 56, 202, 0.2)',
                glow: 'rgba(67, 56, 202, 0.3)',
                pulse: 'rgba(67, 56, 202, 0.4)'
              };
            } else if (originalBg.includes('rgb(255, 255, 255)') || originalBg.includes('white')) {
              // 白色按钮 - 使用淡蓝色
              return {
                fill: 'rgba(79, 70, 229, 0.06)',
                glow: 'rgba(79, 70, 229, 0.12)',
                pulse: 'rgba(79, 70, 229, 0.18)'
              };
            } else {
              // 其他按钮
              return {
                fill: isLightBg ? 'rgba(79, 70, 229, 0.08)' : 'rgba(79, 70, 229, 0.15)',
                glow: 'rgba(79, 70, 229, 0.2)',
                pulse: 'rgba(79, 70, 229, 0.25)'
              };
            }
          case 'input':
            return {
              fill: 'rgba(16, 185, 129, 0.06)',
              glow: 'rgba(16, 185, 129, 0.15)',
              pulse: 'rgba(16, 185, 129, 0.2)'
            };
          case 'link':
            return {
              fill: 'rgba(245, 101, 101, 0.06)',
              glow: 'rgba(245, 101, 101, 0.15)',
              pulse: 'rgba(245, 101, 101, 0.2)'
            };
          case 'card':
            return {
              fill: 'rgba(139, 92, 246, 0.04)',
              glow: 'rgba(139, 92, 246, 0.1)',
              pulse: 'rgba(139, 92, 246, 0.15)'
            };
          case 'logo':
            return {
              fill: 'rgba(79, 70, 229, 0.08)',
              glow: 'rgba(79, 70, 229, 0.2)',
              pulse: 'rgba(79, 70, 229, 0.3)'
            };
          default:
            return {
              fill: 'rgba(79, 70, 229, 0.06)',
              glow: 'rgba(79, 70, 229, 0.12)',
              pulse: 'rgba(79, 70, 229, 0.18)'
            };
        }
      };

      const colors = getSmartColors();

      // 设置元素样式，但不覆盖背景色
      linkElement.style.position = "relative";
      linkElement.style.overflow = "hidden";

      // 创建圆形填充背景层 - 从中心扩散的圆形效果
      const fillEl = document.createElement("div");
      fillEl.className = "cursor-hover-bg";
      fillEl.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 8px;
        height: 8px;
        background: radial-gradient(circle, ${colors.fill} 0%, ${colors.fill} 60%, transparent 100%);
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
        transform-origin: center;
        transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        z-index: -1;
        opacity: 0;
      `;

      // 创建光晕效果层
      const glowEl = document.createElement("div");
      glowEl.className = "cursor-hover-glow";
      glowEl.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 4px;
        height: 4px;
        background: ${colors.glow};
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
        transition: all 1.0s cubic-bezier(0.23, 1, 0.32, 1);
        z-index: -2;
        opacity: 0;
        filter: blur(2px);
      `;

      // 创建脉冲效果层
      const pulseEl = document.createElement("div");
      pulseEl.className = "cursor-hover-pulse";
      pulseEl.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 6px;
        height: 6px;
        background: ${colors.pulse};
        border-radius: 50%;
        transform: translate(-50%, -50%);
        z-index: -3;
        opacity: 0;
        animation: cursor-pulse 2.5s ease-in-out infinite;
      `;

      // 确保文字在最上层，但不影响透视效果
      const textElements = linkElement.querySelectorAll('*');
      textElements.forEach(el => {
        (el as HTMLElement).style.position = 'relative';
        (el as HTMLElement).style.zIndex = '2';
      });

      linkElement.appendChild(glowEl);
      linkElement.appendChild(fillEl);
      linkElement.appendChild(pulseEl);

      // 添加脉冲动画样式
      if (!document.querySelector('#cursor-pulse-style')) {
        const pulseStyle = document.createElement('style');
        pulseStyle.id = 'cursor-pulse-style';
        pulseStyle.textContent = `
          @keyframes cursor-pulse {
            0%, 100% { 
              transform: translate(-50%, -50%) scale(1); 
              opacity: 0.5; 
            }
            50% { 
              transform: translate(-50%, -50%) scale(4); 
              opacity: 0; 
            }
          }
        `;
        document.head.appendChild(pulseStyle);
      }

      // 触发动画
      requestAnimationFrame(() => {
        const rect = linkElement.getBoundingClientRect();
        const maxSize = Math.max(rect.width, rect.height) * 3.5;
        const glowSize = maxSize * 1.8;

        // 主填充动画 - 从中心扩散
        fillEl.style.width = maxSize + "px";
        fillEl.style.height = maxSize + "px";
        fillEl.style.transform = "translate(-50%, -50%) scale(1)";
        fillEl.style.opacity = "1";

        // 光晕效果 - 延迟启动
        setTimeout(() => {
          glowEl.style.width = glowSize + "px";
          glowEl.style.height = glowSize + "px";
          glowEl.style.transform = "translate(-50%, -50%) scale(1)";
          glowEl.style.opacity = "0.4";
        }, 150);

        // 脉冲效果 - 最后启动
        setTimeout(() => {
          pulseEl.style.opacity = "1";
        }, 300);

        setTimeout(() => setIsAnimating(false), 400);
      });
      }, 50); // 50ms防抖延迟
    };

    // 判断背景色是否为浅色
    const isLightBackground = (bgColor: string): boolean => {
      if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') return true;

      const rgb = bgColor.match(/\d+/g);
      if (!rgb) return true;

      const [r, g, b] = rgb.map(Number);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128;
    };

    const handleMouseLeave = (e: MouseEvent) => {
      try {
        // 确保 target 是一个 HTMLElement
        if (!e.target || !(e.target instanceof HTMLElement)) return;
        const target = e.target as HTMLElement;

        // 检查是否离开了当前悬停的元素
        const currentElement = target.closest?.("a[href], button, input, textarea, select, label[class*='cursor-pointer'], .cursor-pointer, [role='button'], .hover\\:bg-gray-50");

        if (currentElement && currentElement === hoveredElement) {
          // 添加延迟，避免在复杂元素内部移动时误触发
          setTimeout(() => {
            if (hoveredElement === currentElement) {
              resetCursorState();
            }
          }, 100);
        }
      } catch (error) {
        console.warn('CustomCursor handleMouseLeave error:', error);
      }
    };

    // 重置光标状态的函数
    const resetCursorState = () => {
      if (!hoveredElement) return;

      setIsHovering(false);
      setCursorType('default');
      setIsAnimating(false);

      // 立即清理所有动画元素，避免残留
      const backgroundEl = hoveredElement.querySelector(".cursor-hover-bg");
      const glowEl = hoveredElement.querySelector(".cursor-hover-glow");
      const pulseEl = hoveredElement.querySelector(".cursor-hover-pulse");

      // 快速退出动画
      if (backgroundEl) {
        (backgroundEl as HTMLElement).style.transition = "all 0.3s ease-out";
        (backgroundEl as HTMLElement).style.opacity = "0";
        (backgroundEl as HTMLElement).style.transform = "translate(-50%, -50%) scale(0.3)";
      }
      if (glowEl) {
        (glowEl as HTMLElement).style.transition = "all 0.25s ease-out";
        (glowEl as HTMLElement).style.opacity = "0";
        (glowEl as HTMLElement).style.transform = "translate(-50%, -50%) scale(0.2)";
      }
      if (pulseEl) {
        (pulseEl as HTMLElement).style.opacity = "0";
        (pulseEl as HTMLElement).style.animation = "none";
      }

      // 快速移除元素
      setTimeout(() => {
        [backgroundEl, glowEl, pulseEl].forEach(el => {
          if (el && el.parentNode) {
            el.parentNode.removeChild(el);
          }
        });
      }, 300);

      // 恢复默认样式
      const element = hoveredElement as HTMLElement;
      element.style.overflow = "";
      element.style.position = "";

      // 恢复文字元素的z-index
      const textElements = element.querySelectorAll('*');
      textElements.forEach(el => {
        (el as HTMLElement).style.position = '';
        (el as HTMLElement).style.zIndex = '';
      });

      setHoveredElement(null);
    };

    // 处理鼠标离开页面的情况
    const handleMouseOut = (e: MouseEvent) => {
      try {
        // 检查是否真的离开了页面
        if (!e.relatedTarget || !(e.relatedTarget instanceof Node)) {
          resetCursorState();
        }
      } catch (error) {
        console.warn('CustomCursor handleMouseOut error:', error);
      }
    };

    // 添加全局CSS样式来隐藏所有默认光标和覆盖导航hover样式
    const style = document.createElement("style");
    style.textContent = `
      * {
        cursor: none !important;
      }
      *:hover {
        cursor: none !important;
      }
      button, a, input, textarea, select, [role="button"], [tabindex] {
        cursor: none !important;
      }
      button:hover, a:hover, input:hover, textarea:hover, select:hover, [role="button"]:hover, [tabindex]:hover {
        cursor: none !important;
      }
      
      /* 只覆盖导航链接的默认hover样式，保留按钮的原始样式 */
      nav a[href]:hover {
        background-color: transparent !important;
      }
      
      /* 确保我们的动画背景在合适的层级 */
      .cursor-hover-bg,
      .cursor-hover-glow,
      .cursor-hover-pulse {
        pointer-events: none;
      }
      
      /* 防止动画元素影响布局 */
      .cursor-hover-bg::before,
      .cursor-hover-glow::before,
      .cursor-hover-pulse::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);

    // 添加悬停事件监听
    document.addEventListener("mouseenter", handleMouseEnter, true);
    document.addEventListener("mouseleave", handleMouseLeave, true);
    document.addEventListener("mouseout", handleMouseOut, true);

    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseenter", handleMouseEnter, true);
      document.removeEventListener("mouseleave", handleMouseLeave, true);
      document.removeEventListener("mouseout", handleMouseOut, true);

      // 清理所有残留的动画元素
      document.querySelectorAll('.cursor-hover-bg, .cursor-hover-glow, .cursor-hover-pulse').forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });

      // 移除添加的样式
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }

      // 移除脉冲动画样式
      const pulseStyle = document.querySelector('#cursor-pulse-style');
      if (pulseStyle && pulseStyle.parentNode) {
        pulseStyle.parentNode.removeChild(pulseStyle);
      }
    };
  }, [hoveredElement]);

  // 根据光标类型获取样式 - 柔和蓝色系现代简约风格（调整后的尺寸）
  const getCursorStyles = () => {
    switch (cursorType) {
      case 'nav':
        return {
          className: "w-6 h-6 rounded-full bg-sky-300 shadow-[0_0_14px_4px_rgba(125,211,252,0.4)]",
          scale: isHovering ? 1.5 : 1,
          mixBlendMode: "exclusion" as const,
        };
      case 'button':
        return {
          className: "w-5 h-5 rounded-full bg-sky-400 shadow-[0_0_12px_3px_rgba(56,189,248,0.5)]",
          scale: isHovering ? 1.4 : 1,
          mixBlendMode: "exclusion" as const,
        };
      case 'input':
        return {
          className: "w-4 h-4 rounded-full bg-cyan-300 shadow-[0_0_10px_3px_rgba(103,232,249,0.4)]",
          scale: isHovering ? 1.3 : 1,
          mixBlendMode: "exclusion" as const,
        };
      case 'link':
        return {
          className: "w-5 h-5 rounded-full bg-blue-300 shadow-[0_0_12px_3px_rgba(147,197,253,0.4)]",
          scale: isHovering ? 1.35 : 1,
          mixBlendMode: "exclusion" as const,
        };
      case 'card':
        return {
          className: "w-6 h-6 rounded-full bg-indigo-300 shadow-[0_0_14px_4px_rgba(165,180,252,0.3)]",
          scale: isHovering ? 1.3 : 1,
          mixBlendMode: "exclusion" as const,
        };
      case 'logo':
        return {
          className: "w-7 h-7 rounded-full bg-indigo-400 shadow-[0_0_16px_5px_rgba(79,70,229,0.5)]",
          scale: isHovering ? 1.6 : 1,
          mixBlendMode: "exclusion" as const,
        };
      default:
        return {
          className: "w-6 h-6 rounded-full bg-slate-300 shadow-[0_0_12px_4px_rgba(203,213,225,0.3)]",
          scale: 1,
          mixBlendMode: "exclusion" as const,
        };
    }
  };

  const cursorStyles = getCursorStyles();

  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 9999,
        mixBlendMode: cursorStyles.mixBlendMode,
      }}
      animate={{
        x: pos.x - (cursorType === 'input' ? 8 : cursorType === 'button' || cursorType === 'link' ? 10 : cursorType === 'logo' ? 14 : 12),
        y: pos.y - (cursorType === 'input' ? 8 : cursorType === 'button' || cursorType === 'link' ? 10 : cursorType === 'logo' ? 14 : 12),
        scale: cursorStyles.scale,
        rotate: cursorType === 'input' ? 0 : isHovering ? 180 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: cursorType === 'input' ? 600 : 500,
        damping: cursorType === 'input' ? 35 : 30,
        rotate: { duration: 0.3 },
      }}
      className={cursorStyles.className}
    />
  );
}
